import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createShadow } from '../../utils/shadows';
import { formatDate } from '../../utils/date';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';
const FERMENTATION_ORANGE = '#FF6B35';

// Mock data for brew history
const mockHistory = [
  {
    id: '1',
    recipeName: 'American IPA',
    brewDate: '2024-01-15',
    status: 'Bottled',
    targetABV: 6.2,
    actualABV: 6.4,
    targetOG: 1.062,
    actualOG: 1.065,
    targetFG: 1.012,
    actualFG: 1.010,
    efficiency: 82,
    rating: 4,
  },
  {
    id: '2',
    recipeName: 'Wheat Beer',
    brewDate: '2024-01-08',
    status: 'Fermenting',
    targetABV: 5.1,
    actualABV: null,
    targetOG: 1.048,
    actualOG: 1.050,
    targetFG: 1.010,
    actualFG: null,
    efficiency: 78,
    rating: null,
  },
  {
    id: '3',
    recipeName: 'Porter',
    brewDate: '2023-12-20',
    status: 'Consumed',
    targetABV: 5.8,
    actualABV: 5.6,
    targetOG: 1.055,
    actualOG: 1.053,
    targetFG: 1.012,
    actualFG: 1.013,
    efficiency: 75,
    rating: 5,
  },
];

interface HistoryCardProps {
  batch: typeof mockHistory[0];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Fermenting':
      return FERMENTATION_ORANGE;
    case 'Bottled':
      return MAESTRO_GOLD;
    case 'Consumed':
      return HOP_GREEN;
    default:
      return '#666';
  }
};

const HistoryCard: React.FC<HistoryCardProps> = ({ batch }) => (
  <View style={styles.historyCard}>
    <View style={styles.cardHeader}>
      <Text style={styles.recipeName}>{batch.recipeName}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
        <Text style={styles.statusText}>{batch.status}</Text>
      </View>
    </View>

    <Text style={styles.brewDate}>Brewed on {formatDate(batch.brewDate)}</Text>

    <View style={styles.statsGrid}>
      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>ABV</Text>
        <Text style={styles.statValue}>
          {batch.actualABV ? `${batch.actualABV}%` : 'Pending'}
        </Text>
        <Text style={styles.statTarget}>Target: {batch.targetABV}%</Text>
      </View>

      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>OG</Text>
        <Text style={styles.statValue}>{batch.actualOG}</Text>
        <Text style={styles.statTarget}>Target: {batch.targetOG}</Text>
      </View>

      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>FG</Text>
        <Text style={styles.statValue}>
          {batch.actualFG ? batch.actualFG : 'Pending'}
        </Text>
        <Text style={styles.statTarget}>Target: {batch.targetFG}</Text>
      </View>

      <View style={styles.statColumn}>
        <Text style={styles.statLabel}>Efficiency</Text>
        <Text style={styles.statValue}>{batch.efficiency}%</Text>
        <Text style={styles.statTarget}>
          {batch.efficiency > 80 ? 'Excellent' : batch.efficiency > 75 ? 'Good' : 'Improve'}
        </Text>
      </View>
    </View>

    {batch.rating && (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rating:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <MaterialCommunityIcons
              key={star}
              name={star <= batch.rating! ? 'star' : 'star-outline'}
              size={16}
              color={MAESTRO_GOLD}
            />
          ))}
        </View>
      </View>
    )}
  </View>
);

export default function HistoryScreen() {
  const totalBatches = mockHistory.length;
  const completedBatches = mockHistory.filter(b => b.status === 'Consumed').length;
  const avgEfficiency = Math.round(
    mockHistory.reduce((sum, batch) => sum + batch.efficiency, 0) / totalBatches
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brew History</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Stats</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{totalBatches}</Text>
            <Text style={styles.summaryLabel}>Total Batches</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{completedBatches}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{avgEfficiency}%</Text>
            <Text style={styles.summaryLabel}>Avg Efficiency</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard batch={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: MAESTRO_GOLD,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  brewDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 2,
  },
  statTarget: {
    fontSize: 10,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
});
