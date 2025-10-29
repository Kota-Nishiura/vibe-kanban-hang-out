import { useEffect, useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { initializePomodoroStore, usePomodoroStore } from './stores/pomodoroStore';
import { TimerDisplay, TimerControls, SessionNotification, SettingsPanel } from './components';
import { initializeNotifications } from './utils/notifications';
import './App.css';

// 開発環境でのテスト関数をインポート
if (import.meta.env.DEV) {
  import('./test-session-completion');
}

function App() {
  const {
    timer,
    progress,
    canStart,
    canPause,
    canReset,
    startTimer,
    pauseTimer,
    resetTimer,
    showSessionNotification,
    completedSessionType,
    hideCompletionNotification
  } = useTimer();

  // 通知設定を取得
  const { notifications } = usePomodoroStore();

  // 設定パネルの表示状態管理
  const [showSettings, setShowSettings] = useState(false);

  // アプリ初期化時にストアデータを読み込み
  useEffect(() => {
    initializePomodoroStore();
  }, []);

  // 通知システムの初期化（ユーザーインタラクション後）
  useEffect(() => {
    const initNotifications = async () => {
      try {
        await initializeNotifications(notifications);
      } catch (error) {
        console.error('通知システムの初期化に失敗しました:', error);
      }
    };

    // 最初のユーザーインタラクション時に通知システムを初期化
    const handleFirstInteraction = () => {
      initNotifications();
      // イベントリスナーを削除（一度だけ実行）
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [notifications]);

  /**
   * 次のセッションを開始する関数
   */
  const handleStartNextSession = () => {
    hideCompletionNotification();
    startTimer();
  };

  /**
   * 設定パネルを開く関数
   */
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  /**
   * 設定パネルを閉じる関数
   */
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div 
        className={`
          timer-card bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-auto
          ${timer.isRunning ? 'running' : ''}
        `}
      >
        {/* アプリヘッダー */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-8"></div> {/* 左側のスペーサー */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ポモドーロタイマー
              </h1>
              <p className="text-sm text-gray-600">
                集中力を高める時間管理テクニック
              </p>
            </div>
            {/* 設定ボタン */}
            <button
              onClick={handleOpenSettings}
              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="設定を開く"
              title="設定"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>
        
        {/* メインタイマーセクション */}
        <main className="space-y-6">
          {/* タイマー表示コンポーネント */}
          <TimerDisplay
            timeLeft={timer.timeLeft}
            isRunning={timer.isRunning}
            sessionType={timer.sessionType}
            currentSession={timer.currentSession}
            progress={progress}
          />

          {/* タイマーコントロール */}
          <TimerControls
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            isPaused={timer.isPaused}
            canStart={canStart}
            canPause={canPause}
            canReset={canReset}
          />
        </main>

        {/* 開発環境での状態表示（デバッグ用） */}
        {import.meta.env.DEV && (
          <footer className="mt-8">
            <details className="debug-info text-gray-500 bg-gray-50 p-4 rounded-lg">
              <summary className="cursor-pointer text-xs font-medium mb-2">
                デバッグ情報 (開発環境のみ)
              </summary>
              <div className="space-y-1 text-xs">
                <div>実行中: {timer.isRunning ? 'はい' : 'いいえ'}</div>
                <div>一時停止: {timer.isPaused ? 'はい' : 'いいえ'}</div>
                <div>残り時間（秒）: {timer.timeLeft}</div>
                <div>進捗: {Math.round(progress * 100)}%</div>
                <div>セッションタイプ: {timer.sessionType}</div>
                <div>現在のセッション: {timer.currentSession}</div>
                <div>通知表示: {showSessionNotification ? 'はい' : 'いいえ'}</div>
                <div>完了セッション: {completedSessionType || 'なし'}</div>
              </div>
            </details>
          </footer>
        )}
      </div>

      {/* セッション完了通知モーダル */}
      <SessionNotification
        sessionType={completedSessionType}
        nextSessionType={timer.sessionType}
        onClose={hideCompletionNotification}
        onStartNext={handleStartNextSession}
        isVisible={showSessionNotification}
      />

      {/* 設定パネル */}
      <SettingsPanel
        isVisible={showSettings}
        onClose={handleCloseSettings}
      />
    </div>
  );
}

export default App;
