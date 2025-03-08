import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import HistoryScreen from './screens/HistoryScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Definir los tipos para los parámetros de la navegación
export type RootStackParamList = {
  Home: undefined;
  AddExercise: undefined;
  History: undefined;
  Achievements: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Mi Rueda Abdominal' }} />
        <Stack.Screen name="AddExercise" component={AddExerciseScreen} options={{ title: 'Registrar Ejercicio' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Logros' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;