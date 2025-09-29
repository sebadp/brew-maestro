import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { createShadow } from '../../utils/shadows';
import { BrewRecord, BrewStatus, useBrewTrackerStore } from '../../store/brewTrackerStore';

interface ActiveFermentationCardProps {
  brew: BrewRecord;
  onPress?: (brew: BrewRecord) => void;
  onLongPress?: (brew: BrewRecord) => void;
}

const STATUS_COLORS: Record<BrewStatus, string> = {
  brewing: '#F6C101',
  fermenting: '#81A742',
  conditioning: '#4A90E2',
  completed: '#2D9CDB',
  archived: '#6B6B6B',
};

const formatDayCounter = (day: number) => `${day} ${day === 1 ? 'día' : 'días'}`;

export const ActiveFermentationCard: React.FC<ActiveFermentationCardProps> = ({
  brew,
  onPress,
  onLongPress,
}) => {
  const getFermentationDay = useBrewTrackerStore(state => state.getFermentationDay);
  const getBrewProgress = useBrewTrackerStore(state => state.getBrewProgress);

  const fermentationDay = useMemo(() => getFermentationDay(brew), [brew, getFermentationDay]);
  const progress = useMemo(() => Math.round(getBrewProgress(brew)), [brew, getBrewProgress]);

  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (brew.status === 'fermenting') {
      animationRef.current?.stop();
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleAnim, {
            toValue: -12,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnim, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      bubbleAnim.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [brew.status, bubbleAnim]);

  const statusColor = STATUS_COLORS[brew.status];

  const statusLabel = useMemo(() => {
    switch (brew.status) {
      case 'brewing':
        return 'Cocción activa';
      case 'fermenting':
        return `Fermentando · ${formatDayCounter(fermentationDay)}`;
      case 'conditioning': {
        const conditioningDays = fermentationDay - (brew.targetFermentationDays ?? 0);
        return `Madurando · ${formatDayCounter(Math.max(conditioningDays, 0))}`;
      }
      case 'completed':
        return 'Lista para disfrutar';
      case 'archived':
        return 'Archivada';
      default:
        return brew.status;
    }
  }, [brew.status, fermentationDay, brew.targetFermentationDays]);

  const estimatedAbv = useMemo(() => {
    if (typeof brew.originalGravity !== 'number' || typeof brew.finalGravity !== 'number') {
      return brew.measuredAbv ?? null;
    }
    const abv = (brew.originalGravity - brew.finalGravity) * 131.25;
    return Math.max(0, Math.round(abv * 10) / 10);
  }, [brew.finalGravity, brew.measuredAbv, brew.originalGravity]);

  return (
    <Pressable onPress={() => onPress?.(brew)} onLongPress={() => onLongPress?.(brew)}>
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.recipeName}>{brew.recipeName}</Text>
              <Text style={[styles.status, { color: statusColor }]}>{statusLabel}</Text>
            </View>

            {brew.fermentationTemp && (
              <View style={styles.temperatureBadge}>
                <Text style={styles.temperatureValue}>{brew.fermentationTemp.toFixed(0)}°C</Text>
                <Text style={styles.temperatureLabel}>Fermentación</Text>
              </View>
            )}
          </View>

          <View style={styles.progressRow}>
            <View style={styles.progressBar}> 
              <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: statusColor }]} />
            </View>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>

          <View style={styles.statsRow}>
            {brew.originalGravity && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>OG</Text>
                <Text style={styles.statValue}>{brew.originalGravity.toFixed(3)}</Text>
              </View>
            )}

            {brew.finalGravity && (
              <View style={styles.stat}>
                <Text style={styles.statLabel}>FG</Text>
                <Text style={styles.statValue}>{brew.finalGravity.toFixed(3)}</Text>
              </View>
            )}

            <View style={styles.stat}>
              <Text style={styles.statLabel}>ABV Est.</Text>
              <Text style={styles.statValue}>{estimatedAbv ? `${estimatedAbv.toFixed(1)}%` : '--'}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Meta Fermentación</Text>
              <Text style={styles.statValue}>{brew.targetFermentationDays} días</Text>
            </View>
          </View>
        </View>

        {brew.status === 'fermenting' && (
          <Animated.View style={[styles.bubbleContainer, { transform: [{ translateY: bubbleAnim }] }]}> 
            {[0, 1, 2].map(index => (
              <View
                key={index}
                style={[
                  styles.bubble,
                  {
                    left: 16 + index * 28,
                    width: 8 + index * 4,
                    height: 8 + index * 4,
                  },
                ]}
              />
            ))}
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...createShadow('#000000', { width: 0, height: 4 }, 0.08, 12, 6),
  },
  accent: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  temperatureBadge: {
    alignItems: 'center',
    backgroundColor: '#F6C10120',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  temperatureValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  temperatureLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#F1F1F1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressValue: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B4423',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B8B8B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  bubbleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    height: 24,
    flexDirection: 'row',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#81A74240',
    borderRadius: 20,
  },
});

export default ActiveFermentationCard;

