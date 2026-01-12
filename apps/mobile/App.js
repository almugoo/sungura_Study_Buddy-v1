import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LightTheme } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/context/UserContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <PaperProvider theme={LightTheme}>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
