import React, { memo, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { COLORS } from '@/constants/config';
import type { Event } from '@/types';

interface EventMarkerProps {
    event: Event;
    onPress: (event: Event) => void;
    coordinate: { latitude: number; longitude: number };
}

const EventMarker = memo(({ event, onPress, coordinate }: EventMarkerProps) => {
    const markerRef = useRef<any>(null);
    // Optimization for iOS: stop tracking view changes after initial render
    const [tracksViewChanges, setTracksViewChanges] = useState(Platform.OS === 'ios');

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const timeout = setTimeout(() => {
                setTracksViewChanges(false);
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, []);

    const handlePress = () => {
        onPress(event);
    };

    return (
        <Marker
            key={`event-${event.id}`}
            ref={markerRef}
            coordinate={coordinate}
            title={event.title}
            description={event.church_name}
            pinColor={COLORS.WARNING}
            onPress={handlePress}
            tracksViewChanges={tracksViewChanges}
            tracksInfoWindowChanges={false}
        />
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.event.id === nextProps.event.id &&
        prevProps.event.latitude === nextProps.event.latitude &&
        prevProps.event.longitude === nextProps.event.longitude &&
        prevProps.event.title === nextProps.event.title
    );
});

EventMarker.displayName = 'EventMarker';

export default EventMarker;
