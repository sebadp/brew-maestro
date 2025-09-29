import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StepMasterProps {
  onPrimary: () => void;
}

const QUICK_ACTIONS = [
  { icon: 'file-import', label: 'Importar BeerXML' },
  { icon: 'plus-circle', label: 'Nueva Receta' },
  { icon: 'chart-line', label: 'Calculadoras Pro' },
];

export const StepMaster: React.FC<StepMasterProps> = ({ onPrimary }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gradientTop} />
      <View style={styles.gradientBottom} />

      <View style={styles.headerIcon}>
        <MaterialCommunityIcons name="trophy-variant" size={48} color="white" />
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>Evoluciona Como Maestro</Text>
        <Text style={styles.subtitle}>
          Herramientas profesionales + comunidad apasionada
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Calculadora de Recetas</Text>
            <Text style={styles.featureText}>Volumen objetivo, OG y eficiencia con visualizaciones claras.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Comparativa de Batches</Text>
            <Text style={styles.featureText}>Identifica mejoras con gráficos de eficiencia y tiempos.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Comunidad Global</Text>
            <Text style={styles.featureText}>Comparte logros, recetas y aprende de expertos.</Text>
          </View>
        </ScrollView>

        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity key={action.label} style={styles.quickActionButton}>
              <MaterialCommunityIcons name={action.icon as any} size={20} color="#1A1A1A" />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onPrimary}>
          <Text style={styles.primaryText}>Comenzar Mi Masterpiece</Text>
        </TouchableOpacity>

        <Text style={styles.offlineNote}>Funciona 100% sin conexión</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#81A742',
    padding: 24,
    overflow: 'hidden',
  },
  gradientTop: {
    position: 'absolute',
    top: -160,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#4A90E2',
    opacity: 0.4,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#5FB6C9',
    opacity: 0.35,
  },
  headerIcon: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  content: {
    flex: 1,
    marginTop: 32,
    gap: 18,
  },
  headline: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsRow: {
    gap: 16,
    marginTop: 12,
    paddingRight: 16,
  },
  featureCard: {
    width: 220,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 18,
    padding: 18,
  },
  featureTitle: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureText: {
    color: '#424242',
    fontSize: 13,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#FFD166',
  },
  primaryText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  offlineNote: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 10,
    fontWeight: '600',
  },
});

