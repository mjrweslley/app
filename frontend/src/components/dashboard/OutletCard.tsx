import { Pressable, Text, View } from 'react-native';
import { useDashboardStore } from '../../stores/useDashboardStore';
import type { Device } from '../../api';

type Props = {
  device: Device;
};

export function OutletCard({ device }: Props) {
  const setSelectedDeviceId = useDashboardStore((s) => s.setSelectedDeviceId);
  const setViewMode = useDashboardStore((s) => s.setViewMode);

  const rawPower = device.state?.power_w;
  const power =
    typeof rawPower === 'number' ? rawPower : Number(rawPower ?? 0);

  const isOn = Boolean(device.state?.on);

  return (
    <Pressable
      onPress={() => {
        setSelectedDeviceId(device.id);
        setViewMode('device-panel');
      }}
      style={{
        backgroundColor: '#1c1b19',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#393836',
      }}
    >
      <Text style={{ color: '#cdccca', fontSize: 22, fontWeight: '700' }}>
        {device.name}
      </Text>

      <Text style={{ color: '#797876', marginTop: 4 }}>
        {device.online ? 'Online' : 'Sem ligação'}
      </Text>

      <Text
        style={{
          color: isOn ? '#cdccca' : '#797876',
          fontSize: 42,
          fontWeight: '700',
          marginTop: 20,
        }}
      >
        {power.toFixed(1)} W
      </Text>

      <View
        style={{
          marginTop: 16,
          alignSelf: 'flex-start',
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: device.online ? '#3a4435' : '#4d4332',
        }}
      >
        <Text
          style={{
            color: device.online ? '#6daa45' : '#e8af34',
            fontWeight: '600',
          }}
        >
          {device.online ? 'Online' : 'Offline'}
        </Text>
      </View>
    </Pressable>
  );
}
