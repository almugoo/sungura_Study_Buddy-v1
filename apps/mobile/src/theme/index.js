import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const commonColors = {
    primary: '#6B4EFF', // Vibrant Purple
    secondary: '#4EA5FF', // Clear Blue
    accent: '#FFD700', // Gold for streaks
    error: '#B00020',
};

export const LightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        ...commonColors,
        background: '#FFFFFF',
        text: '#000000',
    },
};

export const DarkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        ...commonColors,
        background: '#121212',
        text: '#FFFFFF',
    },
};
