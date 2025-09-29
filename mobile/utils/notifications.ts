import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes, type NotificationTriggerInput } from 'expo-notifications';

type NotificationType = 'fermentation' | 'conditioning' | 'brew-step';

const NOTIFICATION_TITLES: Record<NotificationType, string> = {
  fermentation: '🍺 Fermentación lista',
  conditioning: '🍾 Maduración completa',
  'brew-step': '⏰ Paso de cocción completo',
};

const NOTIFICATION_BODIES: Record<NotificationType, string> = {
  fermentation: 'Repasa la gravedad y decide si pasas a maduración.',
  conditioning: 'Hora de embotellar o servir tu cerveza.',
  'brew-step': 'Es hora del siguiente paso en tu brew day.',
};

const ensurePermissions = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const request = await Notifications.requestPermissionsAsync();
  return request.granted || request.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
};

export const scheduleBrewNotification = async (
  brewId: string,
  type: NotificationType,
  triggerDate?: Date | null
) => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return;

  const trigger: NotificationTriggerInput | null = triggerDate && triggerDate.getTime() > Date.now()
    ? {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(60, Math.floor((triggerDate.getTime() - Date.now()) / 1000)),
        repeats: false,
      }
    : null;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLES[type],
        body: NOTIFICATION_BODIES[type],
        data: { brewId, type },
      },
      trigger,
    });
  } catch (error) {
    // Silenciar fallos de notificaciones para no interrumpir el flujo principal
  }
};

export const scheduleStepNotification = async (
  sessionId: string,
  stepName: string,
  targetTimestamp: number
): Promise<string | null> => {
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return null;

  const now = Date.now();
  const triggerTime = targetTimestamp - now;

  // Only schedule if trigger is more than 10 seconds in the future
  if (triggerTime < 10000) return null;

  const trigger: NotificationTriggerInput = {
    type: SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: Math.max(10, Math.floor(triggerTime / 1000)),
    repeats: false,
  };

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLES['brew-step'],
        body: `${stepName} ${NOTIFICATION_BODIES['brew-step']}`,
        data: { sessionId, stepName, type: 'brew-step' },
      },
      trigger,
    });
    return notificationId;
  } catch (error) {
    // Silenciar fallos de notificaciones para no interrumpir el flujo principal
    return null;
  }
};

export const cancelStepNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    // Silenciar fallos de notificaciones
  }
};

export const cancelAllStepNotifications = async (sessionId?: string) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const stepNotifications = scheduled.filter(
      notification => {
        const data = notification.content.data;
        return data?.type === 'brew-step' && (!sessionId || data?.sessionId === sessionId);
      }
    );

    await Promise.all(
      stepNotifications.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
  } catch (error) {
    // Silenciar fallos de notificaciones
  }
};
