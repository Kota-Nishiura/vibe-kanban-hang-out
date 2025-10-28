/**
 * 通知システムユーティリティ
 * 
 * セッション完了時の音声通知と視覚的通知を管理
 * 要件6.1, 6.2, 6.3, 6.4, 6.5に基づく通知機能
 */

/**
 * 通知音の種類
 */
export type NotificationSoundType = 'session-complete' | 'break-complete';

/**
 * 通知設定インターフェース
 */
export interface NotificationSettings {
  /** 音声通知の有効/無効 */
  sound: boolean;
  /** ブラウザ通知の有効/無効 */
  browser: boolean;
  /** 音量設定（0.0-1.0） */
  volume: number;
}

/**
 * 音声通知クラス
 * Web Audio APIを使用した効果音の再生
 */
class AudioNotification {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  /**
   * AudioContextの初期化
   * ユーザーインタラクション後に呼び出す必要がある
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('音声通知システムを初期化しました');
    } catch (error) {
      console.warn('AudioContextの初期化に失敗しました:', error);
    }
  }

  /**
   * 通知音を生成して再生
   * 要件6.1, 6.2: タイマー終了時に音声通知を再生する
   */
  async playNotificationSound(type: NotificationSoundType, volume: number = 0.7): Promise<void> {
    if (!this.audioContext || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.audioContext) {
      console.warn('AudioContextが利用できません');
      return;
    }

    try {
      // AudioContextが停止状態の場合は再開
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // 通知音の生成
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // 音の種類に応じて周波数を設定
      const frequencies = this.getFrequenciesForType(type);
      
      // 音量設定
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      // 接続
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 複数の音を順次再生
      let currentTime = this.audioContext.currentTime;
      frequencies.forEach((freq, index) => {
        const osc = index === 0 ? oscillator : this.audioContext!.createOscillator();
        if (index > 0) {
          const gain = this.audioContext!.createGain();
          gain.gain.setValueAtTime(0, currentTime);
          gain.gain.linearRampToValueAtTime(volume * 0.3, currentTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
          osc.connect(gain);
          gain.connect(this.audioContext!.destination);
        }
        
        osc.frequency.setValueAtTime(freq, currentTime);
        osc.type = 'sine';
        osc.start(currentTime);
        osc.stop(currentTime + 0.2);
        
        currentTime += 0.25;
      });

      console.log(`通知音を再生しました: ${type}`);
    } catch (error) {
      console.error('音声通知の再生に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 通知タイプに応じた周波数パターンを取得
   */
  private getFrequenciesForType(type: NotificationSoundType): number[] {
    switch (type) {
      case 'session-complete':
        // 作業セッション完了: 上昇音階
        return [523.25, 659.25, 783.99]; // C5, E5, G5
      case 'break-complete':
        // 休憩完了: 下降音階
        return [783.99, 659.25, 523.25]; // G5, E5, C5
      default:
        return [523.25, 659.25]; // C5, E5
    }
  }
}

/**
 * ブラウザ通知クラス
 * Notifications APIを使用したシステム通知
 */
class BrowserNotification {
  public permission: NotificationPermission = 'default';

  constructor() {
    this.permission = Notification.permission;
  }

  /**
   * 通知権限をリクエスト
   * 要件6.5: ブラウザ通知がサポートされている場合、タブがアクティブでないときにブラウザ通知を表示する
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log(`通知権限: ${this.permission}`);
      return this.permission;
    } catch (error) {
      console.error('通知権限のリクエストに失敗しました:', error);
      return 'denied';
    }
  }

  /**
   * ブラウザ通知を表示
   */
  async showNotification(title: string, message: string, icon?: string): Promise<void> {
    // 権限チェック
    if (this.permission !== 'granted') {
      console.warn('通知権限が許可されていません');
      return;
    }

    // タブがアクティブな場合は通知しない
    if (!document.hidden) {
      console.log('タブがアクティブなため、ブラウザ通知をスキップします');
      return;
    }

    try {
      const notification = new Notification(title, {
        body: message,
        icon: icon || '/vite.svg',
        badge: '/vite.svg',
        tag: 'pomodoro-timer',
        requireInteraction: false,
        silent: false
      });

      // 通知クリック時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);

      console.log('ブラウザ通知を表示しました:', title);
    } catch (error) {
      console.error('ブラウザ通知の表示に失敗しました:', error);
    }
  }
}

/**
 * 通知マネージャークラス
 * 音声通知とブラウザ通知を統合管理
 */
export class NotificationManager {
  private audioNotification: AudioNotification;
  private browserNotification: BrowserNotification;
  private settings: NotificationSettings;

  constructor(settings: NotificationSettings) {
    this.audioNotification = new AudioNotification();
    this.browserNotification = new BrowserNotification();
    this.settings = settings;
  }

  /**
   * 設定を更新
   */
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * 通知システムを初期化
   * ユーザーインタラクション後に呼び出す
   */
  async initialize(): Promise<void> {
    try {
      await this.audioNotification.initialize();
      
      if (this.settings.browser) {
        await this.browserNotification.requestPermission();
      }
    } catch (error) {
      console.error('通知システムの初期化に失敗しました:', error);
    }
  }

  /**
   * セッション完了通知
   * 要件6.1, 6.2, 6.3, 6.4に基づく通知実行
   */
  async notifySessionComplete(sessionType: 'work' | 'shortBreak' | 'longBreak'): Promise<void> {
    const messages = {
      work: {
        title: '作業セッション完了！',
        message: '素晴らしい集中でした。休憩を取りましょう。',
        soundType: 'session-complete' as NotificationSoundType
      },
      shortBreak: {
        title: '短い休憩完了！',
        message: '次の作業セッションを始めましょう。',
        soundType: 'break-complete' as NotificationSoundType
      },
      longBreak: {
        title: '長い休憩完了！',
        message: 'リフレッシュできましたね。次のサイクルを始めましょう。',
        soundType: 'break-complete' as NotificationSoundType
      }
    };

    const notification = messages[sessionType];

    try {
      // 音声通知
      if (this.settings.sound) {
        await this.audioNotification.playNotificationSound(
          notification.soundType,
          this.settings.volume
        );
      }

      // ブラウザ通知
      if (this.settings.browser) {
        await this.browserNotification.showNotification(
          notification.title,
          notification.message
        );
      }

      console.log(`セッション完了通知を送信しました: ${sessionType}`);
    } catch (error) {
      console.error('通知の送信に失敗しました:', error);
      // エラーが発生してもアプリの動作は継続
    }
  }

  /**
   * 通知権限の状態を取得
   */
  getPermissionStatus(): NotificationPermission {
    return this.browserNotification.permission;
  }

  /**
   * 通知権限を再リクエスト
   */
  async requestPermission(): Promise<NotificationPermission> {
    return await this.browserNotification.requestPermission();
  }
}

/**
 * グローバル通知マネージャーインスタンス
 */
let globalNotificationManager: NotificationManager | null = null;

/**
 * 通知マネージャーのシングルトンインスタンスを取得
 */
export const getNotificationManager = (settings?: NotificationSettings): NotificationManager => {
  if (!globalNotificationManager) {
    const defaultSettings: NotificationSettings = {
      sound: true,
      browser: true,
      volume: 0.7
    };
    globalNotificationManager = new NotificationManager(settings || defaultSettings);
  } else if (settings) {
    globalNotificationManager.updateSettings(settings);
  }
  
  return globalNotificationManager;
};

/**
 * 通知マネージャーを初期化
 * アプリ起動時またはユーザーインタラクション後に呼び出す
 */
export const initializeNotifications = async (settings?: NotificationSettings): Promise<void> => {
  const manager = getNotificationManager(settings);
  await manager.initialize();
};