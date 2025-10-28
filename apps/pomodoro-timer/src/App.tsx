import { useEffect } from 'react';
import { useTimer } from './hooks/useTimer';
import { initializePomodoroStore } from './stores/pomodoroStore';
import './App.css';

function App() {
  const {
    timer,
    formattedTime,
    sessionTypeName,
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
        
        {/* セッション情報 */}
        <div className="text-center mb-6">
          <div className="text-lg text-gray-600 mb-2">
            {sessionTypeName} - セッション {timer.currentSession}
          </div>
          
          {/* タイマー表示 */}
          <div className="text-6xl font-mono font-bold text-gray-800 mb-4">
            {formattedTime}
          </div>
          
          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={startTimer}
            disabled={!canStart}
            className={`px-6 py-2 rounded-lg font-semibold ${
              canStart
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {timer.isPaused ? '再開' : '開始'}
          </button>
          
          <button
            onClick={pauseTimer}
            disabled={!canPause}
            className={`px-6 py-2 rounded-lg font-semibold ${
              canPause
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            一時停止
          </button>
          
          <button
            onClick={resetTimer}
            disabled={!canReset}
            className={`px-6 py-2 rounded-lg font-semibold ${
              canReset
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            リセット
          </button>
        </div>

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
