// Location Tracking Service - Manages all user location tracking across tours

export interface TrackedLocation {
    id: string;
    tourId: string;
    tourTitle: string;
    dayNumber: number;
    dayTitle: string;
    latitude: number;
    longitude: number;
    timestamp: string;
    address?: string;
}

const STORAGE_KEY = 'tripflux_tracked_locations';

class LocationTrackingService {
    // Get all tracked locations
    getAllLocations(): TrackedLocation[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading tracked locations:', error);
            return [];
        }
    }

    // Add a new tracked location
    addLocation(location: Omit<TrackedLocation, 'id'>): TrackedLocation {
        const newLocation: TrackedLocation = {
            ...location,
            id: `${location.tourId}_day${location.dayNumber}_${Date.now()}`
        };

        const locations = this.getAllLocations();

        // Check if this exact location already exists (same tour, same day)
        const existingIndex = locations.findIndex(
            loc => loc.tourId === location.tourId && loc.dayNumber === location.dayNumber
        );

        if (existingIndex !== -1) {
            // Update existing location
            locations[existingIndex] = newLocation;
        } else {
            // Add new location
            locations.push(newLocation);
        }

        this.saveLocations(locations);
        return newLocation;
    }

    // Remove a tracked location
    removeLocation(id: string): void {
        const locations = this.getAllLocations().filter(loc => loc.id !== id);
        this.saveLocations(locations);
    }

    // Get locations for a specific tour
    getLocationsByTour(tourId: string): TrackedLocation[] {
        return this.getAllLocations().filter(loc => loc.tourId === tourId);
    }

    // Get total count of tracked locations
    getTotalCount(): number {
        return this.getAllLocations().length;
    }

    // Clear all tracked locations
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Save locations to localStorage
    private saveLocations(locations: TrackedLocation[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
        } catch (error) {
            console.error('Error saving tracked locations:', error);
        }
    }

    // Get reverse geocoded address (optional - requires API)
    async getAddress(lat: number, lng: number): Promise<string> {
        try {
            // Using OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            return data.display_name || 'Unknown location';
        } catch (error) {
            console.error('Error getting address:', error);
            return 'Unknown location';
        }
    }
}

export const locationTrackingService = new LocationTrackingService();
