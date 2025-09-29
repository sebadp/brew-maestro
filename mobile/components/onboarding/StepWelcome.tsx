import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StepWelcomeProps {
  onNext: () => void;
}

const BULLETS = [
  { icon: 'book-open-variant', text: 'Recetas probadas por maestros cerveceros' },
  { icon: 'calculator-variant', text: 'Calculadoras profesionales en tu bolsillo' },
  { icon: 'format-list-checks', text: 'Guías paso a paso para cada etapa' },
];

export const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleAnim, {
          toValue: -12,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bubbleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [bubbleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.gradientBase} />
      <View style={styles.gradientAccent} />

      <View style={styles.content}>
        <View style={styles.illustration}>
          <View style={styles.phoneMock}>
            <View style={styles.phoneHeader}>
              <MaterialCommunityIcons name="signal" size={12} color="#F6C101" />
              <MaterialCommunityIcons name="wifi" size={12} color="#F6C101" />
              <MaterialCommunityIcons name="battery" size={12} color="#F6C101" />
            </View>
            <View style={styles.phoneCard}>
              <MaterialCommunityIcons name="beer" size={32} color="#F6C101" />
              <Text style={styles.phoneCardTitle}>American IPA</Text>
              <Text style={styles.phoneCardSubtitle}>Fermentando · Día 3</Text>
            </View>
            <View style={styles.phoneFooter}>
              <MaterialCommunityIcons name="thermometer" size={16} color="#FF6B35" />
              <Text style={styles.phoneFooterText}>18°C • Alertas activas</Text>
            </View>
          </View>

          <Animated.View
            style={[styles.bubbles, { transform: [{ translateY: bubbleAnim }] }]}
          >
            {[0, 1, 2].map(index => (
              <View
                key={index}
                style={[styles.bubble, { left: 24 + index * 28, opacity: 0.4 - index * 0.1 }]}
              />
            ))}
          </Animated.View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.headline}>Bienvenido a BrewMaestro</Text>
          <Text style={styles.subheading}>Tu compañero inteligente para crear cervezas extraordinarias</Text>

          <View style={styles.bullets}>
            {BULLETS.map(item => (
              <View key={item.icon} style={styles.bulletRow}>
                <MaterialCommunityIcons name={item.icon as any} size={20} color="white" />
                <Text style={styles.bulletText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onNext}>
          <Text style={styles.ctaText}>Empezar Mi Primera Cerveza</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6C101',
    overflow: 'hidden',
  },
  gradientBase: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#FF6B35',
    opacity: 0.35,
  },
  gradientAccent: {
    position: 'absolute',
    bottom: -140,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FF9157',
    opacity: 0.25,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 60,
    justifyContent: 'space-between',
  },
  illustration: {
    alignItems: 'center',
  },
  phoneMock: {
    width: 220,
    borderRadius: 28,
    backgroundColor: '#2C2C2C',
    padding: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  phoneHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 4,
  },
  phoneCard: {
    marginTop: 16,
    backgroundColor: '#3B3B3B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  phoneCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  phoneCardSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
  },
  phoneFooter: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneFooterText: {
    color: '#FAD2C0',
    fontSize: 12,
  },
  bubbles: {
    position: 'absolute',
    bottom: -12,
    left: 40,
    right: 40,
    height: 40,
    flexDirection: 'row',
  },
  bubble: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  textBlock: {
    gap: 14,
  },
  headline: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
  },
  subheading: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    lineHeight: 22,
  },
  bullets: {
    marginTop: 12,
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  ctaButton: {
    marginTop: 20,
    backgroundColor: '#F6C101',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});

