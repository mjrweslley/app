import asyncio,json,logging,uuid
from contextlib import asynccontextmanager
from datetime import datetime,timezone,timedelta
from pathlib import Path
from fastapi import FastAPI,Depends,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select,desc,func
from sqlalchemy.orm import Session
from .config import settings
from .database import Base,engine,get_db,SessionLocal
from .models import Device,Event,EnergyReading,RoomMapping,AlertRule,AlertEvent
from .zigbee import listener,publish
from pydantic import BaseModel,Field

log=logging.getLogger("smarthome")
ROOMS=[{"id":"livingroom_main","name":"Sala de Estar","type":"livingroom","zone":"indoor"},{"id":"kitchen_main","name":"Cozinha","type":"kitchen","zone":"indoor"},{"id":"hall_entrance","name":"Hall de Entrada","type":"entrancehall","zone":"indoor"},{"id":"wc_visitors","name":"WC Visitas","type":"wc","zone":"indoor"},{"id":"stairs_main","name":"Escadas","type":"stairs","zone":"indoor"},{"id":"suite_master","name":"Suite Principal","type":"suite","zone":"private"},{"id":"closet_master","name":"Closet da Suite","type":"closet","zone":"private"},{"id":"bwc_master","name":"Casa de Banho (Suite)","type":"bwc","zone":"private"},{"id":"bedroom_kids","name":"Quarto das Crianças","type":"bedroom","zone":"private"},{"id":"bedroom_guests","name":"Quarto de Hóspedes","type":"bedroom","zone":"private"},{"id":"bwc_shared","name":"Casa de Banho (Apoio)","type":"bwc","zone":"private"},{"id":"office_main","name":"Escritório","type":"office","zone":"indoor"},{"id":"storeroom_house","name":"Arrumos","type":"storeroom","zone":"indoor"},{"id":"garage_main","name":"Garagem","type":"garage","zone":"technical"},{"id":"workshop_garage","name":"Oficina","type":"workshop","zone":"technical"},{"id":"backyard_main","name":"Quintal","type":"outdoor","zone":"outdoor"},{"id":"balcony_suite","name":"Varanda (Suite)","type":"outdoor","zone":"outdoor"},{"id":"porch_front","name":"Alpendre","type":"outdoor","zone":"outdoor"}]
class StateUpdate(BaseModel): on:bool
class PermitJoin(BaseModel): duration:int=Field(default=120,ge=1,le=254)
class EnergyInput(BaseModel):
    meter_id:str
    measurement_type:str
    value:float
    unit:str
class DevicePatch(BaseModel):
    name:str|None=None
    room_id:str|None=None
    project_room_id:str|None=None
    mapping_status:str|None=None
    position:dict|None=None

def migrate_legacy():
    device_path=Path(settings.legacy_devices_file)
    mapping_path=Path(settings.legacy_room_mappings_file)
    with SessionLocal() as db:
        if device_path.exists() and not db.scalar(select(func.count()).select_from(Device)):
            try:
                raw=json.loads(device_path.read_text(encoding="utf-8"))
                rows=raw.get("devices",[]) if isinstance(raw,dict) else raw
                for x in rows:
                    if not isinstance(x,dict) or not x.get("id"): continue
                    db.add(Device(id=x["id"],name=x.get("name") or x["id"],vendor=x.get("vendor","generic"),protocol="legacy_unverified",vendor_device_id=x.get("vendor_device_id"),room_id=x.get("room_id") or "Unknown",project_room_id=x.get("project_room_id"),mapping_status=x.get("mapping_status") or "unmatched",device_type="outlet" if x.get("type") in ("plug","outlet") else x.get("type","sensor"),state=x.get("state") or {},position=x.get("position") or {"x":0,"y":0,"z":0},online=False))
                db.commit()
                log.info("Inventário legado importado")
            except Exception:
                db.rollback()
                log.exception("Não foi possível importar devices.json")
        if mapping_path.exists() and not db.scalar(select(func.count()).select_from(RoomMapping)):
            try:
                raw_mappings=json.loads(mapping_path.read_text(encoding="utf-8"))
                values=raw_mappings.values() if isinstance(raw_mappings,dict) else raw_mappings
                for item in values:
                    if not isinstance(item,dict): continue
                    key=item.get("id") or f'{item.get("vendor","generic")}:{item.get("vendor_room_name","")}'
                    if not item.get("vendor_room_name") or not item.get("project_room_id"): continue
                    db.add(RoomMapping(id=key,vendor=item.get("vendor","generic"),vendor_room_name=item["vendor_room_name"],project_room_id=item["project_room_id"],match_mode=item.get("match_mode","manual")))
                db.commit()
                log.info("Mapeamentos de divisões legados importados")
            except Exception:
                db.rollback()
                log.exception("Não foi possível importar room_mappings.json")
@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(bind=engine); migrate_legacy()
    task=asyncio.create_task(listener()); yield
    task.cancel()
    try: await task
    except asyncio.CancelledError: pass
