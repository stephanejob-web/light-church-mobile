/**
 * Main Map Component with clustering
 */

import React, { useCallback, forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import { MAP_CONFIG, COLORS } from '@/constants/config';
import type { Church, Event, UserLocation } from '@/types';
import ChurchMarker from './ChurchMarker';
import EventMarker from './EventMarker';

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

  const handleChurchPress = useCallback((church: Church) => {
    onChurchPress?.(church);
  }, [onChurchPress]);

  const handleEventPress = useCallback((event: Event) => {
    onEventPress?.(event);
  }, [onEventPress]);

  return (
    <MapViewClustering
      ref={ref}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      mapType={mapType}
      initialRegion={initialRegion || defaultRegion}
      onRegionChangeComplete={handleRegionChangeComplete}
      clusterColor={COLORS.PRIMARY}
      clusterTextColor={COLORS.WHITE}
      radius={MAP_CONFIG.CLUSTERING_RADIUS}
      maxZoom={18}
      minZoom={3}
      showsUserLocation={!!userLocation}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      // Performance optimization props
      extent={512}
      nodeSize={64}
      animationEnabled={false} // Disable animations for better performance
      spiderLineColor={COLORS.PRIMARY}
    >
      {/* Church Markers */}
      {churches.map((church) => (
        <ChurchMarker
          key={`church-${church.id}`}
          church={church}
          coordinate={{
            latitude: church.latitude,
            longitude: church.longitude,
          }}
          onPress={handleChurchPress}
        />
      ))}

      {/* Event Markers */}
      {events.map((event) => (
        <EventMarker
          key={`event-${event.id}`}
          event={event}
          coordinate={{
            latitude: event.latitude,
            longitude: event.longitude,
          }}
          onPress={handleEventPress}
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
