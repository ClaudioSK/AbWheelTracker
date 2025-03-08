import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface AppSettings {
  enableReminders: boolean;
  reminderTime: string;
  darkMode: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings>({
    enableReminders: false,
    reminderTime: '20:00',
    darkMode: false
  });
  
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      const savedSettings = await AsyncStorage.getItem('abwheelSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings): Promise<void> => {
    try {
      await AsyncStorage.setItem('abwheelSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings', error);
      Alert.alert('Error', 'No se pudieron guardar los ajustes');
    }
  };

  const toggleReminders = (value: boolean): void => {
    const newSettings = { ...settings, enableReminders: value };
    saveSettings(newSettings);
    
    if (value) {
      Alert.alert(
        'Recordatorios activados',
        'Recibirás notificaciones diarias para recordarte hacer tus ejercicios con la rueda abdominal.'
      );
      // Aquí se implementaría la lógica para programar las notificaciones
    } else {
      // Aquí se implementaría la lógica para cancelar las notificaciones
    }
  };

  const toggleDarkMode = (value: boolean): void => {
    const newSettings = { ...settings, darkMode: value };
    saveSettings(newSettings);
    // Aquí se implementaría la lógica para cambiar el tema de la app
  };

  const clearAllData = (): void => {
    Alert.alert(
      'Borrar todos los datos',
      '¿Estás seguro que deseas borrar todos los datos de la aplicación? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Borrar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'abwheelExercises',
                'abwheelAchievements'
              ]);
              Alert.alert(
                'Datos borrados',
                'Todos los datos han sido eliminados correctamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Home')
                  }
                ]
              );
            } catch (error) {
              console.error('Error clearing data', error);
              Alert.alert('Error', 'No se pudieron borrar los datos');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando ajustes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Recordatorios diarios</Text>
            <Text style={styles.settingDescription}>
              Recibe notificaciones para recordarte hacer ejercicio
            </Text>
          </View>
          <Switch
            value={settings.enableReminders}
            onValueChange={toggleReminders}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={settings.enableReminders ? '#1e88e5' : '#f5f5f5'}
          />
        </View>
        
        {/* Aquí se podría añadir un selector de hora para los recordatorios */}
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Modo oscuro</Text>
            <Text style={styles.settingDescription}>
              Cambia la apariencia de la aplicación
            </Text>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={settings.darkMode ? '#1e88e5' : '#f5f5f5'}
          />
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Datos</Text>
        
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={clearAllData}
        >
          <Text style={styles.dangerButtonText}>Borrar todos los datos</Text>
        </TouchableOpacity>
        
        <Text style={styles.warningText}>
          Esta acción eliminará todos tus ejercicios registrados y logros. No se puede deshacer.
        </Text>
      </View>
      
      <View style={styles.aboutContainer}>
        <Text style={styles.aboutTitle}>Acerca de</Text>
        <Text style={styles.versionText}>Rueda Abdominal Tracker v1.0.0</Text>
        <Text style={styles.copyrightText}>© 2025 Tu Nombre</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  dangerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  dangerButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  aboutContainer: {
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#888',
  },
});

export default SettingsScreen;
