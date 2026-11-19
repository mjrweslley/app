from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url: str = "sqlite:///./dev.db"
    mqtt_host: str = "127.0.0.1"
    mqtt_port: int = 1883
    mqtt_topic_prefix: str = "zigbee2mqtt"
    legacy_devices_file: str = "/app/legacy/devices.json"
    legacy_room_mappings_file: str = "/app/legacy/room_mappings.json"
    log_level: str = "INFO"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
settings = Settings()
