/**
 * セッション完了とサイクル管理のテスト
 * 
 * このファイルは手動テスト用のスクリプトです。
 * 実際のテストフレームワークではなく、コンソールでの動作確認用です。
 */

import { usePomodoroStore } from './stores/pomodoroStore';
import type { SessionType } from './types';

/**
 * セッション完了のテストケース
 */
export const testSessionCompletion = () => {
  console.log('=== セッション完了とサイクル管理のテスト ===');
  
  const store = usePomodoroStore.getState();
  
  // 初期状態の確認
  console.log('初期状態:', {
    sessionType: store.timer.sessionType,
    currentSession: store.timer.currentSession,
    timeLeft: store.timer.timeLeft
  });
  
  // テストケース1: 作業セッション完了
  console.log('\n--- テストケース1: 作業セッション完了 ---');
  
  // 作業セッションを設定
  usePomodoroStore.setState((state) => ({
    ...state,
    timer: {
      ...state.timer,
      sessionType: 'work' as SessionType,
      currentSession: 1,
      timeLeft: 0 // タイマー終了状態をシミュレート
    }
  }));
  
  // セッション完了を実行
  store.completeSession();
  
  const afterWorkCompletion = usePomodoroStore.getState();
  console.log('作業セッション完了後:', {
    sessionType: afterWorkCompletion.timer.sessionType,
    currentSession: afterWorkCompletion.timer.currentSession,
    sessionsCount: afterWorkCompletion.sessions.length,
    showNotification: afterWorkCompletion.showSessionNotification,
    completedSessionType: afterWorkCompletion.completedSessionType
  });
  
  // 期待値の確認
  const expectedAfterWork = {
    sessionType: 'shortBreak', // 作業後は短い休憩
    currentSession: 2, // セッション番号がインクリメント
    sessionsCount: 1, // セッション履歴に1つ追加
    showNotification: true, // 通知が表示される
    completedSessionType: 'work' // 完了したのは作業セッション
  };
  
  console.log('期待値との比較:');
  console.log('- セッションタイプ:', afterWorkCompletion.timer.sessionType === expectedAfterWork.sessionType ? '✓' : '✗');
  console.log('- セッション番号:', afterWorkCompletion.timer.currentSession === expectedAfterWork.currentSession ? '✓' : '✗');
  console.log('- セッション履歴数:', afterWorkCompletion.sessions.length === expectedAfterWork.sessionsCount ? '✓' : '✗');
  console.log('- 通知表示:', afterWorkCompletion.showSessionNotification === expectedAfterWork.showNotification ? '✓' : '✗');
  
  // テストケース2: 短い休憩完了
  console.log('\n--- テストケース2: 短い休憩完了 ---');
  
  // 通知を非表示にして次のテストを準備
  store.hideCompletionNotification();
  
  // 短い休憩セッションを設定
  usePomodoroStore.setState((state) => ({
    ...state,
    timer: {
      ...state.timer,
      sessionType: 'shortBreak' as SessionType,
      timeLeft: 0
    }
  }));
  
  // セッション完了を実行
  store.completeSession();
  
  const afterBreakCompletion = usePomodoroStore.getState();
  console.log('短い休憩完了後:', {
    sessionType: afterBreakCompletion.timer.sessionType,
    currentSession: afterBreakCompletion.timer.currentSession,
    sessionsCount: afterBreakCompletion.sessions.length
  });
  
  // 期待値の確認
  const expectedAfterBreak = {
    sessionType: 'work', // 休憩後は作業
    currentSession: 2, // セッション番号は変わらない（休憩完了時はインクリメントしない）
    sessionsCount: 2 // セッション履歴に1つ追加
  };
  
  console.log('期待値との比較:');
  console.log('- セッションタイプ:', afterBreakCompletion.timer.sessionType === expectedAfterBreak.sessionType ? '✓' : '✗');
  console.log('- セッション番号:', afterBreakCompletion.timer.currentSession === expectedAfterBreak.currentSession ? '✓' : '✗');
  console.log('- セッション履歴数:', afterBreakCompletion.sessions.length === expectedAfterBreak.sessionsCount ? '✓' : '✗');
  
  // テストケース3: 長い休憩のサイクル確認
  console.log('\n--- テストケース3: 長い休憩サイクル ---');
  
  // 4回目の作業セッション完了をシミュレート（デフォルトでは4セッション後に長い休憩）
  usePomodoroStore.setState((state) => ({
    ...state,
    timer: {
      ...state.timer,
      sessionType: 'work' as SessionType,
      currentSession: 4,
      timeLeft: 0
    }
  }));
  
  store.completeSession();
  
  const afterLongBreakTrigger = usePomodoroStore.getState();
  console.log('4回目の作業セッション完了後:', {
    sessionType: afterLongBreakTrigger.timer.sessionType,
    currentSession: afterLongBreakTrigger.timer.currentSession
  });
  
  // 期待値の確認
  console.log('期待値との比較:');
  console.log('- セッションタイプ:', afterLongBreakTrigger.timer.sessionType === 'longBreak' ? '✓' : '✗');
  console.log('- セッション番号:', afterLongBreakTrigger.timer.currentSession === 5 ? '✓' : '✗');
  
  console.log('\n=== テスト完了 ===');
  
  return {
    workToBreak: afterWorkCompletion.timer.sessionType === 'shortBreak',
    breakToWork: afterBreakCompletion.timer.sessionType === 'work',
    longBreakCycle: afterLongBreakTrigger.timer.sessionType === 'longBreak',
    sessionIncrement: afterWorkCompletion.timer.currentSession === 2,
    sessionHistory: afterBreakCompletion.sessions.length === 2,
    notifications: afterWorkCompletion.showSessionNotification === true
  };
};

