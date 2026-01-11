
/**
 * ErrorTracker - Bibliothèque de diagnostic et de suivi d'erreurs avancée.
 */

interface Breadcrumb {
  category: 'navigation' | 'action' | 'api' | 'system' | 'quiz' | 'notification';
  message: string;
  data?: any;
  timestamp: string;
}

interface DeviceStats {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
  battery?: { level: number; charging: boolean };
  connection?: { effectiveType: string; saveData: boolean };
}

interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  screen: string;
  language: string;
  online: boolean;
  breadcrumbs: Breadcrumb[];
  stats: DeviceStats;
  context?: any;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private logs: ErrorLog[] = [];
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 100;
  private readonly MAX_LOGS = 10;
  private sessionId: string = Math.random().toString(36).substring(2, 15);

  private constructor() {
    this.init();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private async init() {
    // Capture les erreurs JavaScript globales
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError(error || new Error(String(message)), { 
        source, lineno, colno, type: 'global_unhandled_exception' 
      });
      return false;
    };

    // Capture les promesses non gérées
    window.onunhandledrejection = (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)), 
        { type: 'unhandled_promise_rejection' }
      );
    };

    // Suivi de l'état de la connexion
    window.addEventListener('online', () => this.addBreadcrumb('system', 'Connexion rétablie'));
    window.addEventListener('offline', () => this.addBreadcrumb('system', 'Connexion perdue'));

    this.addBreadcrumb('system', `Session initialisée: ${this.sessionId}`);
  }

  private async getDeviceStats(): Promise<DeviceStats> {
    const stats: DeviceStats = {};
    
    // Mémoire (Chrome/Edge uniquement)
    if ((performance as any).memory) {
      stats.memory = { ...(performance as any).memory };
    }

    // Batterie
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        stats.battery = { level: battery.level, charging: battery.charging };
      } catch (e) {}
    }

    // Connexion
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      stats.connection = { effectiveType: conn.effectiveType, saveData: conn.saveData };
    }

    return stats;
  }

  public addBreadcrumb(category: Breadcrumb['category'], message: string, data?: any) {
    const breadcrumb: Breadcrumb = {
      category,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    this.breadcrumbs.push(breadcrumb);
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
    console.debug(`[${category.toUpperCase()}] ${message}`, data || '');
  }

  public async captureError(error: Error, context?: any) {
    const stats = await this.getDeviceStats();
    const log: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      online: navigator.onLine,
      breadcrumbs: [...this.breadcrumbs],
      stats,
      context
    };

    this.logs = [log, ...this.logs].slice(0, this.MAX_LOGS);
    this.saveToLocalStorage();
    
    console.group('%c 🚨 Diagnostic BrevetMaster ', 'background: #4f46e5; color: white; padding: 2px 5px; border-radius: 3px;');
    console.error('Erreur:', log.message);
    console.log('Contexte:', context);
    console.groupEnd();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('brevet_master_diagnostics', JSON.stringify(this.logs));
    } catch (e) {}
  }

  public getRecentLogs(): ErrorLog[] {
    const saved = localStorage.getItem('brevet_master_diagnostics');
    return saved ? JSON.parse(saved) : this.logs;
  }

  public downloadReport() {
    const report = {
      sessionId: this.sessionId,
      generatedAt: new Date().toISOString(),
      recentLogs: this.getRecentLogs(),
      currentBreadcrumbs: this.breadcrumbs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `brevet_master_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
}

export const errorTracker = ErrorTracker.getInstance();