app=FastAPI(title="Smart Home Platform API",version="2.0.0",lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=False,allow_methods=["GET","POST","PATCH","PUT","DELETE"],allow_headers=["*"])
def serialize(d):
    return {"id":d.id,"name":d.name,"type":d.device_type,"vendor":d.vendor.lower(),"vendor_device_id":d.vendor_device_id,"room_id":d.room_id,"project_room_id":d.project_room_id,"mapping_status":d.mapping_status,"state":d.state or {},"position":d.position or {"x":0,"y":0,"z":0},"online":d.online,"created_at":d.created_at.isoformat(),"protocol":d.protocol,"model":d.model,"capabilities":d.capabilities or [],"last_seen":d.last_seen.isoformat() if d.last_seen else None}
@app.get("/")
def root(): return {"status":"online","platform":"smart-home-platform","internet_required":False}
@app.get("/api/health")
def health(): return {"status":"ok","database":"connected","messaging":"local-mqtt","internet_required":False}
@app.get("/api/devices")
def devices(db:Session=Depends(get_db)): return [serialize(d) for d in db.scalars(select(Device).order_by(Device.name)).all()]
@app.get("/api/devices/{device_id}")
def device(device_id:str,db:Session=Depends(get_db)):
    d=db.get(Device,device_id)
    if not d: raise HTTPException(404,"Dispositivo não encontrado")
    return serialize(d)
@app.patch("/api/devices/{device_id}")
def patch_device(device_id:str,body:DevicePatch,db:Session=Depends(get_db)):
    d=db.get(Device,device_id)
    if not d: raise HTTPException(404,"Dispositivo não encontrado")
    for k,v in body.model_dump(exclude_unset=True).items(): setattr(d,k,v)
    db.commit(); db.refresh(d); return serialize(d)
@app.delete("/api/devices/{device_id}")
def delete_device(device_id:str,db:Session=Depends(get_db)):
    d=db.get(Device,device_id)
    if d: db.delete(d); db.commit()
    return {"ok":True}
async def set_state(d,on):
    if d.protocol!="zigbee": raise HTTPException(409,"Dispositivo legado preservado, mas sem adaptador local ativo.")
    try: await publish(f"{settings.mqtt_topic_prefix}/{d.id}/set",{"state":"ON" if on else "OFF"})
    except Exception as e: raise HTTPException(503,"Broker MQTT indisponível") from e
    return {"ok":True,"on":on,"accepted":True}
@app.post("/api/devices/{device_id}/toggle")
async def toggle(device_id:str,db:Session=Depends(get_db)):
    d=db.get(Device,device_id)
    if not d: raise HTTPException(404,"Dispositivo não encontrado")
    await set_state(d,not bool((d.state or {}).get("on",False))); return serialize(d)
@app.patch("/api/devices/{device_id}/state")
async def update_state(device_id:str,body:StateUpdate,db:Session=Depends(get_db)):
    d=db.get(Device,device_id)
    if not d: raise HTTPException(404,"Dispositivo não encontrado")
    return await set_state(d,body.on)
@app.post("/api/zigbee/permit-join")
async def permit_join(body:PermitJoin):
    try: await publish(settings.mqtt_topic_prefix+"/bridge/request/permit_join",{"time":body.duration,"device":None})
    except Exception as e: raise HTTPException(503,"Broker MQTT indisponível") from e
    return {"accepted":True,"duration":body.duration}
@app.get("/api/summary")
def summary(db:Session=Depends(get_db)):
    ds=db.scalars(select(Device)).all()
    power=sum(float((d.state or {}).get("power_w") or 0) for d in ds)
    ts=[float(d.state["temperature"]) for d in ds if (d.state or {}).get("temperature") is not None]
    return {"rooms_count":len(ROOMS),"devices_count":len(ds),"mapped_devices_count":sum(d.mapping_status=="matched" for d in ds),"unmapped_devices_count":sum(d.mapping_status!="matched" for d in ds),"online_count":sum(d.online for d in ds),"lights_on":sum(d.device_type=="light" and bool((d.state or {}).get("on")) for d in ds),"total_power_w":power,"avg_temperature_c":sum(ts)/len(ts) if ts else None,"alerts_unacked":db.scalar(select(func.count()).select_from(AlertEvent).where(AlertEvent.acknowledged.is_(False))) or 0}
@app.get("/api/project-rooms")
def project_rooms(): return ROOMS

@app.get("/api/rooms")
def rooms_alias(): return ROOMS
@app.get("/api/room-mappings")
def room_mappings(db:Session=Depends(get_db)):
    return [{"id":m.id,"vendor":m.vendor,"vendor_room_name":m.vendor_room_name,"project_room_id":m.project_room_id,"match_mode":m.match_mode,"updated_at":m.updated_at.isoformat()} for m in db.scalars(select(RoomMapping)).all()]
@app.post("/api/room-mappings")
def create_mapping(body:dict,db:Session=Depends(get_db)):
    vendor=str(body.get("vendor","generic")); name=str(body.get("vendor_room_name","")); room=str(body.get("project_room_id",""))
    if not name or room not in {r["id"] for r in ROOMS}: raise HTTPException(422,"Mapeamento inválido")
    key=vendor+":"+name; m=RoomMapping(id=key,vendor=vendor,vendor_room_name=name,project_room_id=room,match_mode=body.get("match_mode","manual"))
    db.merge(m); db.commit(); db.refresh(m)
    return {"id":m.id,"vendor":m.vendor,"vendor_room_name":m.vendor_room_name,"project_room_id":m.project_room_id,"match_mode":m.match_mode,"updated_at":m.updated_at.isoformat()}
