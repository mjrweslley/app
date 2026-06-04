import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import PlantaCasa from '../../assets/mapa.svg'; 

// Ajuste os valores X e Y para caírem em cima de cada quarto do seu mapa.svg
const ROOM_COORDS: Record<string, { x: number, y: number }> = {
  "livingroom_main": { x: 250, y: 350 },
  "kitchen_main": { x: 450, y: 250 },
  "bedroom_kids": { x: 150, y: 150 },
  "suite_master": { x: 600, y: 400 },
};

export function SvgHouseMap({ devices }: { devices: any[] }) {
  const scale = useSharedValue(1);
  const pinch = Gesture.Pinch().onChange((e) => { scale.value = e.scale; });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotateX: '45deg' }, // Inclinação (Efeito 3D)
      { rotateZ: '-25deg' } // Rotação angular (Efeito 3D)
    ],
  }));

  // Lógica: Quantos dispositivos existem em cada room_id?
  const roomCounts = devices.reduce((acc, dev) => {
    const room = dev.room_id || "Unknown";
    acc[room] = (acc[room] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={pinch}>
        <Animated.View style={[styles.mapWrapper, animatedStyle]}>
          <PlantaCasa width="100%" height="100%" style={styles.svg} />
          
          {/* RENDERIZAR OS CÍRCULOS (BADGES) */}
          {Object.entries(roomCounts).map(([roomId, count]) => {
            if (roomId === "Unknown" || roomId === "unmatched") return null;
            const coords = ROOM_COORDS[roomId] || { x: 50, y: 50 }; // Posição fallback

            return (
              <View key={roomId} style={[styles.circle, { left: coords.x, top: coords.y }]}>
                <Text style={styles.circleText}>{String(count)}</Text>
              </View>
            );
          })}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  mapWrapper: { flex: 1, width: 800, height: 800, alignSelf: 'center', justifyContent: 'center' },
  svg: { position: 'absolute' },
  circle: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 255, 128, 0.9)',
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF',
    shadowColor: '#00FF80', shadowOpacity: 1, shadowRadius: 10, elevation: 5,
    transform: [{ rotateX: '-45deg' }, { rotateZ: '25deg' }] // Contrabalança a rotação do mapa para o número ficar de pé
  },
  circleText: { color: '#000', fontWeight: '900', fontSize: 16 }
});