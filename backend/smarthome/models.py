from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Boolean, Integer, Float, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base
def now(): return datetime.now(timezone.utc)
class Device(Base):
    __tablename__="devices"
    id: Mapped[str]=mapped_column(String(180),primary_key=True)
    name: Mapped[str]=mapped_column(String(180),index=True)
    vendor: Mapped[str]=mapped_column(String(80),default="generic")
    model: Mapped[str|None]=mapped_column(String(160),nullable=True)
    protocol: Mapped[str]=mapped_column(String(40),default="zigbee")
    vendor_device_id: Mapped[str|None]=mapped_column(String(180),nullable=True)
    room_id: Mapped[str]=mapped_column(String(120),default="Unknown")
    project_room_id: Mapped[str|None]=mapped_column(String(120),nullable=True)
    mapping_status: Mapped[str]=mapped_column(String(24),default="unmatched")
    device_type: Mapped[str]=mapped_column(String(40),default="sensor")
    state: Mapped[dict]=mapped_column(JSON,default=dict)
    capabilities: Mapped[list]=mapped_column(JSON,default=list)
    position: Mapped[dict]=mapped_column(JSON,default=lambda:{"x":0,"y":0,"z":0})
    online: Mapped[bool]=mapped_column(Boolean,default=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now,onupdate=now)
    last_seen: Mapped[datetime|None]=mapped_column(DateTime(timezone=True),nullable=True)
class Event(Base):
    __tablename__="events"
    id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    topic: Mapped[str]=mapped_column(String(512),index=True)
    payload: Mapped[str]=mapped_column(Text)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class EnergyReading(Base):
    __tablename__="energy_readings"
    id: Mapped[int]=mapped_column(Integer,primary_key=True,autoincrement=True)
    meter_id: Mapped[str]=mapped_column(String(160),index=True)
    measurement_type: Mapped[str]=mapped_column(String(64))
    value: Mapped[float]=mapped_column(Float)
    unit: Mapped[str]=mapped_column(String(16))
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class RoomMapping(Base):
    __tablename__="room_mappings"
    id: Mapped[str]=mapped_column(String(180),primary_key=True)
    vendor: Mapped[str]=mapped_column(String(80))
    vendor_room_name: Mapped[str]=mapped_column(String(160))
    project_room_id: Mapped[str]=mapped_column(String(120))
    match_mode: Mapped[str]=mapped_column(String(20),default="manual")
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class AlertRule(Base):
    __tablename__="alert_rules"
    id: Mapped[str]=mapped_column(String(80),primary_key=True)
    device_id: Mapped[str]=mapped_column(String(180),index=True)
    name: Mapped[str]=mapped_column(String(160))
    metric: Mapped[str]=mapped_column(String(80))
    operator: Mapped[str]=mapped_column(String(8))
    threshold: Mapped[float]=mapped_column(Float)
    enabled: Mapped[bool]=mapped_column(Boolean,default=True)
    notify: Mapped[bool]=mapped_column(Boolean,default=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
class AlertEvent(Base):
    __tablename__="alert_events"
    id: Mapped[str]=mapped_column(String(80),primary_key=True)
    device_id: Mapped[str]=mapped_column(String(180),index=True)
    title: Mapped[str]=mapped_column(String(180))
    message: Mapped[str]=mapped_column(Text)
    severity: Mapped[str]=mapped_column(String(16),default="info")
    acknowledged: Mapped[bool]=mapped_column(Boolean,default=False)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True),default=now)
