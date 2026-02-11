/**
 * Main Map Component with clustering
 */

import React, { useCallback, forwardRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, MarkerPressEvent } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import { MAP_CONFIG, COLORS } from '@/constants/config';
import type { Church, Event, UserLocation } from '@/types';

interface ChurchMapProps {
  churches: Church[];
  events: Event[];
  userLocation: UserLocation | null;
  onRegionChange?: (region: Region) => void;
  onChurchPress?: (church: Church) => void;
  onEventPress?: (event: Event) => void;
  initialRegion?: Region;
  mapType?: 'standard' | 'satellite';
}

const ChurchMap = forwardRef<MapView, ChurchMapProps>(({
  churches = [],
  events = [],
  userLocation,
  onRegionChange,
  onChurchPress,
  onEventPress,
  initialRegion,
  mapType = 'standard',
}, ref) => {

  const defaultRegion: Region = {
    latitude: userLocation?.latitude || MAP_CONFIG.DEFAULT_LATITUDE,
    longitude: userLocation?.longitude || MAP_CONFIG.DEFAULT_LONGITUDE,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange?.(region);
  }, [onRegionChange]);

  // Index maps for O(1) lookup on marker press
  const churchMap = useMemo(() => {
    const map = new Map<string, Church>();
    churches.forEach(c => map.set(`church-${c.id}`, c));
    return map;
  }, [churches]);

  const eventMap = useMemo(() => {
    const map = new Map<string, Event>();
    events.forEach(e => map.set(`event-${e.id}`, e));
    return map;
  }, [events]);

  // Single stable callback for church markers
  const handleChurchMarkerPress = useCallback((e: MarkerPressEvent) => {
    const id = e.nativeEvent.id;
    if (id) {
      const church = churchMap.get(id);
      if (church) onChurchPress?.(church);
    }
  }, [churchMap, onChurchPress]);

  // Single stable callback for event markers
  const handleEventMarkerPress = useCallback((e: MarkerPressEvent) => {
    const id = e.nativeEvent.id;
    if (id) {
      const event = eventMap.get(id);
      if (event) onEventPress?.(event);
    }
  }, [eventMap, onEventPress]);

  // Handle cluster press: zoom into the cluster region to reveal individual markers
  const handleClusterPress = useCallback((_cluster: any, markers: any[]) => {
    if (!markers || markers.length === 0) return;

    // Calculate the bounding region of all markers in the cluster
    const lats = markers.map(m => m.geometry.coordinates[1]);
    const lngs = markers.map(m => m.geometry.coordinates[0]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max((maxLat - minLat) * 1.5, 0.01);
    const deltaLng = Math.max((maxLng - minLng) * 1.5, 0.01);

    const mapRef = ref as React.RefObject<MapView>;
    mapRef?.current?.animateToRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    }, 300);
  }, [ref]);

  return (
    <MapViewClustering
      ref={ref}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion || defaultRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      onClusterPress={handleClusterPress}
      clusterColor={COLORS.PRIMARY}
      clusterTextColor={COLORS.WHITE}
      radius={MAP_CONFIG.CLUSTERING_RADIUS}
      maxZoom={18}
      minZoom={3}
      preserveClusterPressBehavior={true}
      showsUserLocation={!!userLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
    >
      {/* Church Markers */}
      {churches.map((church) => (
        <Marker
          key={`church-${church.id}`}
          identifier={`church-${church.id}`}
          coordinate={{
            latitude: church.latitude,
            longitude: church.longitude,
          }}
          title={church.church_name}
          description={church.denomination_name}
          pinColor={COLORS.PRIMARY}
          tracksViewChanges={false}
          onPress={handleChurchMarkerPress}
        />
      ))}

      {/* Event Markers */}
      {events.map((event) => (
        <Marker
          key={`event-${event.id}`}
          identifier={`event-${event.id}`}
          coordinate={{
            latitude: event.latitude,
            longitude: event.longitude,
          }}
          title={event.title}
          description={event.church_name}
          pinColor={COLORS.WARNING}
          tracksViewChanges={false}
          onPress={handleEventMarkerPress}
        />
      ))}
    </MapViewClustering>
  );
});

ChurchMap.displayName = 'ChurchMap';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default ChurchMap;
