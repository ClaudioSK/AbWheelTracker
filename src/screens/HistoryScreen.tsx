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
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { Exercise } from '../types';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
      setLoading(true);
      const data = await AsyncStorage.getItem('abwheelExercises');
      
      if (data) {
        const parsedExercises: Exercise[] = JSON.parse(data);
        // Ordenar por fecha, más reciente primero
        const sortedExercises = parsedExercises.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExercises(sortedExercises);
      } else {
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading exercises', error);
      Alert.alert('Error', 'No se pudieron cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  const deleteExercise = async (id: string): Promise<void> => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro que deseas eliminar este registro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedExercises = exercises.filter(ex => ex.id !== id);
              await AsyncStorage.setItem('abwheelExercises', JSON.stringify(updatedExercises));
              setExercises(updatedExercises);
            } catch (error) {
              console.error('Error deleting exercise', error);
              Alert.alert('Error', 'No se pudo eliminar el registro');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseDate}>{formatDate(item.date)}</Text>
        <TouchableOpacity 
          onPress={() => deleteExercise(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.exerciseDetails}>
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Series</Text>
          <Text style={styles.detailValue}>{item.sets}</Text>
        </View>
        
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Repeticiones</Text>
          <Text style={styles.detailValue}>{item.reps}</Text>
        </View>
        
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.detailValue}>{item.sets * item.reps}</Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notas:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {exercises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {loading 
              ? 'Cargando ejercicios...' 
              : 'Aún no has registrado ningún ejercicio'}
          </Text>
          {!loading && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddExercise')}
            >
              <Text style={styles.addButtonText}>Registrar Ejercicio</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
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
  listContainer: {
    padding: 16,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailBox: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00adf5',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#00adf5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 250,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
