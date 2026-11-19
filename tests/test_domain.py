from smarthome.zigbee import infer_type, normalize

def test_switch_payload():
    kind,caps=infer_type({"state":"ON","power":42.5})
    assert kind=="outlet" and "switch" in caps and "power" in caps

def test_temperature_payload():
    kind,caps=infer_type({"temperature":20.5,"humidity":50})
    assert kind=="sensor" and "temperature" in caps

def test_normalize():
    state=normalize({"state":"OFF","power":12,"energy":1.2})
    assert state["on"] is False and state["power_w"]==12 and state["energy_kwh"]==1.2
