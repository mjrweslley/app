import asyncio,json,logging
from datetime import datetime,timezone
from typing import Any
import aiomqtt
from .config import settings
from .database import SessionLocal
from .models import Device,Event
log=logging.getLogger("smarthome.zigbee")
def infer_type(p:dict[str,Any]):
    keys=set(p); caps=[]
    mapping={"state":"switch","brightness":"dimmer","temperature":"temperature","humidity":"humidity","occupancy":"motion","contact":"contact","power":"power","energy":"energy","voltage":"voltage","current":"current","position":"cover"}
    caps=[cap for key,cap in mapping.items() if key in keys]
    if keys.intersection({"temperature","humidity","occupancy","contact"}): kind="sensor"
    elif "position" in keys: kind="blind"
    elif "state" in keys: kind="light" if "brightness" in keys else "outlet"
    else: kind="sensor"
    return kind,caps
def normalize(p):
    s=dict(p)
    if isinstance(s.get("state"),str): s["on"]=s["state"].upper()=="ON"
    if "power" in s: s["power_w"]=s["power"]
    if "energy" in s: s["energy_kwh"]=s["energy"]
    return s
def upsert(name,p,meta=None):
    meta=meta or {}
    with SessionLocal() as db:
        d=db.get(Device,name) or Device(id=name,name=name)
        db.add(d); d.name=meta.get("friendly_name") or name
        d.vendor=str(meta.get("manufacturer") or meta.get("vendor") or "generic").lower()
        d.model=meta.get("model_id") or meta.get("model")
        d.vendor_device_id=meta.get("ieee_address") or name
        d.protocol="zigbee"; d.device_type,d.capabilities=infer_type(p)
        d.state=normalize(p); d.online=True; d.last_seen=datetime.now(timezone.utc); d.updated_at=datetime.now(timezone.utc)
        db.commit()
def registry(items):
    with SessionLocal() as db:
        for x in items:
            if not isinstance(x,dict): continue
            name=x.get("friendly_name") or x.get("ieee_address")
            if not name: continue
            d=db.get(Device,name) or Device(id=name,name=name); db.add(d)
            d.name=name; d.vendor=str(x.get("manufacturer") or x.get("vendor") or "generic").lower()
            d.model=x.get("model_id"); d.vendor_device_id=x.get("ieee_address") or name; d.protocol="zigbee"
            d.capabilities=[e.get("name") for e in x.get("definition",{}).get("exposes",[]) if isinstance(e,dict) and e.get("name")]
        db.commit()
def set_availability(name, payload):
    state = payload.get("state") if isinstance(payload, dict) else payload
    with SessionLocal() as db:
        device = db.get(Device, name)
        if device is not None:
            device.online = str(state).lower() == "online"
            if device.online:
                device.last_seen = datetime.now(timezone.utc)
            db.commit()

def event(topic,payload):
    with SessionLocal() as db: db.add(Event(topic=topic,payload=payload[:12000])); db.commit()
async def listener():
    while True:
        try:
            async with aiomqtt.Client(hostname=settings.mqtt_host,port=settings.mqtt_port,identifier="smart-home-api") as c:
                await c.subscribe(settings.mqtt_topic_prefix+"/#")
                async for m in c.messages:
                    topic=str(m.topic); raw=m.payload.decode(errors="replace")
                    try: p=json.loads(raw)
                    except json.JSONDecodeError: p={}
                    await asyncio.to_thread(event,topic,raw)
                    prefix=settings.mqtt_topic_prefix+"/"
                    if topic==prefix+"bridge/devices" and isinstance(p,list):
                        await asyncio.to_thread(registry,p)
                    elif topic.startswith(prefix) and topic.endswith("/availability"):
                        name=topic[len(prefix):-len("/availability")]
                        await asyncio.to_thread(set_availability,name,p)
                    elif topic.startswith(prefix) and topic.count("/") == 1 and isinstance(p,dict):
                        name=topic[len(prefix):]
                        if name!="bridge": await asyncio.to_thread(upsert,name,p)
        except asyncio.CancelledError: raise
        except Exception:
            log.exception("MQTT indisponível; retry em 5s"); await asyncio.sleep(5)
async def publish(topic,payload):
    async with aiomqtt.Client(hostname=settings.mqtt_host,port=settings.mqtt_port,identifier="smart-home-command") as c:
        await c.publish(topic,json.dumps(payload),qos=1)
