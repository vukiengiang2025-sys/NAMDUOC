import { LocalNotifications } from '@capacitor/local-notifications';

export const notificationService = {
  async requestPermissions() {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  },

  async scheduleMorningNotification(title: string, body: string) {
    // Schedule for 7:30 AM every day
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
  },

  async cancelAll() {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }
  }
};
