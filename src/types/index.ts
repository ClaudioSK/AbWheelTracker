// Definición para un ejercicio con rueda abdominal
export interface Exercise {
  id: string;
  date: string;
  sets: number;
  reps: number;
  notes?: string;
}

// Definición para un logro
export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
}

// Definición para la configuración de la app
export interface AppSettings {
  enableReminders: boolean;
  reminderTime: string;
  darkMode: boolean;
}

// Tipos para los parámetros de navegación
export type RootStackParamList = {
  Home: undefined;
  AddExercise: { date?: string }; // Ahora puede recibir una fecha opcional
  History: undefined;
  Achievements: undefined;
  Settings: undefined;
};
