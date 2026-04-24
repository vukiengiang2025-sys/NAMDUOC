import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Local Notifications only supported on native platforms.');
      return false;
    }
    try {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permissions', e);
      return false;
    }
  },

  async scheduleMorningNotification(title: string, body: string) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: 1,
            schedule: {
              on: {
                hour: 7,
                minute: 30
              },
              allowWhileIdle: true
            },
            sound: 'beep.wav',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.warn('Error scheduling notification', e);
    }
  },

  async cancelAll() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }
    } catch (e) {
      console.warn('Error canceling notifications', e);
    }
  }
};
