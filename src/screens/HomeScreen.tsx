import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Exercise, Achievement } from '../types';
import { calculateStreak, checkAchievements } from '../utils/achievements';
import AchievementUnlocked from '../components/AchievementUnlocked';
import { es } from 'date-fns/locale';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

interface MarkedDates {
  [date: string]: {
    selected: boolean;
    marked: boolean;
    dotColor: string;
  };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    loadExercises();
    
    // Actualizar datos cuando la pantalla recibe foco
    const unsubscribe = navigation.addListener('focus', () => {
      loadExercises();
    });

    return unsubscribe;
  }, [navigation]);

  const loadExercises = async (): Promise<void> => {
    try {
      const exercises = await AsyncStorage.getItem('abwheelExercises');
      if (exercises) {
        const exerciseData: Exercise[] = JSON.parse(exercises);
        const dates: MarkedDates = {};
        
        exerciseData.forEach(exercise => {
          dates[exercise.date] = { selected: true, marked: true, dotColor: 'green' };
        });
        
        setMarkedDates(dates);
        setTotalWorkouts(exerciseData.length);
        
        // Usar la función importada para calcular la racha
        const streak = calculateStreak(exerciseData);
        setCurrentStreak(streak);
        
        // Verificar si hay logros nuevos al cargar
        const result = await checkAchievements(exerciseData);
        if (result.updated && result.newAchievements.length > 0) {
          setUnlockedAchievements(result.newAchievements);
          setCurrentAchievement(result.newAchievements[0]);
        }
      }
    } catch (error) {
      console.error('Error loading exercises', error);
    }
  };

  const handleAchievementClosed = () => {
    // Eliminar el logro actual de la lista
    const updatedAchievements = [...unlockedAchievements];
    updatedAchievements.shift();
    
    setUnlockedAchievements(updatedAchievements);
    
    // Si hay más logros, mostrar el siguiente
    if (updatedAchievements.length > 0) {
      setCurrentAchievement(updatedAchievements[0]);
    } else {
      setCurrentAchievement(null);
    }
  };

  // Calcular totales para mostrar en la pantalla de inicio
  // const calculateTotals = async (): Promise<{totalSets: number, totalReps: number}> => {
  //   try {
  //     const exercisesData = await AsyncStorage.getItem('abwheelExercises');
  //     if (exercisesData) {
  //       const exercises: Exercise[] = JSON.parse(exercisesData);
  //       let totalSets = 0;
  //       let totalReps = 0;
        
  //       exercises.forEach(exercise => {
  //         totalSets += exercise.sets;
  //         totalReps += exercise.sets * exercise.reps;
  //       });
        
  //       return { totalSets, totalReps };
  //     }
  //   } catch (error) {
  //     console.error('Error calculating totals', error);
  //   }
    
  //   return { totalSets: 0, totalReps: 0 };
  // };

  const formatMonthTitle = (date: Date) => {
    return format(date, 'MMMM yyyy', { locale: es });
  };
  

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {currentAchievement && (
        <AchievementUnlocked 
          achievement={currentAchievement} 
          onClose={handleAchievementClosed} 
        />
      )}
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Días seguidos</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>Total ejercicios</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Calendario de Actividades</Text>
      <Calendar
        markedDates={markedDates}
        theme={{
          todayTextColor: '#00adf5',
          selectedDayBackgroundColor: '#00adf5',
          dotColor: '#00adf5',
          monthTextColor: '#333',
          textMonthFontWeight: 'bold',
          textMonthFontSize: 18,
        }}
        renderHeader={(date) => {
          const monthName = format(date, 'MMMM yyyy', { locale: es });
          return (
            <Text style={{ 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#333', 
              textTransform: 'capitalize',
              marginVertical: 10,
            }}>
              {monthName}
            </Text>
          );
        }}
        onDayPress={(day) => {
          // Navegar a AddExercise con la fecha seleccionada
          navigation.navigate('AddExercise', { date: day.dateString });
        }}
      />

      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddExercise')}
      >
        <Text style={styles.addButtonText}>Registrar Ejercicio</Text>
      </TouchableOpacity>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.navButtonText}>Historial</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.navButtonText}>Logros</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.navButtonText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
      
      {/* Añadir espacio adicional al final */}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Más espacio inferior
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00adf5',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#00adf5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  navButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 14,
    color: '#333',
  },
  bottomSpace: {
    height: 24, // Espacio adicional al final
  },
});

export default HomeScreen;
