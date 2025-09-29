import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ScrollView, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createShadow } from '../../utils/shadows';
import { isSQLiteAvailable } from '../../database/brewDb';
import { useBrewTrackerStore } from '../../store/brewTrackerStore';
import useBrewSessionStore, { BrewStepTask } from '../../store/brewSessionStore';
import useRecipeStore, { Recipe } from '../../store/recipeStore';
import { startAlarm, stopAlarm } from '../../utils/alarmSound';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

const BREW_STEPS = [
  { id: 1, name: 'Prepare Equipment', duration: 15 },
  { id: 2, name: 'Heat Water', duration: 30 },
  { id: 3, name: 'Mash In', duration: 60 },
  { id: 4, name: 'Sparge', duration: 30 },
  { id: 5, name: 'Boil - Bittering Hops', duration: 45 },
  { id: 6, name: 'Boil - Flavor Hops', duration: 10 },
  { id: 7, name: 'Boil - Aroma Hops', duration: 5 },
  { id: 8, name: 'Cool Down', duration: 20 },
  { id: 9, name: 'Transfer to Fermenter', duration: 15 },
];

export default function BrewScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionNotes, setSessionNotes] = useState<string[]>([]);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [taskDraft, setTaskDraft] = useState('');
  const [localStepTasks, setLocalStepTasks] = useState<Record<string, BrewStepTask[]>>({});
  const [chooseRecipeVisible, setChooseRecipeVisible] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [stepTargetTs, setStepTargetTs] = useState<number | null>(null);
  const [alarmModalVisible, setAlarmModalVisible] = useState(false);
  const [completedStepName, setCompletedStepName] = useState('');

  const {
    activeSession,
    setActiveSession: setActiveSessionStore,
    startSession: startSessionInStore,
    loadSessions,
    updateSession,
    startStepTimer,
    pauseStepTimer,
    resumeStepTimer,
    clearStepTimer,
    getRemainingTime,
  } = useBrewSessionStore(state => ({
    activeSession: state.activeSession,
    setActiveSession: state.setActiveSession,
    startSession: state.startSession,
    loadSessions: state.loadSessions,
    updateSession: state.updateSession,
    startStepTimer: state.startStepTimer,
    pauseStepTimer: state.pauseStepTimer,
    resumeStepTimer: state.resumeStepTimer,
    clearStepTimer: state.clearStepTimer,
    getRemainingTime: state.getRemainingTime,
  }));
  const {
    addStepTask,
    toggleStepTask,
    removeStepTask,
    addTemplateTask,
    removeTemplateTask,
    loadStepTaskTemplates,
    stepTaskTemplates,
  } = useBrewSessionStore(state => ({
    addStepTask: state.addStepTask,
    toggleStepTask: state.toggleStepTask,
    removeStepTask: state.removeStepTask,
    addTemplateTask: state.addTemplateTask,
    removeTemplateTask: state.removeTemplateTask,
    loadStepTaskTemplates: state.loadStepTaskTemplates,
    stepTaskTemplates: state.stepTaskTemplates,
  }));
  const { startNewBrew, addQuickNote } = useBrewTrackerStore(state => ({
    startNewBrew: state.startNewBrew,
    addQuickNote: state.addQuickNote,
  }));

  const { recipes, loadRecipes, getRecipe } = useRecipeStore(state => ({
    recipes: state.recipes,
    loadRecipes: state.loadRecipes,
    getRecipe: state.getRecipe,
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeSession) {
      interval = setInterval(() => {
        const remaining = getRemainingTime(activeSession.id);
        setTimer(remaining);

        if (remaining <= 0) {
          setIsTimerRunning(false);
          clearStepTimer(activeSession.id);
          const stepName = steps[currentStep]?.name ?? BREW_STEPS[currentStep]?.name ?? 'Step';
          showStepCompletedAlarm(stepName);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeSession, currentStep, getRemainingTime, clearStepTimer, steps]);

  useEffect(() => {
    loadStepTaskTemplates();
  }, [loadStepTaskTemplates]);

  // Sync timer when app comes back from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && activeSession && isTimerRunning) {
        // Recalculate remaining time when app becomes active
        const remaining = getRemainingTime(activeSession.id);
        setTimer(remaining);

        // If timer expired while in background, stop it and alert
        if (remaining <= 0) {
          setIsTimerRunning(false);
          clearStepTimer(activeSession.id);
          const stepName = steps[currentStep]?.name ?? BREW_STEPS[currentStep]?.name ?? 'Step';
          showStepCompletedAlarm(stepName);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [activeSession, isTimerRunning, getRemainingTime, clearStepTimer, steps, currentStep]);

  // Cleanup alarm on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (chooseRecipeVisible && recipes.length === 0) {
      loadRecipes();
    }
  }, [chooseRecipeVisible, recipes.length, loadRecipes]);

  const steps = activeSession?.steps ?? BREW_STEPS;
  const previousSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeSession) {
      const isSameSession = previousSessionIdRef.current === activeSession.id;
      previousSessionIdRef.current = activeSession.id;

      const initialStep = Math.max(
        0,
        Math.min(activeSession.currentStepIndex ?? 0, (activeSession.steps?.length ?? steps.length) - 1)
      );
      setSessionActive(true);
      setCurrentStep(initialStep);
      // Check if there's an active timer for this session
      const remainingTime = getRemainingTime(activeSession.id);
      if (remainingTime > 0) {
        setTimer(remainingTime);
        setIsTimerRunning(true);
      } else {
        const initialDuration = (activeSession.steps?.[initialStep]?.duration ?? steps[initialStep]?.duration ?? 0) * 60;
        setTimer(initialDuration);
        setIsTimerRunning(false);
      }

      if (!isSameSession) {
        setSessionNotes(activeSession.notes ?? []);
        setLocalStepTasks({});
        setTaskDraft('');
      }
      return;
    }

    previousSessionIdRef.current = null;
    setSessionActive(false);
    setIsTimerRunning(false);
    setCurrentStep(0);
    setTimer(0);

    // Stop alarm if no active session
    if (alarmModalVisible) {
      setAlarmModalVisible(false);
      setCompletedStepName('');
      stopAlarm();
    }
  }, [activeSession, steps, alarmModalVisible]);

  const handleStartPress = () => {
    if (activeSession) {
      setSessionActive(true);
      return;
    }

    setChooseRecipeVisible(true);
  };

  const handleSelectRecipe = async (recipeId: string) => {
    if (isStartingSession) {
      return;
    }

    const recipe = getRecipe(recipeId);
    if (!recipe) {
      Alert.alert('Receta no encontrada', 'Actualiza tus recetas y vuelve a intentarlo.');
      return;
    }

    try {
      setIsStartingSession(true);
      await startSessionInStore(recipe);
      setChooseRecipeVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la sesión de brew.');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleCreateRecipe = () => {
    setChooseRecipeVisible(false);
    router.push('/recipe/new');
  };

  const startTimer = async () => {
    if (!activeSession) return;

    if (timer === 0) {
      const duration = steps[currentStep]?.duration ?? BREW_STEPS[currentStep]?.duration ?? 0;
      setTimer(duration * 60);
      await startStepTimer(activeSession.id, duration * 60);
    } else {
      await resumeStepTimer(activeSession.id, timer);
    }
    setIsTimerRunning(true);
  };

  const pauseTimer = async () => {
    if (!activeSession) return;

    setIsTimerRunning(false);
    await pauseStepTimer(activeSession.id);
  };

  const adjustTimer = async (seconds: number) => {
    if (!activeSession) {
      setTimer(prev => {
        const nextValue = prev + seconds;
        return nextValue < 0 ? 0 : nextValue;
      });
      return;
    }

    const newTimer = Math.max(0, timer + seconds);
    setTimer(newTimer);

    if (isTimerRunning) {
      await resumeStepTimer(activeSession.id, newTimer);
    }
  };

  const goToStep = async (targetIndex: number) => {
    const boundedIndex = Math.max(0, Math.min(targetIndex, steps.length - 1));
    setCurrentStep(boundedIndex);
    const duration = steps[boundedIndex]?.duration ?? BREW_STEPS[boundedIndex]?.duration ?? 0;
    setTimer(duration * 60);
    setIsTimerRunning(false);

    // Clear timer when changing steps
    if (activeSession) {
      await clearStepTimer(activeSession.id);
    }

    if (activeSession && activeSession.currentStepIndex !== boundedIndex) {
      try {
        await updateSession(activeSession.id, {
          currentStepIndex: boundedIndex,
          notes: sessionNotes,
        });
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar el paso. Intenta nuevamente.');
      }
    }
  };

  const handleSessionCompletion = async () => {
    setSessionActive(false);
    setIsTimerRunning(false);
    setCurrentStep(0);
    setTimer(0);

    // Clear timer on session completion
    if (activeSession) {
      await clearStepTimer(activeSession.id);
    }

    if (!isSQLiteAvailable) {
      Alert.alert(
        'Brew Day completo!',
        'La sesión terminó. Abre la sección Brews en tu dispositivo móvil para continuar el seguimiento.'
      );
      setSessionNotes([]);
      setLocalStepTasks({});
      setTaskDraft('');
      setActiveSessionStore(null);
      return;
    }

    try {
      const record = await startNewBrew({
        recipeId: activeSession?.recipeId,
        recipeName: activeSession?.recipeName ?? 'Brew Day',
        notes: sessionNotes.length ? sessionNotes.join('\n') : undefined,
      });

      if (sessionNotes.length) {
        await Promise.all(
          sessionNotes.map(note => addQuickNote(record.id, note))
        );
      }

      Alert.alert(
        'Brew Day completo!',
        'El lote fue enviado a Brews para continuar con fermentación y maduración.'
      );
    } catch (error) {
      Alert.alert(
        'Seguimiento no disponible',
        'No se pudo crear el lote de fermentación. Intenta nuevamente desde tu dispositivo móvil.'
      );
    } finally {
      setSessionNotes([]);
      setLocalStepTasks({});
      setTaskDraft('');
      setActiveSessionStore(null);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length - 1) {
      await goToStep(currentStep + 1);
      return;
    }

    await handleSessionCompletion();
  };

  const previousStep = async () => {
    if (currentStep === 0) {
      return;
    }

    await goToStep(currentStep - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showStepCompletedAlarm = (stepName: string) => {
    setCompletedStepName(stepName);
    setAlarmModalVisible(true);
    startAlarm();
  };

  const dismissAlarm = () => {
    setAlarmModalVisible(false);
    setCompletedStepName('');
    stopAlarm();
  };

  const sessionTitle = useMemo(() => activeSession?.recipeName ?? 'Brew Session', [activeSession]);

  const currentSessionStep = activeSession?.steps?.[currentStep];
  const fallbackStepId = BREW_STEPS[currentStep]?.id ?? currentStep + 1;
  const currentStepId = String(currentSessionStep?.id ?? fallbackStepId);
  const currentStepTasks = currentSessionStep?.tasks ?? localStepTasks[currentStepId] ?? [];

  useEffect(() => {
    if (!sessionActive) return;
    if (activeSession) return;

    setLocalStepTasks(prev => {
      const updated: Record<string, BrewStepTask[]> = {};
      BREW_STEPS.forEach(step => {
        const stepId = String(step.id);
        const templates = stepTaskTemplates[stepId] ?? [];
        const existing = prev[stepId] ?? [];
        const existingMap = new Map(existing.map(task => [task.text, task]));
        updated[stepId] = templates.map(text => {
          const match = existingMap.get(text);
          return (
            match ?? {
              id: `template_${stepId}_${Math.random().toString(36).slice(2)}`,
              text,
              completed: false,
            }
          );
        });
      });
      return updated;
    });
  }, [sessionActive, activeSession, stepTaskTemplates]);

  const handleAddTask = async () => {
    const trimmed = taskDraft.trim();
    if (!trimmed) return;

    if (activeSession && currentSessionStep) {
      try {
        await addStepTask(activeSession.id, currentSessionStep.id, trimmed);
        setTaskDraft('');
      } catch (error) {
        Alert.alert('Error', 'No se pudo agregar la tarea. Intenta nuevamente.');
      }
      return;
    }

    const stepId = currentStepId;
    setLocalStepTasks(prev => {
      const existing = prev[stepId] ?? [];
      return {
        ...prev,
        [stepId]: [...existing, { id: `local_${Date.now()}`, text: trimmed, completed: false }],
      };
    });
    setTaskDraft('');
    await addTemplateTask(stepId, trimmed);
  };

  const handleToggleTask = async (taskId: string) => {
    if (activeSession && currentSessionStep) {
      try {
        await toggleStepTask(activeSession.id, currentSessionStep.id, taskId);
      } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar la tarea.');
      }
      return;
    }

    const stepId = currentStepId;
    setLocalStepTasks(prev => {
      const existing = prev[stepId] ?? [];
      return {
        ...prev,
        [stepId]: existing.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    });
  };

  const handleRemoveTask = async (taskId: string) => {
    if (activeSession && currentSessionStep) {
      try {
        await removeStepTask(activeSession.id, currentSessionStep.id, taskId);
      } catch (error) {
        Alert.alert('Error', 'No se pudo eliminar la tarea.');
      }
      return;
    }

    const stepId = currentStepId;
    const existing = localStepTasks[stepId] ?? [];
    const removedTask = existing.find(task => task.id === taskId);
    setLocalStepTasks(prev => {
      const currentTasks = prev[stepId] ?? [];
      return {
        ...prev,
        [stepId]: currentTasks.filter(task => task.id !== taskId),
      };
    });
    if (removedTask) {
      await removeTemplateTask(stepId, removedTask.text);
    }
  };

  if (!sessionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="fire" size={80} color={MAESTRO_GOLD} />
          <Text style={styles.emptyTitle}>Ready to Brew?</Text>
          <Text style={styles.emptySubtitle}>
            {activeSession
              ? `Comienza la cocción de ${activeSession.recipeName} y registra todo lo importante.`
              : 'Selecciona una receta para comenzar un nuevo brew day.'}
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartPress}>
            <Text style={styles.startButtonText}>{activeSession ? 'Reanudar brew' : 'Start Brew Session'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = steps.length > 0 ? (currentStep + 1) / steps.length : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.sessionTitle}>{sessionTitle}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepName}>{steps[currentStep]?.name ?? BREW_STEPS[currentStep]?.name}</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.adjustButton, timer === 0 && styles.adjustButtonDisabled]}
              onPress={() => adjustTimer(-60)}
              disabled={timer === 0}
            >
              <MaterialCommunityIcons
                name="minus"
                size={18}
                color={timer === 0 ? '#CCCCCC' : '#1A1A1A'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.timerButton, { backgroundColor: isTimerRunning ? '#E74C3C' : HOP_GREEN }]}
              onPress={isTimerRunning ? pauseTimer : startTimer}
            >
              <MaterialCommunityIcons
                name={isTimerRunning ? 'pause' : 'play'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.adjustButton} onPress={() => adjustTimer(60)}>
              <MaterialCommunityIcons name="plus" size={18} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
          </View>
        </View>

        <View style={styles.todoSection}>
          <View style={styles.todoHeader}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={18} color={DEEP_BREW} />
            <Text style={styles.todoTitle}>Checklist del paso</Text>
          </View>
          {currentStepTasks.length === 0 ? (
            <Text style={styles.todoEmpty}>Añade tareas para no olvidar ningún detalle.</Text>
          ) : (
            currentStepTasks.map(task => (
              <View key={task.id} style={styles.todoItem}>
                <TouchableOpacity
                  style={styles.todoCheck}
                  onPress={() => handleToggleTask(task.id)}
                >
                  <MaterialCommunityIcons
                    name={task.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={20}
                    color={task.completed ? HOP_GREEN : '#999'}
                  />
                </TouchableOpacity>
                <Text style={[styles.todoText, task.completed && styles.todoTextCompleted]}>
                  {task.text}
                </Text>
                <TouchableOpacity
                  style={styles.todoDelete}
                  onPress={() => handleRemoveTask(task.id)}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={18} color="#C94C4C" />
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={styles.todoInputRow}>
            <TextInput
              style={styles.todoInput}
              placeholder="Nueva tarea para este paso..."
              placeholderTextColor="#999"
              value={taskDraft}
              onChangeText={setTaskDraft}
            />
            <TouchableOpacity
              style={[styles.todoAddButton, !taskDraft.trim() && styles.todoAddButtonDisabled]}
              onPress={handleAddTask}
              disabled={!taskDraft.trim()}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.noteRow}>
          <TouchableOpacity style={styles.noteButton} onPress={() => setNoteModalVisible(true)}>
            <MaterialCommunityIcons name="note-plus" size={20} color="white" />
            <Text style={styles.noteButtonText}>Agregar nota</Text>
        </TouchableOpacity>
        {sessionNotes.length > 0 && (
          <Text style={styles.noteCounter}>{sessionNotes.length} nota(s)</Text>
        )}
      </View>

      {sessionNotes.length > 0 && (
        <ScrollView style={styles.noteList} contentContainerStyle={styles.noteListContent}>
          {sessionNotes.map((note, index) => (
            <View key={index} style={styles.noteItem}>
              <Text style={styles.noteItemLabel}>Nota #{index + 1}</Text>
              <Text style={styles.noteItemText}>{note}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.navButtonSecondary,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={previousStep}
          disabled={currentStep === 0}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={18}
            color={currentStep === 0 ? '#A0A0A0' : DEEP_BREW}
          />
          <Text
            style={[
              styles.navButtonText,
              styles.navButtonTextSecondary,
              currentStep === 0 && styles.navButtonTextDisabled,
            ]}
          >
            Paso anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={currentStep === steps.length - 1 ? handleSessionCompletion : nextStep}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            {currentStep === steps.length - 1 ? 'Completar sesión' : 'Siguiente paso'}
          </Text>
          <MaterialCommunityIcons
            name={currentStep === steps.length - 1 ? 'check' : 'arrow-right'}
            size={18}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={chooseRecipeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isStartingSession) {
            setChooseRecipeVisible(false);
          }
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una receta</Text>

            {recipes.length === 0 ? (
              <>
                <Text style={styles.modalDescription}>
                  Aún no tienes recetas guardadas. Crea una para comenzar tu brew session.
                </Text>
                <TouchableOpacity style={styles.createRecipeButton} onPress={handleCreateRecipe}>
                  <MaterialCommunityIcons name="plus" size={18} color="white" />
                  <Text style={styles.createRecipeText}>Crear nueva receta</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <ScrollView style={styles.recipeModalList} contentContainerStyle={styles.recipeListContent}>
                  {recipes.map((recipe: Recipe) => (
                    <TouchableOpacity
                      key={recipe.id}
                      style={[styles.recipeOption, isStartingSession && styles.recipeOptionDisabled]}
                      onPress={() => handleSelectRecipe(recipe.id)}
                      disabled={isStartingSession}
                    >
                      <Text style={styles.recipeOptionName}>{recipe.name}</Text>
                      <Text style={styles.recipeOptionStyle}>{recipe.style}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.createRecipeLink} onPress={handleCreateRecipe}>
                  <MaterialCommunityIcons name="notebook-plus" size={18} color={HOP_GREEN} />
                  <Text style={styles.createRecipeLinkText}>Crear otra receta</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  if (!isStartingSession) {
                    setChooseRecipeVisible(false);
                  }
                }}
                disabled={isStartingSession}
              >
                <Text style={[styles.modalSecondaryText, isStartingSession && styles.modalDisabledText]}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={noteModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar nota</Text>
            <Text style={styles.modalSubtitle}>
              Paso {currentStep + 1}: {steps[currentStep]?.name ?? BREW_STEPS[currentStep]?.name}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Observaciones, aromas, recordatorios..."
              value={noteDraft}
              onChangeText={setNoteDraft}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  setNoteDraft('');
                  setNoteModalVisible(false);
                }}
              >
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, noteDraft.trim().length === 0 && styles.modalPrimaryDisabled]}
                onPress={() => {
                  if (!noteDraft.trim()) return;
                  const timestamp = new Date().toLocaleTimeString();
                  setSessionNotes(prev => [
                    ...prev,
                    `Paso ${currentStep + 1} - ${steps[currentStep]?.name ?? BREW_STEPS[currentStep]?.name}: ${noteDraft.trim()} (${timestamp})`,
                  ]);
                  setNoteDraft('');
                  setNoteModalVisible(false);
                }}
                disabled={noteDraft.trim().length === 0}
              >
                <Text style={styles.modalPrimaryText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={alarmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}} // Prevent dismissal with back button
      >
        <View style={styles.alarmContainer}>
          <View style={styles.alarmContent}>
            <View style={styles.alarmIcon}>
              <MaterialCommunityIcons name="alarm" size={80} color={MAESTRO_GOLD} />
            </View>
            <Text style={styles.alarmTitle}>¡Tiempo completo!</Text>
            <Text style={styles.alarmMessage}>{completedStepName} terminado</Text>
            <Text style={styles.alarmSubtitle}>Es hora del siguiente paso</Text>

            <TouchableOpacity style={styles.alarmButton} onPress={dismissAlarm}>
              <Text style={styles.alarmButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DEEP_BREW,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DEEP_BREW,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: HOP_GREEN,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  todoSection: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    ...createShadow('#000', { width: 0, height: 2 }, 0.08, 10, 6),
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  todoTitle: {
    color: DEEP_BREW,
    fontSize: 16,
    fontWeight: '700',
  },
  todoEmpty: {
    color: '#8C8C8C',
    fontSize: 13,
    marginBottom: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  todoCheck: {
    padding: 4,
  },
  todoText: {
    flex: 1,
    color: DEEP_BREW,
    fontSize: 14,
  },
  todoTextCompleted: {
    color: '#8C8C8C',
    textDecorationLine: 'line-through',
  },
  todoDelete: {
    padding: 4,
  },
  todoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  todoInput: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: DEEP_BREW,
  },
  todoAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: HOP_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todoAddButtonDisabled: {
    backgroundColor: '#C5D7B2',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  noteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HOP_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  noteButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  noteCounter: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  noteList: {
    maxHeight: 140,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  noteListContent: {
    paddingBottom: 4,
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    ...createShadow('#000', { width: 0, height: 1 }, 0.06, 6, 3),
    marginBottom: 8,
  },
  noteItemLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 4,
  },
  noteItemText: {
    fontSize: 14,
    color: DEEP_BREW,
  },
  stepCard: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...createShadow('#000', { width: 0, height: 2 }, 0.1, 4, 4),
  },
  stepName: {
    fontSize: 20,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 24,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: MAESTRO_GOLD,
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  adjustButtonDisabled: {
    backgroundColor: '#F3F3F3',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  navButtonSecondary: {
    backgroundColor: '#EFEFEF',
  },
  navButtonPrimary: {
    backgroundColor: HOP_GREEN,
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextSecondary: {
    color: DEEP_BREW,
  },
  navButtonTextPrimary: {
    color: 'white',
  },
  navButtonTextDisabled: {
    color: '#A0A0A0',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DEEP_BREW,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 8,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  modalSecondaryText: {
    color: '#6B6B6B',
    fontWeight: '600',
  },
  modalPrimary: {
    backgroundColor: HOP_GREEN,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 12,
  },
  modalPrimaryDisabled: {
    backgroundColor: '#AFCDA0',
  },
  modalPrimaryText: {
    color: 'white',
    fontWeight: '700',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 12,
    marginBottom: 16,
  },
  recipeModalList: {
    maxHeight: 260,
    marginTop: 12,
  },
  recipeListContent: {
    paddingBottom: 12,
  },
  recipeOption: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  recipeOptionDisabled: {
    opacity: 0.6,
  },
  recipeOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  recipeOptionStyle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HOP_GREEN,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  createRecipeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  createRecipeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  createRecipeLinkText: {
    color: HOP_GREEN,
    fontWeight: '600',
  },
  modalDisabledText: {
    color: '#A0A0A0',
  },
  // Alarm modal styles
  alarmContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alarmContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '90%',
    ...createShadow('#000', { width: 0, height: 8 }, 0.3, 20, 10),
  },
  alarmIcon: {
    marginBottom: 20,
    backgroundColor: '#FFF8E7',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
    textAlign: 'center',
    marginBottom: 12,
  },
  alarmMessage: {
    fontSize: 20,
    fontWeight: '600',
    color: MAESTRO_GOLD,
    textAlign: 'center',
    marginBottom: 8,
  },
  alarmSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  alarmButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 150,
  },
  alarmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
