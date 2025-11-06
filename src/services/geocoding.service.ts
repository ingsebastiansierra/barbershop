/**
 * GeocodingService
 * Handles address geocoding and reverse geocoding
 */

import * as Location from 'expo-location';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

class GeocodingService {
  /**
   * Convert address to coordinates (Geocoding)
   */
  async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    try {
      const results = await Location.geocodeAsync(address);

      if (!results || results.length === 0) {
        throw new Error('No se encontraron resultados para esta dirección');
      }

      // Convert results to our format
      const geocodingResults: GeocodingResult[] = results.map((result) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        address: address, // Original address
      }));

      return geocodingResults;
    } catch (error) {
      console.error('geocodeAddress error:', error);
      throw error;
    }
  }

  /**
   * Convert coordinates to address (Reverse Geocoding)
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodingResult | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!results || results.length === 0) {
        return null;
      }

      const result = results[0];

      // Build formatted address
      const addressParts = [
        result.street,
        result.streetNumber,
        result.district,
        result.city,
        result.region,
        result.postalCode,
        result.country,
      ].filter(Boolean);

      const formattedAddress = addressParts.join(', ');

      return {
        latitude,
        longitude,
        address: formattedAddress,
        city: result.city || undefined,
        region: result.region || undefined,
        country: result.country || undefined,
        postalCode: result.postalCode || undefined,
      };
    } catch (error) {
      console.error('reverseGeocode error:', error);
      return null;
    }
  }

  /**
   * Get formatted address from coordinates
   */
  async getFormattedAddress(
    latitude: number,
    longitude: number
  ): Promise<string> {
    try {
      const result = await this.reverseGeocode(latitude, longitude);
      return result?.address || `${latitude}, ${longitude}`;
    } catch (error) {
      console.error('getFormattedAddress error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  }

  /**
   * Calculate distance between two points (in meters)
   * Uses Haversine formula
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();
export default geocodingService;
