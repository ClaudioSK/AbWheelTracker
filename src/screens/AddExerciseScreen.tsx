import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Exercise, Achievement } from '../types';
import { checkAchievements } from '../utils/achievements';
import AchievementUnlocked from '../components/AchievementUnlocked';

type AddExerciseScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddExercise'>;
  route: RouteProp<RootStackParamList, 'AddExercise'>;
};

const AddExerciseScreen: React.FC<AddExerciseScreenProps> = ({ navigation, route }) => {
  // Obtener la fecha del parámetro o usar la fecha actual
  const selectedDate = route.params?.date || format(new Date(), 'yyyy-MM-dd');
  const [sets, setSets] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Cargar datos existentes si los hay para la fecha seleccionada
  useEffect(() => {
    const loadExistingExercise = async () => {
      try {
        const existingData = await AsyncStorage.getItem('abwheelExercises');
        if (existingData) {
          const exercises: Exercise[] = JSON.parse(existingData);
          const existingExercise = exercises.find(ex => ex.date === selectedDate);
          
          if (existingExercise) {
            setSets(existingExercise.sets.toString());
            setReps(existingExercise.reps.toString());
            setNotes(existingExercise.notes || '');
          } else {
            // Limpiar formulario si no hay datos para esta fecha
            setSets('');
            setReps('');
            setNotes('');
          }
        }
      } catch (error) {
        console.error('Error loading existing exercise', error);
      }
    };
    
    loadExistingExercise();
  }, [selectedDate]);

  const validateForm = (): boolean => {
    if (!sets || !reps) {
      Alert.alert('Error', 'Por favor ingresa el número de series y repeticiones');
      return false;
    }

    if (isNaN(Number(sets)) || isNaN(Number(reps))) {
      Alert.alert('Error', 'Series y repeticiones deben ser números');
      return false;
    }

    return true;
  };

  const saveExercise = async (): Promise<void> => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Obtener ejercicios existentes
      const existingData = await AsyncStorage.getItem('abwheelExercises');
      let exercises: Exercise[] = existingData ? JSON.parse(existingData) : [];

      // Verificar si ya existe un ejercicio para la fecha seleccionada
      const existingIndex = exercises.findIndex(ex => ex.date === selectedDate);

      // Crear nuevo ejercicio
      const newExercise: Exercise = {
        id: existingIndex >= 0 ? exercises[existingIndex].id : Date.now().toString(),
        date: selectedDate,
        sets: Number(sets),
        reps: Number(reps),
        notes: notes.trim() || undefined
      };

      // Actualizar o añadir
      if (existingIndex >= 0) {
        exercises[existingIndex] = newExercise;
        Alert.alert('Actualizado', `El ejercicio del ${formatDate(selectedDate)} ha sido actualizado`);
      } else {
        exercises.push(newExercise);
        Alert.alert('Guardado', `Ejercicio registrado para el ${formatDate(selectedDate)}`);
      }

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('abwheelExercises', JSON.stringify(exercises));
      
      // Verificar y actualizar logros
      const result = await checkAchievements(exercises);
      
      if (result.updated && result.newAchievements.length > 0) {
        setUnlockedAchievements(result.newAchievements);
        setCurrentAchievement(result.newAchievements[0]);
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving exercise', error);
      Alert.alert('Error', 'Hubo un problema al guardar el ejercicio');
      navigation.navigate('Home');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función auxiliar para formatear fechas de forma legible
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
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
      // Si no hay más logros por mostrar, navegar a Home
      navigation.navigate('Home');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {currentAchievement && (
        <AchievementUnlocked 
          achievement={currentAchievement} 
          onClose={handleAchievementClosed} 
        />
      )}
      
      <ScrollView style={styles.container}>
        <View style={styles.formContainer}>
          {/* Mostrar la fecha que se está editando */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>
              {selectedDate === format(new Date(), 'yyyy-MM-dd') 
                ? 'Hoy' 
                : formatDate(selectedDate)}
            </Text>
          </View>

          <Text style={styles.label}>Número de Series</Text>
          <TextInput
            style={styles.input}
            value={sets}
            onChangeText={setSets}
            placeholder="Ej: 3"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Repeticiones por Serie</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="Ej: 10"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Escribe aquí tus observaciones..."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.disabledButton]}
            onPress={saveExercise}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Guardando...' : 'Guardar Ejercicio'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  dateHeader: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#00adf5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddExerciseScreen;