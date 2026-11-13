import * as Location from 'expo-location';
import { GPSLocation } from '../types';

export async function getCurrentGPSLocation(): Promise<GPSLocation> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied, using default Bangladesh centroid coordinates.');
      return {
        latitude: 23.8103,
        longitude: 90.4125,
        address: 'Dhaka, Bangladesh (Centroid)',
      };
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let address = 'Dhaka, Bangladesh';
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const item = reverse[0];
        const parts = [item.street, item.subregion || item.city, item.region, item.country].filter(Boolean);
        address = parts.join(', ');
      }
    } catch (geoErr) {
      console.warn('Reverse geocoding error:', geoErr);
    }

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      address,
    };
  } catch (error) {
    console.warn('Error fetching GPS location:', error);
    return {
      latitude: 23.8103,
      longitude: 90.4125,
      address: 'Bangladesh',
    };
  }
}
