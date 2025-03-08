import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { Exercise, Achievement } from '../types';

// Lista de logros predeterminados
export const getDefaultAchievements = (): Achievement[] => {
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
    },
    // Nuevos logros de repeticiones
    {
      id: 'reps_100',
      title: 'Centenar de Repeticiones',
      description: 'Has acumulado 100 repeticiones con la rueda abdominal.',
      unlocked: false,
      icon: '💯'
    },
    {
      id: 'reps_500',
      title: 'Resistencia 500',
      description: 'Has superado las 500 repeticiones totales. ¡Excelente resistencia!',
      unlocked: false,
      icon: '🔄'
    },
    {
      id: 'reps_1000',
      title: 'Maestro de la Rueda',
      description: '1000 repeticiones alcanzadas. Tu core debe ser de acero.',
      unlocked: false,
      icon: '🏅'
    },
    {
      id: 'reps_5000',
      title: 'Leyenda Abdominal',
      description: '5000 repeticiones. Has alcanzado un nivel legendario.',
      unlocked: false,
      icon: '👑'
    }
  ];
};

// Función para calcular la racha actual
export const calculateStreak = (exercises: Exercise[]): number => {
  if (exercises.length === 0) return 0;
  
  // Ordenar ejercicios por fecha, más reciente primero
  const sortedExercises = [...exercises].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 1;
  let currentDate = new Date(sortedExercises[0].date);
  const today = new Date();
  
  // Verificar si el último ejercicio fue hoy o ayer
  const dayDiff = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (dayDiff > 1) return 0;
  
  // Calcular racha
  for (let i = 1; i < sortedExercises.length; i++) {
    const prevDate = new Date(sortedExercises[i].date);
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays > 1) {
      break;
    }
  }
  
  return streak;
};

// Función para verificar y actualizar logros
export const checkAchievements = async (exercises: Exercise[]): Promise<{updated: boolean, newAchievements: Achievement[]}> => {
  try {
    // Obtener logros existentes
    const achievementsData = await AsyncStorage.getItem('abwheelAchievements');
    let achievements: Achievement[] = achievementsData ? JSON.parse(achievementsData) : getDefaultAchievements();
    
    const today = format(new Date(), 'yyyy-MM-dd');
    let updated = false;
    let newAchievements: Achievement[] = [];
    
    // Si no hay logros guardados, inicializar con los predeterminados
    if (!achievementsData) {
      updated = true;
    }
    
    // Calcular total de repeticiones
    const totalReps = exercises.reduce((sum, exercise) => sum + (exercise.sets * exercise.reps), 0);
    
    // Verificar logros por repeticiones
    const repMilestones = [
      { id: 'reps_100', target: 100 },
      { id: 'reps_500', target: 500 },
      { id: 'reps_1000', target: 1000 },
      { id: 'reps_5000', target: 5000 }
    ];
    
    for (const milestone of repMilestones) {
      if (totalReps >= milestone.target) {
        const achievement = achievements.find(a => a.id === milestone.id);
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedDate = today;
          newAchievements.push(achievement);
          updated = true;
        }
      }
    }
    
    // Verificar logro de primer ejercicio
    if (exercises.length > 0) {
      const firstExerciseAchievement = achievements.find(a => a.id === 'first_exercise');
      if (firstExerciseAchievement && !firstExerciseAchievement.unlocked) {
        firstExerciseAchievement.unlocked = true;
        firstExerciseAchievement.unlockedDate = today;
        newAchievements.push(firstExerciseAchievement);
        updated = true;
      }
    }
    
    // Verificar logros por cantidad total de ejercicios
    if (exercises.length >= 10) {
      const achievement = achievements.find(a => a.id === 'total_10');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    if (exercises.length >= 50) {
      const achievement = achievements.find(a => a.id === 'total_50');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    if (exercises.length >= 100) {
      const achievement = achievements.find(a => a.id === 'total_100');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    // Verificar logros por racha
    const streak = calculateStreak(exercises);
    
    if (streak >= 3) {
      const achievement = achievements.find(a => a.id === 'streak_3');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    if (streak >= 7) {
      const achievement = achievements.find(a => a.id === 'streak_7');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    if (streak >= 30) {
      const achievement = achievements.find(a => a.id === 'streak_30');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockedDate = today;
        newAchievements.push(achievement);
        updated = true;
      }
    }
    
    // Guardar logros actualizados si hubo cambios
    if (updated) {
      await AsyncStorage.setItem('abwheelAchievements', JSON.stringify(achievements));
    }
    
    return { updated, newAchievements };
  } catch (error) {
    console.error('Error checking achievements', error);
    return { updated: false, newAchievements: [] };
  }
};