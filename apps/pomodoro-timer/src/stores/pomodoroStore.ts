import { create } from 'zustand';
import type { 
  TimerState, 
  TimerSettings, 
  Session, 
  SessionType
} from '../types';
import {
  DEFAULT_TIMER_STATE,
  DEFAULT_TIMER_SETTINGS,
  validateTimerSettings
} from '../types';

/**
 * 通知設定のインターフェース
 */
interface NotificationSettings {
  /** 音声通知の有効/無効 */
  sound: boolean;
  /** ブラウザ通知の有効/無効 */
  browser: boolean;
  /** 音量設定（0.0-1.0） */
  volume: number;
}

/**
 * Zustandストアの状態インターフェース
 * 要件1.1, 2.1, 3.1, 5.5に基づく状態管理
 */
interface PomodoroStore {
  // === 状態 ===
  /** タイマーの現在状態 */
  timer: TimerState;
  /** タイマー設定 */
  settings: TimerSettings;
  /** セッション履歴 */
  sessions: Session[];
  /** 通知設定 */
  notifications: NotificationSettings;
  /** データ読み込み完了フラグ */
  isDataLoaded: boolean;

  // === 基本アクション ===
  /** タイマー開始（要件1.1） */
  startTimer: () => void;
  /** タイマー一時停止（要件2.1） */
  pauseTimer: () => void;
  /** タイマーリセット（要件3.1） */
  resetTimer: () => void;

  // === 設定管理 ===
  /** 設定更新 */
  updateSettings: (settings: Partial<TimerSettings>) => void;

  // === セッション管理 ===
  /** セッション完了記録（要件5.5） */
  completeSession: () => void;
  /** セッション履歴クリア */
  clearSessions: () => void;

  // === データ永続化 ===
  /** localStorage からデータ読み込み */
  loadData: () => void;
  /** localStorage にデータ保存 */
  saveData: () => void;

  // === 通知設定 ===
  /** 通知設定更新 */
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
}

/**
 * localStorage のキー定数
 */
const STORAGE_KEYS = {
  TIMER_STATE: 'pomodoro-timer-state',
  SETTINGS: 'pomodoro-settings',
  SESSIONS: 'pomodoro-sessions',
  NOTIFICATIONS: 'pomodoro-notifications'
} as const;

/**
 * デフォルトの通知設定
 */
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  sound: true,
  browser: true,
  volume: 0.7
};

/**
 * localStorage からデータを安全に読み込む
 */
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    
    const parsed = JSON.parse(stored);
    
    // Date オブジェクトの復元（セッション履歴用）
    if (key === STORAGE_KEYS.SESSIONS && Array.isArray(parsed)) {
      return parsed.map((session: Record<string, unknown>) => ({
        ...session,
        startTime: new Date(session.startTime as string),
        endTime: new Date(session.endTime as string)
      })) as T;
    }
    
    return parsed;
  } catch (error) {
    console.warn(`localStorage からの読み込みに失敗しました (${key}):`, error);
    return defaultValue;
  }
};

/**
 * localStorage にデータを安全に保存する
 */
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`localStorage への保存に失敗しました (${key}):`, error);
  }
};

/**
 * 現在のセッションタイプに基づいて次のセッションタイプを決定
 */
const getNextSessionType = (currentType: SessionType, currentSession: number, longBreakInterval: number): SessionType => {
  if (currentType === 'work') {
    // 作業セッション完了後は休憩
    return currentSession % longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
  }
  // 休憩完了後は作業
  return 'work';
};

/**
 * セッションタイプに基づいて初期時間を取得（秒）
 */
const getInitialTimeForSession = (sessionType: SessionType, settings: TimerSettings): number => {
  switch (sessionType) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
    default:
      return settings.workDuration * 60;
  }
};

/**
 * ポモドーロタイマーのメインストア
 * 要件1.1, 2.1, 3.1, 5.5に基づく実装
 */
