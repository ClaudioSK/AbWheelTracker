import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Achievement } from '../types';

type AchievementsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Achievements'>;
};

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAchievements();
    
    // Actualizar cuando la pantalla recibe foco
    const unsubscribe = navigation.addListener('focus', () => {
      loadAchievements();
    });

    return unsubscribe;
  }, [navigation]);

  const loadAchievements = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Intentar cargar logros existentes
      const data = await AsyncStorage.getItem('abwheelAchievements');
      let existingAchievements: Achievement[] = data ? JSON.parse(data) : [];
      
      // Definir logros predeterminados si no existen
      if (existingAchievements.length === 0) {
        existingAchievements = getDefaultAchievements();
        await AsyncStorage.setItem('abwheelAchievements', JSON.stringify(existingAchievements));
      }
      
      // Verificar si hay logros que faltan en la lista guardada
      const defaultAchievements = getDefaultAchievements();
      let updated = false;
      
      defaultAchievements.forEach(defaultAchievement => {
        if (!existingAchievements.some(a => a.id === defaultAchievement.id)) {
          existingAchievements.push(defaultAchievement);
          updated = true;
        }
      });
      
      if (updated) {
        await AsyncStorage.setItem('abwheelAchievements', JSON.stringify(existingAchievements));
      }
      
      setAchievements(existingAchievements);
    } catch (error) {
      console.error('Error loading achievements', error);
      Alert.alert('Error', 'No se pudieron cargar los logros');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAchievements = (): Achievement[] => {
    return [
      {
        id: 'first_exercise',
        title: 'Primer Entrenamiento',
        description: '¡Completaste tu primer ejercicio con la rueda abdominal!',
        unlocked: false,
        icon: '🎉'
      },
      {
        id: 'streak_3',
        title: '3 Días Seguidos',
        description: '¡Has completado ejercicios durante 3 días consecutivos!',
        unlocked: false,
        icon: '🔥'
      },
      {
        id: 'streak_7',
        title: 'Semana Completa',
        description: '¡Has completado ejercicios durante 7 días consecutivos!',
        unlocked: false,
        icon: '🏆'
      },
      {
        id: 'streak_30',
        title: 'Maestro de la Constancia',
        description: '¡30 días consecutivos! Realmente estás comprometido.',
        unlocked: false,
        icon: '👑'
      },
      {
        id: 'total_10',
        title: 'Vamos empezando',
        description: 'Has completado 10 sesiones de entrenamiento en total.',
        unlocked: false,
        icon: '🌱'
      },
      {
        id: 'total_50',
        title: 'Medio Centenar',
        description: '50 sesiones de entrenamiento completadas. ¡Vas por buen camino!',
        unlocked: false,
        icon: '💪'
      },
      {
        id: 'total_100',
        title: 'Centenario',
        description: '¡Has alcanzado 100 sesiones de entrenamiento! Eres imparable.',
        unlocked: false,
        icon: '🌟'
      }
    ];
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No desbloqueado';
    
    try {
      const date = new Date(dateString);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const renderAchievementItem = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementCard, !item.unlocked && styles.lockedAchievement]}>
      <View style={styles.achievementIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !item.unlocked && styles.lockedText]}>
          {item.title}
        </Text>
        
        <Text style={[styles.achievementDescription, !item.unlocked && styles.lockedText]}>
          {item.description}
        </Text>
        
        {item.unlocked && item.unlockedDate && (
          <Text style={styles.unlockedDate}>
            Desbloqueado el {formatDate(item.unlockedDate)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {achievements.filter(a => a.unlocked).length} de {achievements.length} logros desbloqueados
        </Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando logros...</Text>
        </View>
      ) : (
        <FlatList
          data={achievements}
          renderItem={renderAchievementItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    padding: 16,
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
  achievementCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedAchievement: {
    backgroundColor: '#f9f9f9',
    opacity: 0.8,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#00adf5',
    fontStyle: 'italic',
  },
  lockedText: {
    color: '#999',
  },
});

export default AchievementsScreen;
