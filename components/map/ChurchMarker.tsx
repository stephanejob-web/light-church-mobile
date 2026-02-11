import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { COLORS } from '@/constants/config';
import type { Church } from '@/types';

interface ChurchMarkerProps {
    church: Church;
    onPress: (church: Church) => void;
    coordinate: { latitude: number; longitude: number };
}

const ChurchMarker = memo(({ church, onPress, coordinate }: ChurchMarkerProps) => {
    const markerRef = useRef<any>(null);
    // Optimization for iOS: stop tracking view changes after initial render
    // This significantly improves performance when markers are static
    const [tracksViewChanges, setTracksViewChanges] = useState(Platform.OS === 'ios');

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const timeout = setTimeout(() => {
                setTracksViewChanges(false);
            }, 100); // Small delay to ensure render is complete before stopping tracking
            return () => clearTimeout(timeout);
        }
    }, []);

    const handlePress = () => {
        onPress(church);
    };

    return (
        <Marker
            key={`church-${church.id}`}
            ref={markerRef}
            coordinate={coordinate}
            title={church.church_name}
            description={church.denomination_name}
            pinColor={COLORS.PRIMARY}
            onPress={handlePress}
            tracksViewChanges={tracksViewChanges}
            // Stop collisions to improve performance on older devices
            tracksInfoWindowChanges={false}
        />
    );
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    return (
        prevProps.church.id === nextProps.church.id &&
        prevProps.church.latitude === nextProps.church.latitude &&
        prevProps.church.longitude === nextProps.church.longitude &&
        prevProps.church.church_name === nextProps.church.church_name
    );
});

ChurchMarker.displayName = 'ChurchMarker';

export default ChurchMarker;