export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  // === 初期状態 ===
  timer: { ...DEFAULT_TIMER_STATE },
  settings: { ...DEFAULT_TIMER_SETTINGS },
  sessions: [],
  notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
  isDataLoaded: false,

  // === 基本アクション ===
  
  /**
   * タイマー開始
   * 要件1.1: ユーザーが開始ボタンをクリックしたとき、システムは25分のカウントダウンタイマーを開始する
   */
  startTimer: () => {
    set((state) => {
      const newTimer = {
        ...state.timer,
        isRunning: true,
        isPaused: false
      };
      
      const newState = { ...state, timer: newTimer };
      
      // 状態変更を localStorage に保存
      saveToStorage(STORAGE_KEYS.TIMER_STATE, newTimer);
      
      return newState;
    });
  },

  /**
   * タイマー一時停止
   * 要件2.1: アクティブなタイマー中にユーザーが一時停止ボタンをクリックしたとき、システムはカウントダウンを一時停止する
   */
  pauseTimer: () => {
    set((state) => {
      const newTimer = {
        ...state.timer,
        isRunning: false,
        isPaused: true
      };
      
      const newState = { ...state, timer: newTimer };
      
      // 状態変更を localStorage に保存
      saveToStorage(STORAGE_KEYS.TIMER_STATE, newTimer);
      
      return newState;
    });
  },

  /**
   * タイマーリセット
   * 要件3.1: ユーザーがリセットボタンをクリックしたとき、システムは現在のタイマーを停止する
   * 要件3.2: タイマーがリセットされたとき、システムは初期状態（作業セッションの場合25:00）に戻る
   */
  resetTimer: () => {
    set((state) => {
      const { settings } = state;
      const newTimer = {
        ...state.timer,
        timeLeft: getInitialTimeForSession(state.timer.sessionType, settings),
        isRunning: false,
        isPaused: false
      };
      
      const newState = { ...state, timer: newTimer };
      
      // 状態変更を localStorage に保存
      saveToStorage(STORAGE_KEYS.TIMER_STATE, newTimer);
      
      return newState;
    });
  },

  // === 設定管理 ===
  
  /**
   * タイマー設定更新
   * 要件4.5: カスタム時間が設定されたとき、システムは時間が正の整数であることを検証する
   */
  updateSettings: (newSettings: Partial<TimerSettings>) => {
    // 設定値のバリデーション
    const validationResult = validateTimerSettings(newSettings);
    if (!validationResult.isValid) {
      console.error('設定値が無効です:', validationResult.errors);
      return;
    }

    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      
      // 現在のセッションタイプに合わせてタイマー時間を更新
      const newTimeLeft = state.timer.isRunning || state.timer.isPaused 
        ? state.timer.timeLeft // 実行中または一時停止中は時間を変更しない
        : getInitialTimeForSession(state.timer.sessionType, updatedSettings);
      
      const newTimer = {
        ...state.timer,
        timeLeft: newTimeLeft
      };
      
      const newState = {
        ...state,
        settings: updatedSettings,
        timer: newTimer
      };
      
      // 設定とタイマー状態を保存
      saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
      saveToStorage(STORAGE_KEYS.TIMER_STATE, newTimer);
      
      return newState;
    });
  },

  // === セッション管理 ===
  
  /**
   * セッション完了記録
   * 要件5.1: 作業セッションが完了したとき、システムはタイムスタンプ付きでセッションを記録する
   */
  completeSession: () => {
    set((state) => {
      const now = new Date();
      const { timer, settings } = state;
      
      // 完了したセッションを記録
      const completedSession: Session = {
        id: `${now.getTime()}-${timer.sessionType}`,
        type: timer.sessionType,
        startTime: new Date(now.getTime() - (getInitialTimeForSession(timer.sessionType, settings) * 1000)),
        endTime: now,
        duration: getInitialTimeForSession(timer.sessionType, settings),
        completed: true
      };
      
      const newSessions = [...state.sessions, completedSession];
      
      // 次のセッションタイプを決定
      const nextSessionType = getNextSessionType(
        timer.sessionType, 
        timer.currentSession, 
        settings.longBreakInterval
      );
      
      // セッション番号の更新（作業セッション完了時のみインクリメント）
      const nextSessionNumber = timer.sessionType === 'work' 
        ? timer.currentSession + 1 
        : timer.currentSession;
      
      const newTimer = {
        ...timer,
        sessionType: nextSessionType,
        currentSession: nextSessionNumber,
        timeLeft: getInitialTimeForSession(nextSessionType, settings),
        isRunning: false,
        isPaused: false
      };
      
      const newState = {
        ...state,
        sessions: newSessions,
        timer: newTimer
      };
      
      // データを保存
      saveToStorage(STORAGE_KEYS.SESSIONS, newSessions);
      saveToStorage(STORAGE_KEYS.TIMER_STATE, newTimer);
      
      return newState;
    });
  },

  /**
   * セッション履歴クリア
   */
  clearSessions: () => {
    set((state) => {
      const newState = { ...state, sessions: [] };
      saveToStorage(STORAGE_KEYS.SESSIONS, []);
      return newState;
    });
  },

  // === データ永続化 ===
  
  /**
   * localStorage からデータ読み込み
   * 要件5.5: セッションデータが存在するとき、システムはブラウザセッション間でデータを永続化する
   */
  loadData: () => {
    set((state) => {
      const loadedTimer = loadFromStorage(STORAGE_KEYS.TIMER_STATE, DEFAULT_TIMER_STATE);
      const loadedSettings = loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_TIMER_SETTINGS);
      const loadedSessions = loadFromStorage(STORAGE_KEYS.SESSIONS, []);
      const loadedNotifications = loadFromStorage(STORAGE_KEYS.NOTIFICATIONS, DEFAULT_NOTIFICATION_SETTINGS);
      
      return {
        ...state,
        timer: loadedTimer,
        settings: loadedSettings,
        sessions: loadedSessions,
        notifications: loadedNotifications,
        isDataLoaded: true
      };
    });
  },

  /**
   * localStorage にデータ保存
   * 現在の状態をすべて localStorage に保存
   */
  saveData: () => {
    const state = get();
    saveToStorage(STORAGE_KEYS.TIMER_STATE, state.timer);
    saveToStorage(STORAGE_KEYS.SETTINGS, state.settings);
    saveToStorage(STORAGE_KEYS.SESSIONS, state.sessions);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, state.notifications);
  },

  // === 通知設定 ===
  
  /**
   * 通知設定更新
   */
  updateNotifications: (newNotifications: Partial<NotificationSettings>) => {
    set((state) => {
      const updatedNotifications = { ...state.notifications, ...newNotifications };
      const newState = { ...state, notifications: updatedNotifications };
      
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updatedNotifications);
      
      return newState;
    });
  }
}));

/**
 * ストアの初期化
 * アプリ起動時に一度だけ呼び出してデータを読み込む
 */
export const initializePomodoroStore = () => {
  usePomodoroStore.getState().loadData();
};