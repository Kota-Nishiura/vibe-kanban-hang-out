import { useEffect, useRef, useCallback } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';

/**
 * 高精度タイマーフック
 * 
 * setInterval + 時刻補正による高精度タイマーロジックを実装
 * ブラウザのタブが非アクティブになると setInterval の精度が落ちるため、
 * 実際の経過時間を計算して補正を行う
 * 
 * 要件1.1: ユーザーが開始ボタンをクリックしたとき、システムは25分のカウントダウンタイマーを開始する
 * 要件1.4: タイマーが動作中のとき、システムは残り時間をMM:SS形式で表示する
 * 要件1.5: タイマーが動作中のとき、システムは毎秒表示を更新する
 */
export const useTimer = () => {
  // ストアから状態とアクションを取得
  const {
    timer,
    settings,
    startTimer,
    pauseTimer,
    resetTimer,
    completeSession
  } = usePomodoroStore();

  // タイマー開始時刻を記録するref
  const startTimeRef = useRef<number | null>(null);
  // 一時停止時の累積経過時間を記録するref
  const accumulatedTimeRef = useRef<number>(0);
  // setInterval のIDを保持するref
  const intervalIdRef = useRef<number | null>(null);
  // 最後の更新時刻を記録するref（デバッグ用）
  const lastUpdateRef = useRef<number>(0);

  /**
   * タイマーを停止してリソースをクリーンアップ
   */
  const stopTimer = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  /**
   * 残り時間を更新する関数
   * 実際の経過時間を計算して高精度を維持
   */
  const updateTimeLeft = useCallback(() => {
    const now = Date.now();
    
    if (!startTimeRef.current) {
      return;
    }

    // 現在のセッション開始からの実際の経過時間を計算
    const actualElapsed = now - startTimeRef.current + accumulatedTimeRef.current;
    
    // セッションタイプに基づく初期時間を取得（秒）
    const getInitialTime = () => {
      switch (timer.sessionType) {
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

    const initialTime = getInitialTime();
    const newTimeLeft = Math.max(0, initialTime - Math.floor(actualElapsed / 1000));

    // デバッグ情報（開発時のみ）
    if (import.meta.env.DEV) {
      const timeSinceLastUpdate = now - lastUpdateRef.current;
      if (timeSinceLastUpdate > 1100) { // 1.1秒以上の遅延があった場合
        console.warn(`タイマー更新の遅延を検出: ${timeSinceLastUpdate}ms`);
      }
      lastUpdateRef.current = now;
    }

    // ストアの状態を更新
    usePomodoroStore.setState((state) => ({
      ...state,
      timer: {
        ...state.timer,
        timeLeft: newTimeLeft
      }
    }));

    // タイマー終了チェック
    if (newTimeLeft === 0) {
      stopTimer();
      
      // セッション完了処理
      completeSession();
      
      // 累積時間をリセット
      accumulatedTimeRef.current = 0;
      
      console.log(`${timer.sessionType}セッションが完了しました`);
    }
  }, [timer.sessionType, settings, stopTimer, completeSession]);

  /**
   * タイマー開始処理
   * 要件1.1: システムは25分のカウントダウンタイマーを開始する
   */
  const handleStartTimer = useCallback(() => {
    if (timer.isRunning) {
      return; // 既に実行中の場合は何もしない
    }

    // 一時停止からの再開の場合、累積時間はそのまま
    // 新規開始の場合、累積時間をリセット
    if (!timer.isPaused) {
      accumulatedTimeRef.current = 0;
    }

    startTimeRef.current = Date.now();
    lastUpdateRef.current = Date.now();

    // ストアの状態を更新
    startTimer();

    // 高精度タイマーを開始（100ms間隔で更新）
    // 表示は1秒間隔だが、内部的により細かく更新して精度を保つ
    intervalIdRef.current = setInterval(updateTimeLeft, 100);

    console.log(`タイマーを開始しました: ${timer.sessionType}セッション`);
  }, [timer.isRunning, timer.isPaused, timer.sessionType, startTimer, updateTimeLeft]);

  /**
   * タイマー一時停止処理
   * 要件2.1: システムはカウントダウンを一時停止する
   */
  const handlePauseTimer = useCallback(() => {
    if (!timer.isRunning) {
      return; // 実行中でない場合は何もしない
    }

    // 現在までの経過時間を累積時間に加算
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      accumulatedTimeRef.current += elapsed;
    }

    stopTimer();
    pauseTimer();

    console.log('タイマーを一時停止しました');
  }, [timer.isRunning, stopTimer, pauseTimer]);

  /**
   * タイマーリセット処理
   * 要件3.1: システムは現在のタイマーを停止する
   * 要件3.2: システムは初期状態に戻る
   */
  const handleResetTimer = useCallback(() => {
    stopTimer();
    accumulatedTimeRef.current = 0;
    resetTimer();

    console.log('タイマーをリセットしました');
  }, [stopTimer, resetTimer]);

  /**
   * コンポーネントのアンマウント時にタイマーをクリーンアップ
   */
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  /**
   * タイマー状態の変更を監視してログ出力（開発時のみ）
   */
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('タイマー状態変更:', {
        timeLeft: timer.timeLeft,
        isRunning: timer.isRunning,
        isPaused: timer.isPaused,
        sessionType: timer.sessionType,
        currentSession: timer.currentSession
      });
    }
  }, [timer]);

  /**
   * 時間を MM:SS 形式でフォーマットする関数
   * 要件1.4: システムは残り時間をMM:SS形式で表示する
   */
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * 現在のセッション進捗率を計算（0-1の範囲）
   * プログレスバー表示などで使用
   */
  const getProgress = useCallback((): number => {
    const getInitialTime = () => {
      switch (timer.sessionType) {
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

    const initialTime = getInitialTime();
    if (initialTime === 0) return 0;
    
    const elapsed = initialTime - timer.timeLeft;
    return Math.min(1, Math.max(0, elapsed / initialTime));
  }, [timer.timeLeft, timer.sessionType, settings]);

  /**
   * セッションタイプの日本語表示名を取得
   */
  const getSessionTypeName = useCallback((): string => {
    switch (timer.sessionType) {
      case 'work':
        return '作業';
      case 'shortBreak':
        return '短い休憩';
      case 'longBreak':
        return '長い休憩';
      default:
        return '作業';
    }
  }, [timer.sessionType]);

  return {
    // タイマー状態
    timer,
    settings,
    
    // アクション
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    resetTimer: handleResetTimer,
    
    // ユーティリティ関数
    formatTime,
    getProgress,
    getSessionTypeName,
    
    // 計算されたプロパティ
    formattedTime: formatTime(timer.timeLeft),
    progress: getProgress(),
    sessionTypeName: getSessionTypeName(),
    
    // 状態フラグ
    canStart: !timer.isRunning,
    canPause: timer.isRunning,
    canReset: timer.isRunning || timer.isPaused || timer.timeLeft !== (
      timer.sessionType === 'work' ? settings.workDuration * 60 :
      timer.sessionType === 'shortBreak' ? settings.shortBreakDuration * 60 :
      settings.longBreakDuration * 60
    )
  };
};