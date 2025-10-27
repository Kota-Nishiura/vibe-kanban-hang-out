// 型定義のエクスポート用インデックスファイル

/**
 * セッションタイプの定義
 * work: 作業セッション（通常25分）
 * shortBreak: 短い休憩（通常5分）
 * longBreak: 長い休憩（通常15-30分）
 */
export type SessionType = 'work' | 'shortBreak' | 'longBreak';

/**
 * タイマーの現在状態を表すインターフェース
 */
export interface TimerState {
  /** 残り時間（秒） */
  timeLeft: number;
  /** タイマー実行中フラグ */
  isRunning: boolean;
  /** 一時停止フラグ */
  isPaused: boolean;
  /** 現在のセッションタイプ */
  sessionType: SessionType;
  /** 現在のセッション番号（1から開始） */
  currentSession: number;
}

/**
 * タイマー設定を表すインターフェース
 */
export interface TimerSettings {
  /** 作業時間（分）1-60分の範囲 */
  workDuration: number;
  /** 短い休憩時間（分）1-30分の範囲 */
  shortBreakDuration: number;
  /** 長い休憩時間（分）1-60分の範囲 */
  longBreakDuration: number;
  /** 長い休憩の間隔（何セッション後に長い休憩を取るか）2-10の範囲 */
  longBreakInterval: number;
  /** 休憩の自動開始フラグ */
  autoStartBreaks: boolean;
  /** 作業の自動開始フラグ */
  autoStartWork: boolean;
}

/**
 * 完了したセッションを表すインターフェース
 */
export interface Session {
  /** セッションの一意識別子 */
  id: string;
  /** セッションタイプ */
  type: SessionType;
  /** 開始時刻 */
  startTime: Date;
  /** 終了時刻 */
  endTime: Date;
  /** 実際の継続時間（秒） */
  duration: number;
  /** セッション完了フラグ */
  completed: boolean;
}

/**
 * バリデーションエラーの詳細情報
 */
export interface ValidationError {
  /** エラーが発生したフィールド名 */
  field: string;
  /** エラーメッセージ */
  message: string;
  /** 現在の値 */
  value: unknown;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  /** バリデーション成功フラグ */
  isValid: boolean;
  /** エラー詳細（バリデーション失敗時） */
  errors: ValidationError[];
}

/**
 * タイマー設定のバリデーション関数
 * 要件4.5に基づく設定値の範囲チェックを実行
 */
export const validateTimerSettings = (settings: Partial<TimerSettings>): ValidationResult => {
  const errors: ValidationError[] = [];

  // 作業時間のバリデーション（1-60分）
  if (settings.workDuration !== undefined) {
    if (!Number.isInteger(settings.workDuration) || settings.workDuration < 1 || settings.workDuration > 60) {
      errors.push({
        field: 'workDuration',
        message: '作業時間は1分から60分の整数で設定してください',
        value: settings.workDuration
      });
    }
  }

  // 短い休憩時間のバリデーション（1-30分）
  if (settings.shortBreakDuration !== undefined) {
    if (!Number.isInteger(settings.shortBreakDuration) || settings.shortBreakDuration < 1 || settings.shortBreakDuration > 30) {
      errors.push({
        field: 'shortBreakDuration',
        message: '短い休憩時間は1分から30分の整数で設定してください',
        value: settings.shortBreakDuration
      });
    }
  }

  // 長い休憩時間のバリデーション（1-60分）
  if (settings.longBreakDuration !== undefined) {
    if (!Number.isInteger(settings.longBreakDuration) || settings.longBreakDuration < 1 || settings.longBreakDuration > 60) {
      errors.push({
        field: 'longBreakDuration',
        message: '長い休憩時間は1分から60分の整数で設定してください',
        value: settings.longBreakDuration
      });
    }
  }

  // 長い休憩間隔のバリデーション（2-10セッション）
  if (settings.longBreakInterval !== undefined) {
    if (!Number.isInteger(settings.longBreakInterval) || settings.longBreakInterval < 2 || settings.longBreakInterval > 10) {
      errors.push({
        field: 'longBreakInterval',
        message: '長い休憩の間隔は2回から10回のセッション間隔で設定してください',
        value: settings.longBreakInterval
      });
    }
  }

  // ブール値のバリデーション
  if (settings.autoStartBreaks !== undefined && typeof settings.autoStartBreaks !== 'boolean') {
    errors.push({
      field: 'autoStartBreaks',
      message: '休憩自動開始設定はtrue/falseで設定してください',
      value: settings.autoStartBreaks
    });
  }

  if (settings.autoStartWork !== undefined && typeof settings.autoStartWork !== 'boolean') {
    errors.push({
      field: 'autoStartWork',
      message: '作業自動開始設定はtrue/falseで設定してください',
      value: settings.autoStartWork
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * セッションデータのバリデーション関数
 * 要件5.1に基づくセッション記録の整合性チェック
 */
export const validateSession = (session: Partial<Session>): ValidationResult => {
  const errors: ValidationError[] = [];

  // ID必須チェック
  if (!session.id || typeof session.id !== 'string' || session.id.trim() === '') {
    errors.push({
      field: 'id',
      message: 'セッションIDは必須です',
      value: session.id
    });
  }

  // セッションタイプのバリデーション
  if (!session.type || !['work', 'shortBreak', 'longBreak'].includes(session.type)) {
    errors.push({
      field: 'type',
      message: 'セッションタイプは work, shortBreak, longBreak のいずれかを指定してください',
      value: session.type
    });
  }

  // 開始時刻のバリデーション
  if (!session.startTime || !(session.startTime instanceof Date) || isNaN(session.startTime.getTime())) {
    errors.push({
      field: 'startTime',
      message: '開始時刻は有効な日付オブジェクトである必要があります',
      value: session.startTime
    });
  }

  // 終了時刻のバリデーション
  if (!session.endTime || !(session.endTime instanceof Date) || isNaN(session.endTime.getTime())) {
    errors.push({
      field: 'endTime',
      message: '終了時刻は有効な日付オブジェクトである必要があります',
      value: session.endTime
    });
  }

  // 開始時刻と終了時刻の論理チェック
  if (session.startTime instanceof Date && session.endTime instanceof Date && 
      !isNaN(session.startTime.getTime()) && !isNaN(session.endTime.getTime())) {
    if (session.endTime <= session.startTime) {
      errors.push({
        field: 'endTime',
        message: '終了時刻は開始時刻より後である必要があります',
        value: { startTime: session.startTime, endTime: session.endTime }
      });
    }
  }

  // 継続時間のバリデーション
  if (session.duration === undefined || !Number.isInteger(session.duration) || session.duration < 0) {
    errors.push({
      field: 'duration',
      message: '継続時間は0以上の整数（秒）で指定してください',
      value: session.duration
    });
  }

  // 完了フラグのバリデーション
  if (session.completed !== undefined && typeof session.completed !== 'boolean') {
    errors.push({
      field: 'completed',
      message: '完了フラグはtrue/falseで設定してください',
      value: session.completed
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * デフォルトのタイマー設定
 * 標準的なポモドーロテクニックの設定値
 */
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false
};

/**
 * デフォルトのタイマー状態
 * アプリ初期化時の状態
 */
export const DEFAULT_TIMER_STATE: TimerState = {
  timeLeft: 25 * 60, // 25分を秒に変換
  isRunning: false,
  isPaused: false,
  sessionType: 'work',
  currentSession: 1
};
