import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { type Device } from '../api/devices';

// O SVG agora é importado como um componente React puro!
import PlantaCasa from '../../assets/mapa.svg'; 

interface Props {
  devices: Device[];
  onDevicePress?: (device: Device) => void;
}

export function SvgHouseMap({ devices, onDevicePress }: Props) {
  // Estado para zoom e pan (Navegação pelo mapa)
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pinch = Gesture.Pinch().onChange((event) => {
    scale.value = Math.max(0.5, Math.min(event.scale * scale.value, 3));
  });

  const pan = Gesture.Pan().onChange((event) => {
    translateX.value += event.changeX;
    translateY.value += event.changeY;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(pinch, pan)}>
        <Animated.View style={[styles.mapWrapper, animatedStyle]}>
          
          {/* 1. A PLANTA DA CASA (Fundo) */}
          <PlantaCasa width="100%" height="100%" style={styles.svg} />

          {/* 2. OS DISPOSITIVOS (Sobrepostos) */}
          {devices.map((device) => {
            // Nota: Numa fase posterior, usaremos o device.position.x e y reais.
            // Para já, vamos garantir que eles renderizam condicionalmente.
            const isOnline = device.online;
            const isOn = device.state?.on;
            
            return (
              <TouchableOpacity
                key={device.id}
                onPress={() => onDevicePress?.(device)}
                style={[
                  styles.deviceMarker,
                  // Posição temporária (centro do ecrã) se o X e Y forem 0
                  { 
                    left: device.position?.x > 0 ? device.position.x : 150, 
                    top: device.position?.y > 0 ? device.position.y : 150,
                    backgroundColor: isOn ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                  }
                ]}
              >
                <View style={[styles.dot, { backgroundColor: isOnline ? (isOn ? '#00FF80' : '#888') : '#FF4444' }]} />
                <Text style={styles.deviceName}>{device.name}</Text>
              </TouchableOpacity>
            );
          })}

        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  mapWrapper: {
    flex: 1,
    width: 1000, // Tamanho virtual do Canvas
    height: 800,
  },
  svg: {
    position: 'absolute',
    opacity: 0.3, // Estilo Dark/Glassmorphism para a planta
  },
  deviceMarker: {
    position: 'absolute',
    padding: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  deviceName: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
});