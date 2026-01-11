
import { Reminder } from '../types';
import { errorTracker } from './errorTracker';

class NotificationService {
  private static instance: NotificationService;
  private checkTimer: number | null = null;
  private activeReminders: Reminder[] = [];
  private notifiedThisMinute: Set<string> = new Set();
  private lastCheckedMinute: number = -1;

  private constructor() {
    this.registerServiceWorker();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        errorTracker.addBreadcrumb('system', 'Service Worker enregistré');
      } catch (e) {
        errorTracker.addBreadcrumb('system', 'Echec SW (attendu en local ou sans HTTPS)');
      }
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  public sendInstantNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        const notificationOptions: any = {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
          badge: '🎓',
          vibrate: [200, 100, 200],
          tag: 'brevet-master-reminder', // Evite les doublons visuels
          renotify: true
        };
        registration.showNotification(title, notificationOptions);
      }).catch(() => {
        new Notification(title, { body });
      });
    }
  }

  /**
   * Démarre ou met à jour le cycle de surveillance des rappels.
   * Utilise un timeout intelligent calé sur le début de la minute suivante.
   */
  public startMonitoring(reminders: Reminder[]) {
    this.activeReminders = reminders.filter(r => r.isActive);
    
    if (this.checkTimer) {
      window.clearTimeout(this.checkTimer);
    }

    const scheduleNextTick = () => {
      const now = new Date();
      const delay = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
      
      this.checkTimer = window.setTimeout(() => {
        this.performCheck();
        scheduleNextTick();
      }, Math.max(delay, 1000)); // Minimum 1s de délai par sécurité
    };

    scheduleNextTick();
    errorTracker.addBreadcrumb('notification', `Monitoring démarré pour ${this.activeReminders.length} rappels`);
  }

  /**
   * Exécute la vérification réelle.
   * Optimisée pour être ultra-rapide et économe en ressources.
   */
  private performCheck() {
    if (this.activeReminders.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;
    
    // Evite les doubles déclenchements dans la même minute si le timer est imprécis
    if (currentMinutesSinceMidnight === this.lastCheckedMinute) return;
    this.lastCheckedMinute = currentMinutesSinceMidnight;
    this.notifiedThisMinute.clear();

    const currentDay = now.getDay();
    const todayStr = now.toDateString();

    for (const r of this.activeReminders) {
      // Comparaison numérique rapide (HH:mm -> minutes)
      const [h, m] = r.time.split(':').map(Number);
      const reminderMinutes = h * 60 + m;

      if (reminderMinutes === currentMinutesSinceMidnight) {
        const isCorrectDay = r.frequency === 'daily' || (r.frequency === 'weekly' && r.dayOfWeek === currentDay);
        
        if (isCorrectDay) {
          const lastNotifiedKey = `ln_${r.id}`;
          // Lecture du localStorage uniquement si l'heure et le jour correspondent
          if (localStorage.getItem(lastNotifiedKey) !== todayStr) {
            this.sendInstantNotification(
              `🎓 Temps de réviser !`,
              `C'est l'heure de ton rappel pour : ${r.topic || r.subjectId}.`
            );
            localStorage.setItem(lastNotifiedKey, todayStr);
            this.notifiedThisMinute.add(r.id);
            errorTracker.addBreadcrumb('notification', `Rappel déclenché: ${r.id} (${r.time})`);
          }
        }
      }
    }
  }

  public async scheduleReminder(reminder: Reminder) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      alert("Active les notifications pour recevoir tes rappels !");
      return false;
    }
    
    this.sendInstantNotification(
      "Rappel activé ! 🎯",
      `C'est noté ! Je te préviendrai pour "${reminder.topic || reminder.subjectId}" à ${reminder.time}.`
    );
    return true;
  }
}

export const notificationService = NotificationService.getInstance();
