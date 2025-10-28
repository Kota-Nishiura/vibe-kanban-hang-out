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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          ポモドーロタイマー
        </h1>
        
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

        {/* 状態表示（デバッグ用） */}
        {import.meta.env.DEV && (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded">
            <div>実行中: {timer.isRunning ? 'はい' : 'いいえ'}</div>
            <div>一時停止: {timer.isPaused ? 'はい' : 'いいえ'}</div>
            <div>残り時間（秒）: {timer.timeLeft}</div>
            <div>進捗: {Math.round(progress * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
