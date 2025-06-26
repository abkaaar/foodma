import * as Location from 'expo-location';


interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface LocationWithAddress extends LocationData {
  address?: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
    formattedAddress?: string;
  };
}

// ✅ Enhanced function that gets both coordinates AND address
export const getUserLocationWithAddress = async (
  options: Partial<Location.LocationOptions> = {}
): Promise<LocationWithAddress | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    const result = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      ...options
    });
    
    const locationData: LocationWithAddress = {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy,
      timestamp: result.timestamp,
    };

    // ✅ Get address from coordinates (reverse geocoding)
    try {
      const addressResults = await Location.reverseGeocodeAsync({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });

      if (addressResults && addressResults.length > 0) {
        const address = addressResults[0];
        locationData.address = {
          street: address.street || undefined,
          city: address.city || undefined,
          region: address.region || undefined,
          country: address.country || undefined,
          postalCode: address.postalCode || undefined,
          formattedAddress: [
            address.street,
            address.city,
            address.region,
            address.country
          ].filter(Boolean).join(', ')
        };
      }
    } catch (geocodeError) {
      console.warn('Failed to get address:', geocodeError);
      // Continue without address - still return coordinates
    }
    
    return locationData;
  } catch (err) {
    console.error('Location error:', err);
    return null;
  }
};

// ✅ Simple function to get just the address
export const getUserAddress = async (): Promise<string | null> => {
  try {
    const locationWithAddress = await getUserLocationWithAddress();
    return locationWithAddress?.address?.formattedAddress || null;
  } catch (err) {
    console.error('Address error:', err);
    return null;
  }
};

// Keep your original function for coordinates only
export const getUserLocation = async (options: Partial<Location.LocationOptions> = {}): Promise<LocationData | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    
    const result = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      ...options
    });
    
    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy,
      timestamp: result.timestamp,
    };
  } catch (err) {
    console.error('Location error:', err);
    return null;
  }
};
