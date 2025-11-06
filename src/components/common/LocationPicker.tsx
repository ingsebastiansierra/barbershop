/**
 * LocationPicker Component
 * Interactive map for selecting business location
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useThemeStore } from '../../store/themeStore';
import { Button } from './Button';
import { spacing, typography, borderRadius } from '../../styles/theme';
import { showToast } from '../../utils/toast';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  title?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onLocationSelect,
  initialLatitude,
  initialLongitude,
  title = 'Selecciona la Ubicación',
}) => {
  const { colors } = useThemeStore();
  const mapRef = useRef<MapView>(null);

  // Default to Mexico City if no initial location
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: initialLatitude || 19.432608,
    longitude: initialLongitude || -99.133209,
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setSelectedLocation({
        latitude: initialLatitude,
        longitude: initialLongitude,
      });
    }
  }, [initialLatitude, initialLongitude]);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('error', 'Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setSelectedLocation(newLocation);

      // Animate map to new location
      mapRef.current?.animateToRegion(
        {
          ...newLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );

      showToast('success', 'Ubicación actual obtenida');
    } catch (error: any) {
      console.error('Error getting location:', error);
      showToast('error', 'Error al obtener ubicación');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedLocation.latitude, selectedLocation.longitude);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: colors.primary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.surface }]}>
          <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
            📍 Toca en el mapa para seleccionar la ubicación de tu negocio
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass
            showsScale
          >
            <Marker
              coordinate={selectedLocation}
              title="Tu Negocio"
              description="Ubicación seleccionada"
              pinColor={colors.primary}
            />
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            style={[styles.currentLocationButton, { backgroundColor: colors.surface }]}
            onPress={handleGetCurrentLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.currentLocationIcon}>📍</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Coordinates Display */}
        <View style={[styles.coordinatesContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.coordinateItem}>
            <Text style={[styles.coordinateLabel, { color: colors.textSecondary }]}>
              Latitud:
            </Text>
            <Text style={[styles.coordinateValue, { color: colors.textPrimary }]}>
              {selectedLocation.latitude.toFixed(6)}
            </Text>
          </View>
          <View style={styles.coordinateItem}>
            <Text style={[styles.coordinateLabel, { color: colors.textSecondary }]}>
              Longitud:
            </Text>
            <Text style={[styles.coordinateValue, { color: colors.textPrimary }]}>
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.actions, { backgroundColor: colors.surface }]}>
          <Button
            title="Cancelar"
            onPress={onClose}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Confirmar Ubicación"
            onPress={handleConfirm}
            variant="primary"
            style={styles.actionButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    ...typography.h4,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  instructions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  instructionsText: {
    ...typography.bodyMedium,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationIcon: {
    fontSize: 24,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  coordinateItem: {
    alignItems: 'center',
  },
  coordinateLabel: {
    ...typography.labelSmall,
    marginBottom: spacing.xs,
  },
  coordinateValue: {
    ...typography.labelLarge,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flex: 1,
  },
});
