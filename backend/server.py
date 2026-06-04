from __future__ import annotations

import json
import logging
import math
import os
import sqlite3
import asyncio
import base64
import hashlib
import secrets
import struct
import uuid
import requests as req_lib
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Literal

import uvicorn
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parent
DOTENV_PATH = ROOT_DIR / ".env"
load_dotenv(DOTENV_PATH)

REQUIRED_ENV_VARS = [
    "DB_PATH_NEW", "DB_PATH_OLD", "DEVICES_FILE", "DEVICES_OLD",
    "PORT_OLD", "PORT_BACKEND", "PORT_FRONTEND", "TAPO_EMAIL", "TAPO_PASS"
]

missing_envs = [name for name in REQUIRED_ENV_VARS if not os.getenv(name)]
if missing_envs:
    # Apenas log de aviso, não cracha o servidor se faltar algo em dev
    print(f"Aviso: Faltam variáveis de ambiente no .env: {', '.join(missing_envs)}")

DB_PATH_NEW = os.environ.get("DB_PATH_NEW", "/home/mjrweslley/app/backend/history.db")
DEVICES_FILE = os.environ.get("DEVICES_FILE", "/home/mjrweslley/app/backend/devices.json")
PORT_BACKEND = int(os.environ.get("PORT_BACKEND", 8081))
TAPO_EMAIL = os.environ.get("TAPO_EMAIL", "")
TAPO_PASS = os.environ.get("TAPO_PASS", "")

ACTIVE_DB_PATH = DB_PATH_NEW
ACTIVE_DEVICES_PATH = DEVICES_FILE
ROOM_MAPPINGS_FILE = str(ROOT_DIR / "room_mappings.json")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Domotica Hub API")
api_router = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── CRIPTOGRAFIA AES-128-CBC E TAPO KLAP ──
_SBOX=bytes([0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16])
_INV_SBOX=bytes([_SBOX.index(i) for i in range(256)])
def _gmul(a,b):
    p=0
    for _ in range(8):
        if b&1: p^=a
        a=(a<<1)&0xff if not (a&0x80) else ((a<<1)&0xff)^0x1b
        b>>=1
    return p
def _sub(s): return [_SBOX[b] for b in s]
def _isub(s): return [_INV_SBOX[b] for b in s]
def _sr(s): return [s[0],s[5],s[10],s[15],s[4],s[9],s[14],s[3],s[8],s[13],s[2],s[7],s[12],s[1],s[6],s[11]]
def _isr(s): return [s[0],s[13],s[10],s[7],s[4],s[1],s[14],s[11],s[8],s[5],s[2],s[15],s[12],s[9],s[6],s[3]]
def _mc(s):
    r=[]
    for i in range(4):
        c=s[i*4:i*4+4]
        r+=[_gmul(c[0],2)^_gmul(c[1],3)^c[2]^c[3],c[0]^_gmul(c[1],2)^_gmul(c[2],3)^c[3],c[0]^c[1]^_gmul(c[2],2)^_gmul(c[3],3),_gmul(c[0],3)^c[1]^c[2]^_gmul(c[3],2)]
    return r
def _imc(s):
    r=[]
    for i in range(4):
        c=s[i*4:i*4+4]
        r+=[_gmul(c[0],14)^_gmul(c[1],11)^_gmul(c[2],13)^_gmul(c[3],9),_gmul(c[0],9)^_gmul(c[1],14)^_gmul(c[2],11)^_gmul(c[3],13),_gmul(c[0],13)^_gmul(c[1],9)^_gmul(c[2],14)^_gmul(c[3],11),_gmul(c[0],11)^_gmul(c[1],13)^_gmul(c[2],9)^_gmul(c[3],14)]
    return r