/**
 * 次のセッションタイプ決定ロジックのテスト
 */
export const testNextSessionLogic = () => {
  console.log('\n=== 次のセッションタイプ決定ロジックのテスト ===');
  
  // テスト用の設定
  const settings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false
  };
  
  // テストケース
  const testCases = [
    { current: 'work', session: 1, expected: 'shortBreak', description: '1回目の作業後' },
    { current: 'work', session: 2, expected: 'shortBreak', description: '2回目の作業後' },
    { current: 'work', session: 3, expected: 'shortBreak', description: '3回目の作業後' },
    { current: 'work', session: 4, expected: 'longBreak', description: '4回目の作業後（長い休憩）' },
    { current: 'shortBreak', session: 1, expected: 'work', description: '短い休憩後' },
    { current: 'longBreak', session: 4, expected: 'work', description: '長い休憩後' }
  ];
  
  testCases.forEach((testCase, index) => {
    // 実際のロジックをテスト（ストア内部の関数を直接呼び出すことはできないので、期待される動作を確認）
    const currentType = testCase.current as SessionType;
    const nextType = getNextSessionType(currentType, testCase.session, settings.longBreakInterval);
    
    const isCorrect = nextType === testCase.expected;
    console.log(`${index + 1}. ${testCase.description}: ${isCorrect ? '✓' : '✗'} (期待: ${testCase.expected}, 実際: ${nextType})`);
  });
};

/**
 * 次のセッションタイプを決定する関数（テスト用）
 * ストア内部の関数と同じロジック
 */
const getNextSessionType = (currentType: SessionType, currentSession: number, longBreakInterval: number): SessionType => {
  if (currentType === 'work') {
    // 作業セッション完了後は休憩
    return currentSession % longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
  }
  // 休憩完了後は作業
  return 'work';
};

// 開発環境でのみテストを実行
if (import.meta.env.DEV) {
  console.log('セッション完了とサイクル管理のテストが利用可能です。');
  console.log('ブラウザのコンソールで以下を実行してください:');
  console.log('- testSessionCompletion(): セッション完了の動作テスト');
  console.log('- testNextSessionLogic(): 次のセッション決定ロジックのテスト');
  
  // グローバルに関数を公開（開発環境のみ）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testSessionCompletion = testSessionCompletion;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testNextSessionLogic = testNextSessionLogic;
}