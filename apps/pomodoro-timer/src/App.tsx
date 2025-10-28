import { useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { initializePomodoroStore } from './stores/pomodoroStore';
import { TimerDisplay, TimerControls } from './components';
import './App.css';

function App() {
  const {
    timer,
    progress,
    canStart,
    canPause,
    canReset,
    startTimer,
    pauseTimer,
    resetTimer
  } = useTimer();

  // アプリ初期化時にストアデータを読み込み
  useEffect(() => {
    initializePomodoroStore();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ポモドーロタイマー
          </h1>
          <p className="text-sm text-gray-600">
            集中力を高める時間管理テクニック
          </p>
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
              </div>
            </details>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
