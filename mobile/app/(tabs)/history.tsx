import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createShadow } from '../../utils/shadows';
import { formatDate, formatDateTime } from '../../utils/date';
import useBrewSessionStore, { BrewSession, BrewStep } from '../../store/brewSessionStore';
import { BrewRecord, useBrewTrackerStore } from '../../store/brewTrackerStore';
import { isSQLiteAvailable } from '../../database/brewDb';
import { useFocusEffect } from 'expo-router';
import BrewDetailsModal from '../../components/shared/BrewDetailsModal';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';
const FERMENTATION_ORANGE = '#FF6B35';

interface HistoryCardProps {
  session: BrewSession;
  onViewDetails: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  deleting?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'brewing':
      return FERMENTATION_ORANGE;
    case 'fermenting':
      return MAESTRO_GOLD;
    case 'conditioning':
      return HOP_GREEN;
    case 'completed':
      return '#4CAF50';
    default:
      return '#666';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'brewing':
      return 'Brew Day';
    case 'fermenting':
      return 'Fermentando';
    case 'conditioning':
      return 'Madurando';
    case 'completed':
      return 'Completado';
    default:
      return status;
  }
};

const TRACKER_STATUS_SEQUENCE: BrewRecord['status'][] = [
  'brewing',
  'fermenting',
  'conditioning',
  'completed',
  'archived',
];

const convertBrewRecordToSession = (brew: BrewRecord): BrewSession => {
  const statusIndex = Math.max(TRACKER_STATUS_SEQUENCE.indexOf(brew.status), 0);
  const sessionStatus: BrewSession['status'] = brew.status === 'archived' ? 'completed' : brew.status;

  const steps: BrewStep[] = [
    {
      id: '1',
      name: 'Brew Day',
      duration: 0,
      completed: statusIndex > 0 || Boolean(brew.fermentationStart),
      completedAt: brew.fermentationStart ?? undefined,
    },
    {
      id: '2',
      name: 'Fermentación',
      duration: 0,
      completed: statusIndex > 1 || Boolean(brew.conditioningStart),
      completedAt: brew.conditioningStart ?? undefined,
    },
    {
      id: '3',
      name: 'Maduración',
      duration: 0,
      completed: statusIndex > 2 || Boolean(brew.packagingDate),
      completedAt: brew.packagingDate ?? undefined,
    },
    {
      id: '4',
      name: 'Envasado',
      duration: 0,
      completed: statusIndex > 2 || Boolean(brew.packagingDate),
      completedAt: brew.packagingDate ?? undefined,
    },
  ];

  const quickNotes = [...(brew.quickNotes ?? [])]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(note => `${formatDateTime(note.timestamp)}: ${note.text}`);

  const noteSet = new Set<string>(quickNotes);

  if (brew.notes) {
    brew.notes
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .forEach(note => noteSet.add(note));
  }

  return {
    id: brew.id,
    recipeId: brew.recipeId ?? brew.id,
    recipeName: brew.recipeName,
    status: sessionStatus,
    startedAt: brew.brewDate,
    completedAt: brew.packagingDate ?? undefined,
    currentStepIndex: Math.min(statusIndex, steps.length - 1),
    steps,
    measurements: [],
    notes: Array.from(noteSet),
    efficiency: undefined,
    actualOG: brew.originalGravity ?? undefined,
    actualFG: brew.finalGravity ?? undefined,
    actualABV: brew.measuredAbv ?? undefined,
  };
};

