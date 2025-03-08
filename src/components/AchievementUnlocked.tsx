import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Sound from 'react-native-sound';
import { Achievement } from '../types';

// Habilitar reproducción en modo silencioso
Sound.setCategory('Playback');

interface AchievementUnlockedProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({ achievement, onClose }) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);
  
  useEffect(() => {
    // Reproducir sonido de logro
    const achievementSound = new Sound('achievement.wav', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Error al cargar el sonido:', error);
        return;
      }
      // Ajustar volumen
      achievementSound.setVolume(0.5);
      // Reproducir sonido
      achievementSound.play();
    });
    
    // Animar entrada
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Limpiar el sonido cuando el componente se desmonta
    return () => {
      achievementSound.release();
    };
  }, []);
  
  const handlePress = () => {
    // Animar salida al tocar
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 500,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  return (
    <View style={styles.overlayContainer}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.touchableArea}
      >
        <Animated.View 
          style={[
            styles.container, 
            { 
              transform: [{ translateY }],
              opacity
            }
          ]}
        >
          {/* Contenido de la notificación */}
          <View style={styles.content}>
            <Text style={styles.emoji}>{achievement.icon}</Text>
            <View style={styles.textContainer}>
              <Text style={styles.title}>¡Logro Desbloqueado!</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.description}>{achievement.description}</Text>
            </View>
          </View>
          
          {/* Botón de cerrar más visible */}
          <TouchableOpacity 
            onPress={handlePress} 
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>CERRAR</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 10,
    pointerEvents: 'box-none',
  },
  touchableArea: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#0066cc',
    borderRadius: 12,
    padding: 16,
    width: width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  achievementTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
  },
  tapToClose: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 12,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default AchievementUnlocked;