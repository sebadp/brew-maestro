import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrewSession } from '../../store/brewSessionStore';
import { createShadow } from '../../utils/shadows';
import { formatDate, formatDateTime } from '../../utils/date';
import useBrewSessionStore from '../../store/brewSessionStore';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';
const FERMENTATION_ORANGE = '#FF6B35';

interface BrewDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  brewSession: BrewSession | null;
  onAddNote?: (sessionId: string, note: string) => Promise<void>;
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

// Parse note to extract step info, content, and timestamp
const parseNote = (note: string, index: number) => {
  // Check if it's a structured note: "Paso X - StepName: content (timestamp)"
  const stepMatch = note.match(/^Paso (\d+) - ([^:]+): (.+) \(([^)]+)\)$/);

  if (stepMatch) {
    return {
      id: `note_${index}`,
      step: parseInt(stepMatch[1]),
      stepName: stepMatch[2].trim(),
      content: stepMatch[3].trim(),
      timestamp: stepMatch[4],
      type: 'brew_step' as const,
    };
  }

  // Check if it's a timestamped note: "timestamp: content"
  // Quick notes come in the format "DD/MM/YYYY HH:MM: content"
  const separatorIndex = note.lastIndexOf(': ');
  if (separatorIndex !== -1) {
    const potentialTimestamp = note.slice(0, separatorIndex).trim();
    const content = note.slice(separatorIndex + 2).trim();

    const looksLikeTimestamp = /\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(potentialTimestamp);

    if (looksLikeTimestamp && content.length > 0) {
      return {
        id: `note_${index}`,
        content,
        timestamp: potentialTimestamp,
        type: 'quick_note' as const,
      };
    }
  }

  // Plain note without timestamp
  return {
    id: `note_${index}`,
    content: note,
    type: 'plain' as const,
  };
};

export default function BrewDetailsModal({ visible, onClose, brewSession, onAddNote }: BrewDetailsModalProps) {
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const { addNote } = useBrewSessionStore();

  if (!brewSession) {
    return null;
  }

  const parsedNotes = brewSession.notes.map((note, index) => parseNote(note, index));

  // Separate notes by type
  const brewStepNotes = parsedNotes.filter(note => note.type === 'brew_step');
  const quickNotes = parsedNotes.filter(note => note.type === 'quick_note');
  const plainNotes = parsedNotes.filter(note => note.type === 'plain');

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    const noteHandler = onAddNote ?? addNote;

    try {
      await noteHandler(brewSession.id, noteText.trim());
      setNoteText('');
      setShowAddNote(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la nota');
    }
  };

  const completedSteps = brewSession.steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / brewSession.steps.length) * 100;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={DEEP_BREW} />
          </TouchableOpacity>
          <Text style={styles.title}>Detalles del Lote</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Session Overview */}
          <View style={styles.overviewCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.recipeName}>{brewSession.recipeName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(brewSession.status) }]}>
                <Text style={styles.statusText}>{getStatusText(brewSession.status)}</Text>
              </View>
            </View>

            <Text style={styles.brewDate}>
              Iniciado el {formatDate(brewSession.startedAt)}
            </Text>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progreso</Text>
                <Text style={styles.progressText}>
                  {completedSteps} de {brewSession.steps.length} pasos
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>

            {/* Stats */}
            {(brewSession.actualOG || brewSession.actualFG || brewSession.efficiency) && (
              <View style={styles.statsGrid}>
                {brewSession.actualOG && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>OG Real</Text>
                    <Text style={styles.statValue}>{brewSession.actualOG.toFixed(3)}</Text>
                  </View>
                )}
                {brewSession.actualFG && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>FG Real</Text>
                    <Text style={styles.statValue}>{brewSession.actualFG.toFixed(3)}</Text>
                  </View>
                )}
                {brewSession.actualABV && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>ABV Real</Text>
                    <Text style={styles.statValue}>{brewSession.actualABV.toFixed(1)}%</Text>
                  </View>
                )}
                {brewSession.efficiency && (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Eficiencia</Text>
                    <Text style={styles.statValue}>{brewSession.efficiency}%</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Notes Section */}
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Notas del Lote</Text>
              <TouchableOpacity
                style={styles.addNoteButton}
                onPress={() => setShowAddNote(!showAddNote)}
              >
                <MaterialCommunityIcons
                  name={showAddNote ? "minus" : "plus"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            {/* Add Note Section */}
            {showAddNote && (
              <View style={styles.addNoteSection}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Agregar observación sobre este lote..."
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  numberOfLines={3}
                />
                <View style={styles.addNoteActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setNoteText('');
                      setShowAddNote(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, !noteText.trim() && styles.saveButtonDisabled]}
                    onPress={handleAddNote}
                    disabled={!noteText.trim()}
                  >
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Brew Day Notes */}
            {brewStepNotes.length > 0 && (
              <View style={styles.noteSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="fire" size={16} color={FERMENTATION_ORANGE} />
                  <Text style={styles.sectionTitle}>Notas de Brew Day</Text>
                </View>
                {brewStepNotes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteStep}>Paso {note.step} - {note.stepName}</Text>
                      <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                    </View>
                    <Text style={styles.noteContent}>{note.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Quick Notes */}
            {quickNotes.length > 0 && (
              <View style={styles.noteSection}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="note-text" size={16} color={HOP_GREEN} />
                  <Text style={styles.sectionTitle}>Notas Adicionales</Text>
                </View>
                {quickNotes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTimestamp}>{note.timestamp}</Text>
                    </View>
                    <Text style={styles.noteContent}>{note.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Plain Notes */}
            {plainNotes.length > 0 && (
              <View style={styles.noteSection}>
                {plainNotes.map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Text style={styles.noteContent}>{note.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {parsedNotes.length === 0 && (
              <View style={styles.emptyNotes}>
                <MaterialCommunityIcons name="note-outline" size={48} color="#CCC" />
                <Text style={styles.emptyNotesTitle}>Sin notas registradas</Text>
                <Text style={styles.emptyNotesSubtitle}>
                  Las observaciones de Brew Day y notas adicionales aparecerán aquí
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 20,
    fontWeight: '700',
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
  brewDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DEEP_BREW,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HOP_GREEN,
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    minWidth: '23%',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: MAESTRO_GOLD,
  },
  notesCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  addNoteButton: {
    width: 32,
    height: 32,
    backgroundColor: HOP_GREEN,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    fontSize: 14,
  },
  addNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: HOP_GREEN,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noteSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  noteItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteStep: {
    fontSize: 12,
    fontWeight: '600',
    color: FERMENTATION_ORANGE,
  },
  noteTimestamp: {
    fontSize: 11,
    color: '#666',
  },
  noteContent: {
    fontSize: 14,
    color: DEEP_BREW,
    lineHeight: 18,
  },
  emptyNotes: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyNotesSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
