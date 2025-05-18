import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TurnByTurnPanel from './turn-to-turn';

// Static start/end and polyline coordinates for Gate 1 and Gate 2
const gateConfigs: Record<'1' | '2', { start: LatLng; end: LatLng; coords: LatLng[]; color: string }> = {
  '1': {
    start: { latitude: 14.6095077, longitude: 121.055815 },
    end: { latitude: 14.6091605, longitude: 121.0532831 },
    coords: [
      { latitude: 14.6095077, longitude: 121.055815 },
      { latitude: 14.6094000, longitude: 121.0550000 },
      { latitude: 14.6093000, longitude: 121.0540000 },
      { latitude: 14.6092000, longitude: 121.0535000 },
    ],
    color: '#0072ff',
  },
  '2': {
    start: { latitude: 14.6072901, longitude: 121.0565181 },
    end: { latitude: 14.6091276, longitude: 121.0534751 },
    coords: [
      { latitude: 14.6072901, longitude: 121.0565181 },
      { latitude: 14.6078000, longitude: 121.0558000 },
      { latitude: 14.6085000, longitude: 121.0545000 },
      { latitude: 14.6091276, longitude: 121.0534751 },
    ],
    color: '#009688',
  },
};

export default function Navigation() {
  const router = useRouter();
  const { gate } = useLocalSearchParams();

  const gateId = Array.isArray(gate) ? gate[0] : gate;
  const id = gateId in gateConfigs ? gateId : '1';

  const { start, end, coords, color } = gateConfigs[id];

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          centerCoordinate={[
            (start.longitude + end.longitude) / 2,
            (start.latitude + end.latitude) / 2,
          ]}
          zoomLevel={15}
        />
        <Mapbox.UserLocation />
        <Mapbox.LineLayer
          id="routeLine"
          style={{
            lineColor: color,
            lineWidth: 4,
          }}
          geometry={{
            type: 'LineString',
            coordinates: coords.map(coord => [coord.longitude, coord.latitude]),
          }}
        />
        <Mapbox.PointAnnotation
          id="start"
          coordinate={[start.longitude, start.latitude]}
          onSelected={() => router.push(`/AR?gate=${id}`)}
        />
        <Mapbox.PointAnnotation
          id="end"
          coordinate={[end.longitude, end.latitude]}
        />
      </Mapbox.MapView>
      <TurnByTurnPanel gateId={id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { ...StyleSheet.absoluteFillObject },
});
