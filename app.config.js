module.exports = {
    expo: {
        name: 'Barbershop Manager',
        slug: 'barbershop-manager',
        version: '1.0.0',
        orientation: 'portrait',
        userInterfaceStyle: 'automatic',
        splash: {
            backgroundColor: '#6366F1',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.barbershop.manager',
            config: {
                googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
            },
        },
        android: {
            package: 'com.barbershop.manager',
            permissions: [
                'CAMERA',
                'ACCESS_FINE_LOCATION',
                'ACCESS_COARSE_LOCATION',
                'NOTIFICATIONS',
            ],
            config: {
                googleMaps: {
                    apiKey: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
                },
            },
        },
        plugins: ['expo-notifications', 'expo-image-picker', 'expo-location'],
        extra: {
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
            eas: {
                projectId: 'your-project-id',
            },
        },
        scheme: 'com.barbershop.manager',
    },
};