@app.delete("/api/room-mappings/{mapping_id}")
def delete_mapping(mapping_id:str,db:Session=Depends(get_db)):
    m=db.get(RoomMapping,mapping_id)
    if m: db.delete(m); db.commit()
    return {"ok":True}
@app.get("/api/alerts")
def alerts(db:Session=Depends(get_db)):
    return [{"id":a.id,"device_id":a.device_id,"severity":a.severity,"title":a.title,"message":a.message,"acknowledged":a.acknowledged,"created_at":a.created_at.isoformat()} for a in db.scalars(select(AlertEvent).order_by(desc(AlertEvent.created_at)).limit(100)).all()]
@app.post("/api/alerts/{alert_id}/ack")
def ack(alert_id:str,db:Session=Depends(get_db)):
    a=db.get(AlertEvent,alert_id)
    if not a: raise HTTPException(404,"Alerta não encontrado")
    a.acknowledged=True; db.commit(); return {"ok":True}
@app.get("/api/alert-rules")
def rules(device_id:str|None=None,db:Session=Depends(get_db)):
    q=select(AlertRule)
    if device_id: q=q.where(AlertRule.device_id==device_id)
    return [{"id":r.id,"device_id":r.device_id,"name":r.name,"metric":r.metric,"operator":r.operator,"threshold":r.threshold,"enabled":r.enabled,"notify":r.notify,"created_at":r.created_at.isoformat()} for r in db.scalars(q).all()]
@app.post("/api/alert-rules")
def create_rule(body:dict,db:Session=Depends(get_db)):
    r=AlertRule(id=str(uuid.uuid4()),device_id=str(body["device_id"]),name=str(body["name"]),metric=str(body["metric"]),operator=str(body["operator"]),threshold=float(body["threshold"]),enabled=bool(body.get("enabled",True)),notify=bool(body.get("notify",True)))
    db.add(r); db.commit(); db.refresh(r)
    return {"id":r.id,"device_id":r.device_id,"name":r.name,"metric":r.metric,"operator":r.operator,"threshold":r.threshold,"enabled":r.enabled,"notify":r.notify,"created_at":r.created_at.isoformat()}
@app.delete("/api/alert-rules/{rule_id}")
def delete_rule(rule_id:str,db:Session=Depends(get_db)):
    r=db.get(AlertRule,rule_id)
    if r: db.delete(r); db.commit()
    return {"ok":True}
@app.get("/api/devices/{device_id}/consumption")
def consumption(device_id:str,hours:int=24,db:Session=Depends(get_db)):
    since=datetime.now(timezone.utc)-timedelta(hours=max(1,min(hours,8760)))
    rows=db.scalars(select(EnergyReading).where(EnergyReading.meter_id==device_id,EnergyReading.created_at>=since).order_by(EnergyReading.created_at)).all()
    pts=[{"t":r.created_at.isoformat(),"power_w":r.value} for r in rows if r.measurement_type=="active_power"]
    return {"device_id":device_id,"hours":hours,"points":pts,"total_kwh":sum(r.value for r in rows if r.measurement_type=="energy_delta")}
@app.get("/api/devices/{device_id}/history/{view_type}")
def history(device_id:str,view_type:str,db:Session=Depends(get_db)):
    hours={"H":24,"D":168,"W":672,"M":720}.get(view_type.upper(),24)
    since=datetime.now(timezone.utc)-timedelta(hours=hours)
    rows=db.scalars(select(EnergyReading).where(EnergyReading.meter_id==device_id,EnergyReading.created_at>=since,EnergyReading.measurement_type=="active_power").order_by(EnergyReading.created_at)).all()
    return {"labels":[r.created_at.strftime("%d/%m %H:%M") for r in rows],"data":[r.value for r in rows]}
@app.get("/api/energy/latest")
def energy_latest(db:Session=Depends(get_db)):
    rows=db.scalars(select(EnergyReading).order_by(desc(EnergyReading.created_at)).limit(100)).all()
    return [{"meter_id":r.meter_id,"measurement_type":r.measurement_type,"value":r.value,"unit":r.unit,"created_at":r.created_at.isoformat()} for r in rows]
@app.post("/api/energy/readings")
def energy_add(body:EnergyInput,db:Session=Depends(get_db)):
    r=EnergyReading(**body.model_dump()); db.add(r); db.commit(); db.refresh(r); return {"ok":True,"id":r.id}
@app.get("/api/events")
def events(limit:int=50,db:Session=Depends(get_db)):
    rows=db.scalars(select(Event).order_by(desc(Event.created_at)).limit(max(1,min(limit,200)))).all()
    return [{"id":e.id,"topic":e.topic,"payload":e.payload,"created_at":e.created_at.isoformat()} for e in rows]