const HistoryCard: React.FC<HistoryCardProps> = ({ session, onViewDetails, onDelete, deleting = false }) => {
  const completedSteps = session.steps.filter(step => step.completed).length;
  const hasNotes = session.notes.length > 0;

  return (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.recipeTitleBlock}>
          <Text style={styles.recipeLabel}>Receta base</Text>
          <Text style={styles.recipeName}>{session.recipeName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
          <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.brewDate}>Iniciado el {formatDate(session.startedAt)}</Text>

        <View style={styles.progressInfo}>
          <MaterialCommunityIcons name="progress-check" size={14} color="#666" />
          <Text style={styles.progressText}>
            {completedSteps} de {session.steps.length} pasos
          </Text>
        </View>

        {hasNotes && (
          <View style={styles.notesInfo}>
            <MaterialCommunityIcons name="note-text" size={14} color={HOP_GREEN} />
            <Text style={styles.notesText}>{session.notes.length} nota(s)</Text>
          </View>
        )}
      </View>

      {(session.actualOG || session.actualFG || session.actualABV || session.efficiency) && (
        <View style={styles.statsGrid}>
          {session.actualOG && (
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>OG</Text>
              <Text style={styles.statValue}>{session.actualOG.toFixed(3)}</Text>
            </View>
          )}
          {session.actualFG && (
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>FG</Text>
              <Text style={styles.statValue}>{session.actualFG.toFixed(3)}</Text>
            </View>
          )}
          {session.actualABV && (
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>ABV</Text>
              <Text style={styles.statValue}>{session.actualABV.toFixed(1)}%</Text>
            </View>
          )}
          {session.efficiency && (
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Eficiencia</Text>
              <Text style={styles.statValue}>{session.efficiency}%</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.cardActionButton} onPress={() => onViewDetails(session.id)}>
          <MaterialCommunityIcons name="information-outline" size={16} color={DEEP_BREW} />
          <Text style={styles.cardActionLabel}>Ver detalles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardActionButton, styles.cardActionDangerButton, deleting && styles.cardActionDisabled]}
          onPress={() => onDelete(session.id)}
          disabled={deleting}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color={deleting ? '#B0B0B0' : '#C94C4C'}
          />
          <Text style={[styles.cardActionLabel, styles.cardActionDangerLabel]}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HistoryScreen() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const usingSQLite = isSQLiteAvailable;

  const { sessions: sessionStoreSessions, loadSessions, deleteSession } = useBrewSessionStore(state => ({
    sessions: state.sessions,
    loadSessions: state.loadSessions,
    deleteSession: state.deleteSession,
  }));

  const { activeBrews, archivedBrews, loadBrews, addQuickNote, deleteBrew } = useBrewTrackerStore(state => ({
    activeBrews: state.activeBrews,
    archivedBrews: state.archivedBrews,
    loadBrews: state.loadBrews,
    addQuickNote: state.addQuickNote,
    deleteBrew: state.deleteBrew,
  }));

  useEffect(() => {
    if (usingSQLite) {
      loadBrews();
    } else {
      loadSessions();
    }
  }, [usingSQLite, loadBrews, loadSessions]);

  useFocusEffect(
    useCallback(() => {
      if (usingSQLite) {
        loadBrews();
      }
    }, [usingSQLite, loadBrews])
  );

  const historyData = useMemo(() => {
    if (usingSQLite) {
      const recordMap = new Map<string, BrewRecord>();
      const combined = [...activeBrews, ...archivedBrews].sort(
        (a, b) => new Date(b.brewDate).getTime() - new Date(a.brewDate).getTime()
      );
      const sessions = combined.map(record => {
        recordMap.set(record.id, record);
        return convertBrewRecordToSession(record);
      });
      return { sessions, recordMap };
    }

    const sortedSessions = [...sessionStoreSessions].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    return { sessions: sortedSessions, recordMap: null };
  }, [usingSQLite, activeBrews, archivedBrews, sessionStoreSessions]);

  const historySessions = historyData.sessions;

  const handleViewDetails = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setModalVisible(true);
  };

  const confirmDelete = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      if (usingSQLite) {
        await deleteBrew(sessionId);
        await loadBrews();
      } else {
        await deleteSession(sessionId);
        await loadSessions();
      }
      if (selectedSessionId === sessionId) {
        handleCloseModal();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la cocción.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRequest = (sessionId: string) => {
    const session = historySessions.find(item => item.id === sessionId);
    if (!session) {
      return;
    }

    Alert.alert(
      'Eliminar cocción',
      `¿Quieres eliminar "${session.recipeName}" del historial?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => confirmDelete(session.id) },
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSessionId(null);
  };

  const selectedSession = useMemo(() => {
    if (!selectedSessionId) return null;
    return historySessions.find(session => session.id === selectedSessionId) ?? null;
  }, [selectedSessionId, historySessions]);

  const totalBatches = historySessions.length;
  const completedBatches = historySessions.filter(s => s.status === 'completed').length;
  const efficiencyValues = historySessions
    .map(session => session.efficiency)
    .filter((value): value is number => typeof value === 'number');
  const avgEfficiency = efficiencyValues.length > 0
    ? Math.round(efficiencyValues.reduce((sum, value) => sum + value, 0) / efficiencyValues.length)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial de Lotes</Text>
      </View>

      {historySessions.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tus Estadísticas</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalBatches}</Text>
              <Text style={styles.summaryLabel}>Total Lotes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{completedBatches}</Text>
              <Text style={styles.summaryLabel}>Completados</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{avgEfficiency > 0 ? `${avgEfficiency}%` : '-'}</Text>
              <Text style={styles.summaryLabel}>Eficiencia Prom.</Text>
            </View>
          </View>
        </View>
      )}

      {historySessions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="history" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Sin lotes registrados</Text>
          <Text style={styles.emptySubtitle}>
            Tus sesiones de brew aparecerán aquí una vez que completes el brew day
          </Text>
        </View>
      ) : (
        <FlatList
          data={historySessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              session={item}
              onViewDetails={handleViewDetails}
              onDelete={handleDeleteRequest}
              deleting={deletingId === item.id}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BrewDetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        brewSession={selectedSession}
        onAddNote={usingSQLite ? addQuickNote : undefined}
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
  recipeTitleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  recipeLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardInfo: {
    marginBottom: 12,
  },
  brewDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  notesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesText: {
    fontSize: 12,
    color: HOP_GREEN,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statColumn: {
    alignItems: 'center',
    minWidth: '23%',
    marginBottom: 8,
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
    color: MAESTRO_GOLD,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
  },
  cardActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DEEP_BREW,
    marginLeft: 8,
  },
  cardActionDangerButton: {
    justifyContent: 'flex-end',
  },
  cardActionDangerLabel: {
    color: '#C94C4C',
  },
  cardActionDisabled: {
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DEEP_BREW,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