def _ark(s,rk): return [a^b for a,b in zip(s,rk)]
def _kexp(key):
    rc=[0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]; w=[list(key[i*4:i*4+4]) for i in range(4)]
    for i in range(4,44):
        t=w[i-1][:]
        if i%4==0: t=t[1:]+t[:1]; t=[_SBOX[b] for b in t]; t[0]^=rc[i//4-1]
        w.append([a^b for a,b in zip(w[i-4],t)])
    return [[b for col in w[i*4:i*4+4] for b in col] for i in range(11)]
def _enc_blk(blk,rk):
    s=_ark(list(blk),rk[0])
    for r in range(1,10): s=_sub(s);s=_sr(s);s=_mc(s);s=_ark(s,rk[r])
    return bytes(_ark(_sr(_sub(s)),rk[10]))
def _dec_blk(blk,rk):
    s=_ark(list(blk),rk[10])
    for r in range(9,0,-1): s=_isr(_isub(s));s=_ark(s,rk[r]);s=_imc(s)
    return bytes(_ark(_isr(_isub(s)),rk[0]))
def aes_cbc_enc(key,iv,data):
    rk=_kexp(key); p=16-len(data)%16; data+=bytes([p]*p); out=b""; prev=iv
    for i in range(0,len(data),16): enc=_enc_blk(bytes(x^y for x,y in zip(data[i:i+16],prev)),rk); out+=enc; prev=enc
    return out
def aes_cbc_dec(key,iv,data):
    rk=_kexp(key); out=b""; prev=iv
    for i in range(0,len(data),16): blk=data[i:i+16]; out+=bytes(x^y for x,y in zip(_dec_blk(blk,rk),prev)); prev=blk
    return out[:-out[-1]]

def _sha256(d): return hashlib.sha256(d).digest()
def _sha1(d):   return hashlib.sha1(d).digest()
def _pack(n):   return struct.pack(">i", n)

def tapo_request_klap(device_ip: str, email: str, password: str, method: str, params: dict | None = None) -> dict:
    base = f"http://{device_ip}/app"
    auth_hash = _sha256(_sha1(email.strip().lower().encode()) + _sha1(password.encode()))
    local_seed = secrets.token_bytes(16)
    session = req_lib.Session()
    try: import urllib3; urllib3.disable_warnings()
    except: pass

    r1 = session.post(f"{base}/handshake1", data=local_seed, timeout=5, verify=False)
    if r1.status_code != 200: raise Exception("H1 falhou")
    remote_seed = r1.content[:16]
    
    r2 = session.post(f"{base}/handshake2", data=_sha256(remote_seed + local_seed + auth_hash), timeout=5, verify=False, cookies=r1.cookies)
    if r2.status_code != 200: raise Exception("H2 falhou")

    enc_key = _sha256(b"lsk" + local_seed + remote_seed + auth_hash)[:16]
    sig_key = _sha256(b"ldk" + local_seed + remote_seed + auth_hash)[:28]
    iv_base = _sha256(b"iv"  + local_seed + remote_seed + auth_hash)[:12]
    seq = int.from_bytes(_sha256(b"iv"  + local_seed + remote_seed + auth_hash)[-4:], "big", signed=True) + 1

    payload = {"method": method, "requestTimeMils": int(datetime.now().timestamp() * 1000), "terminalUUID": str(uuid.uuid4())}
    if params: payload["params"] = params
        
    ciphertext = aes_cbc_enc(enc_key, iv_base + _pack(seq), json.dumps(payload).encode())
    r = session.post(f"{base}/request?seq={seq}", data=_sha256(sig_key + _pack(seq) + ciphertext) + ciphertext, headers={"Content-Type": "application/octet-stream"}, cookies=r1.cookies, timeout=5, verify=False)
    
    if r.status_code != 200: raise Exception("Request falhou")
    result = json.loads(aes_cbc_dec(enc_key, iv_base + _pack(seq), r.content[32:]))
    if result.get("error_code", 0) != 0: raise Exception(f"Tapo API error: {result}")
    return result.get("result", {})

# ── UTILITÁRIOS DB E JSON ──
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(ACTIVE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    with get_db_connection() as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS consumos (ip TEXT, timestamp DATETIME, watts REAL, kwh REAL)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_ip_time ON consumos(ip, timestamp)")
        conn.commit()

def load_json_file(path: str | Path, fallback: Any) -> Any:
    if not Path(path).exists(): return fallback
    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file) or fallback
    except: return fallback

def save_json_file(path: str | Path, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=False)

def load_devices_raw() -> dict:
    data = load_json_file(ACTIVE_DEVICES_PATH, {"devices": []})
    # Garante que devolve sempre o dicionário raiz com o Array "devices"
    if not isinstance(data, dict) or "devices" not in data:
        return {"devices": []}
    return data

def save_devices_raw(data: dict) -> None:
    save_json_file(ACTIVE_DEVICES_PATH, data)

# ── MODELOS PYDANTIC ──
class Position3D(BaseModel):
    x: float; y: float; z: float

class Device(BaseModel):
    id: str; name: str; type: Literal["light", "blind", "outlet", "climate", "sensor"]
    vendor: Literal["tapo", "shelly", "sonoff", "generic"]
    room_id: str; state: dict[str, Any]; position: Position3D
    online: bool; created_at: str; vendor_room_name: str | None = None
    project_room_id: str | None = None; mapping_status: Literal["matched", "unmatched", "manual"] = "matched"

class DeviceCreate(BaseModel):
    ip: str  # <--- OBRIGATÓRIO AGORA!
    name: str | None = None
    type: Literal["light", "blind", "outlet", "climate", "sensor"] = "outlet"
    vendor: Literal["tapo", "shelly", "sonoff", "generic"] = "tapo"
    room_id: str | None = "default"
    state: dict[str, Any] | None = None; position: Position3D | None = None
    vendor_room_name: str | None = None; project_room_id: str | None = None
    mapping_status: Literal["matched", "unmatched", "manual"] = "matched"

# ── MAPEADORES LEGAIS ──
def default_state_for_type(device_type: str) -> dict[str, Any]:
    return {"on": False, "power_w": 0} if device_type == "outlet" else {"on": False}

def map_legacy_device(device_id: str, raw: dict[str, Any]) -> Device:
    d_type = "outlet" if raw.get("type", "plug") == "plug" else raw.get("type", "outlet")
    return Device(
        id=device_id, name=raw.get("name", device_id), type=d_type, vendor=raw.get("vendor", "tapo"),
        room_id=raw.get("room_id", "default"), state=raw.get("state") or default_state_for_type(d_type),
        position=Position3D(**raw.get("position", {"x":0,"y":0,"z":0})),
        online=bool(raw.get("online", False)), created_at=raw.get("created_at", utc_now_iso()),
        vendor_room_name=raw.get("vendor_room_name"), project_room_id=raw.get("project_room_id"),
        mapping_status=raw.get("mapping_status", "matched"),
    )

def device_to_storage(device: Device, raw_existing: dict[str, Any] | None = None) -> dict[str, Any]:
    base = raw_existing.copy() if raw_existing else {}
    base.update({
        "name": device.name, "type": "plug" if device.type == "outlet" else device.type,
        "vendor": device.vendor, "room_id": device.room_id, "vendor_room_name": device.vendor_room_name,
        "project_room_id": device.project_room_id, "mapping_status": device.mapping_status,
        "state": device.state, "position": device.position.model_dump(),
        "online": device.online, "created_at": device.created_at, "alerts": base.get("alerts", []),
    })
    return base

# ── ROTAS DE DISPOSITIVOS ──
@api_router.get("/devices", response_model=list[Device])
async def list_devices() -> list[Device]:
    try:
        data = load_devices_raw()
        if not isinstance(data, dict) or "devices" not in data:
            return []
        
        devices_list = data["devices"]
        valid_devices = []
        
        for d in devices_list:
            if isinstance(d, dict):
                # Conversão on-the-fly para o Pydantic não crashar
                if d.get("type") == "plug":
                    d["type"] = "outlet"
                valid_devices.append(Device(**d))
                
        return valid_devices
    except Exception as e:
        logger.error(f"Erro ao listar dispositivos: {e}")
        return []

@api_router.post("/devices", response_model=Device)
async def create_device(body: DeviceCreate) -> Device:
    data = load_devices_raw()
    devices_list = data.get("devices", [])
    ip = body.ip

    # 1. Verifica duplicados usando a nova chave padrão 'vendor_device_id'
    if any(d.get("vendor_device_id") == ip for d in devices_list):
        raise HTTPException(status_code=400, detail="Dispositivo já existe.")

    try:
        # Comunica com a tomada
        info = tapo_request_klap(ip, TAPO_EMAIL, TAPO_PASS, "get_device_info")
        raw_name = info.get("nickname", f"Tomada {ip}")
        try: 
            name = base64.b64decode(raw_name).decode('utf-8')
        except: 
            name = raw_name

        # Cria o ID limpo esperado
        device_id = f"plug_{ip.replace('.', '_')}"

        # Nova estrutura padronizada (Exatamente igual ao plugs.py)
        new_device_raw = {
            "id": device_id,
            "vendor_device_id": ip,
            "name": name,
            "type": body.type,
            "vendor": body.vendor,
            "room_id": body.project_room_id or body.room_id or "Unknown",
            "state": default_state_for_type(body.type),
            "position": (body.position or Position3D(x=0, y=0, z=0)).model_dump(),
            "online": True,
            "created_at": utc_now_iso(),
            "vendor_room_name": body.vendor_room_name,
            "project_room_id": body.project_room_id,
            "mapping_status": body.mapping_status,
        }

        # Adiciona ao Array e guarda apenas no backend (nova localização)
        devices_list.append(new_device_raw)
        data["devices"] = devices_list
        save_devices_raw(data)

        # Devolve o objeto criado para o frontend processar
        return map_legacy_device(device_id, new_device_raw)
    except Exception as e:
        logger.error(f"Erro ao adicionar {ip}: {e}")
        raise HTTPException(status_code=502, detail=f"Falha ao comunicar com a tomada {ip}")

@api_router.post("/devices/{device_id}/toggle", response_model=Device)
async def toggle_device(device_id: str) -> Device:
    devices_data = load_devices_raw()
    raw = devices_data.get(device_id)
    if raw is None: raise HTTPException(status_code=404, detail="Device not found")
    
    device = map_legacy_device(device_id, raw)
    state = dict(device.state)
    target_on = not bool(state.get("on", False))
    
    try:
        # Envia o comando para a tomada física
        tapo_request_klap(device_id, TAPO_EMAIL, TAPO_PASS, "set_device_info", {"device_on": target_on})
        
        state["on"] = target_on
        if device.type == "outlet":
            state["power_w"] = 1200 if target_on else 0 # Placeholder visual imediato
            
        updated = device.model_copy(update={"state": state})
        devices_data[device_id] = device_to_storage(updated, raw)
        save_devices_raw(devices_data)
        return updated
    except Exception as e:
        logger.error(f"Falha Toggle {device_id}: {e}")
        raise HTTPException(status_code=502, detail="Erro de comunicação com a tomada.")

@api_router.delete("/devices/{device_id}")
async def delete_device(device_id: str) -> dict[str, bool]:
    devices_data = load_devices_raw()
    if device_id in devices_data:
        del devices_data[device_id]
        save_devices_raw(devices_data)
    return {"ok": True}

# ── ROTAS PARA O DASHBOARD (SUMMARY E ROOMS) ──

@api_router.get("/summary")
async def get_summary() -> dict:
    try:
        data = load_devices_raw()
        devices = data.get("devices", []) if isinstance(data, dict) else []
        
        # Calcula o total de watts apenas se a chave "state" e "power_w" existirem
        total_power = sum(d.get("state", {}).get("power_w", 0) for d in devices if isinstance(d, dict) and d.get("state"))
        
        return {
            "rooms_count": 0,
            "devices_count": len(devices),
            "mapped_devices_count": len([d for d in devices if d.get("mapping_status") == "matched"]),
            "unmapped_devices_count": len([d for d in devices if d.get("mapping_status") != "matched"]),
            "online_count": len([d for d in devices if d.get("online")]),
            "lights_on": 0,
            "total_power_w": total_power,
            "avg_temperature_c": None,
            "alerts_unacked": 0
        }
    except Exception as e:
        logger.error(f"Erro no summary: {e}")
        # Retorno de segurança para o frontend não encravar
        return {
            "rooms_count": 0, "devices_count": 0, "mapped_devices_count": 0,
            "unmapped_devices_count": 0, "online_count": 0, "lights_on": 0,
            "total_power_w": 0, "avg_temperature_c": None, "alerts_unacked": 0
        }

@api_router.get("/project-rooms")
async def list_project_rooms() -> list:
    return [
        # ── ZONA COMUM (Interior) ──
        {"id": "livingroom_main", "name": "Sala de Estar", "type": "livingroom", "zone": "indoor"},
        {"id": "kitchen_main", "name": "Cozinha", "type": "kitchen", "zone": "indoor"},
        {"id": "hall_entrance", "name": "Hall de Entrada", "type": "entrancehall", "zone": "indoor"},
        {"id": "wc_visitors", "name": "WC Visitas", "type": "wc", "zone": "indoor"},
        {"id": "stairs_main", "name": "Escadas", "type": "stairs", "zone": "indoor"},
        
        # ── ZONA PRIVADA (Master Suite) ──
        {"id": "suite_master", "name": "Suite Principal", "type": "suite", "zone": "private"},
        {"id": "closet_master", "name": "Closet da Suite", "type": "closet", "zone": "private"},
        {"id": "bwc_master", "name": "Casa de Banho (Suite)", "type": "bwc", "zone": "private"},
        
        # ── ZONA PRIVADA (Outros Quartos) ──
        {"id": "bedroom_kids", "name": "Quarto das Crianças", "type": "bedroom", "zone": "private"},
        {"id": "bedroom_guests", "name": "Quarto de Hóspedes", "type": "bedroom", "zone": "private"},
        {"id": "bwc_shared", "name": "Casa de Banho (Apoio)", "type": "bwc", "zone": "private"},
        
        # ── ZONA TÉCNICA / SERVIÇO ──
        {"id": "office_main", "name": "Escritório", "type": "office", "zone": "indoor"},
        {"id": "storeroom_house", "name": "Arrumos", "type": "storeroom", "zone": "indoor"},
        {"id": "garage_main", "name": "Garagem", "type": "garage", "zone": "technical"},
        {"id": "workshop_garage", "name": "Oficina", "type": "workshop", "zone": "technical"},
        
        # ── ZONA EXTERIOR ──
        {"id": "backyard_main", "name": "Quintal", "type": "outdoor", "zone": "outdoor"},
        {"id": "balcony_suite", "name": "Varanda (Suite)", "type": "outdoor", "zone": "outdoor"},
        {"id": "porch_front", "name": "Alpendre", "type": "outdoor", "zone": "outdoor"}
    ]

@api_router.get("/room-mappings")
async def list_room_mappings() -> list:
    # Rota temporária para o frontend não dar 404
    return []

# ── TRABALHADOR INVISÍVEL ──
async def background_worker() -> None:
    while True:
        data = load_devices_raw()
        devices_list = data.get("devices", [])
        
        for device in devices_list:
            ip = device.get("vendor_device_id")
            if not ip: continue
            
            try:
                # O asyncio.to_thread IMPEDE que o servidor FastAPI congele!
                usage = await asyncio.to_thread(tapo_request_klap, ip, TAPO_EMAIL, TAPO_PASS, "get_energy_usage")
                info = await asyncio.to_thread(tapo_request_klap, ip, TAPO_EMAIL, TAPO_PASS, "get_device_info")

                watts = usage.get("current_power", 0) / 1000.0
                kwh = usage.get("today_energy", 0) / 1000.0
                device_on = info.get("device_on", False)

                # Atualiza os estados no JSON dinâmico
                device["online"] = True
                device["state"]["on"] = device_on
                device["state"]["power_w"] = watts
                device["state"]["energy_kwh"] = kwh

                # Guarda histórico
                with get_db_connection() as conn:
                    conn.execute("INSERT INTO consumos (ip, timestamp, watts, kwh) VALUES (?, datetime('now'), ?, ?)", (ip, watts, kwh))
                    conn.commit()

            except Exception as e:
                device["online"] = False

        data["devices"] = devices_list
        save_devices_raw(data)
        
        await asyncio.sleep(60)

# -- CONFIRMAR HEATH --
@app.get("/")
async def root():
    return {"status": "online", "message": "SmartHome API a correr perfeitamente!"}

app.include_router(api_router)

@app.on_event("startup")
async def on_startup() -> None:
    init_db()
    asyncio.create_task(background_worker())
    logger.info("FastAPI TAPO Server Integrado e a Correr!")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=PORT_BACKEND, reload=True)