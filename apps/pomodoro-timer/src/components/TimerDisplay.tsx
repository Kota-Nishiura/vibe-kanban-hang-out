import React from 'react';
import type { SessionType } from '../types';

/**
 * TimerDisplay コンポーネントのプロパティ
 */
interface TimerDisplayProps {
  /** 残り時間（秒） */
  timeLeft: number;
  /** タイマー実行中フラグ */
  isRunning: boolean;
  /** セッションタイプ */
  sessionType: SessionType;
  /** 現在のセッション番号 */
  currentSession: number;
  /** 進捗率（0-1の範囲） */
  progress: number;
}

/**
 * 時間を MM:SS 形式でフォーマットする関数
 * 要件1.4: システムは残り時間をMM:SS形式で表示する
 */
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * セッションタイプの日本語表示名を取得
 */
const getSessionTypeName = (sessionType: SessionType): string => {
  switch (sessionType) {
    case 'work':
      return '作業';
    case 'shortBreak':
      return '短い休憩';
    case 'longBreak':
      return '長い休憩';
    default:
      return '作業';
  }
};

/**
 * セッションタイプに応じた色を取得
 */
const getSessionTypeColor = (sessionType: SessionType): string => {
  switch (sessionType) {
    case 'work':
      return 'text-blue-600';
    case 'shortBreak':
      return 'text-green-600';
    case 'longBreak':
      return 'text-purple-600';
    default:
      return 'text-blue-600';
  }
};

/**
 * セッションタイプに応じたプログレスバーの色を取得
 */
const getProgressBarColor = (sessionType: SessionType): string => {
  switch (sessionType) {
    case 'work':
      return 'bg-blue-600';
    case 'shortBreak':
      return 'bg-green-600';
    case 'longBreak':
      return 'bg-purple-600';
    default:
      return 'bg-blue-600';
  }
};

/**
 * 円形プログレスバーのSVGコンポーネント
 */
const CircularProgress: React.FC<{ progress: number; sessionType: SessionType; size: number }> = ({
  progress,
  sessionType,
  size
}) => {
  const radius = (size - 8) / 2; // ストロークの幅を考慮
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  // セッションタイプに応じた色を取得
  const getStrokeColor = (type: SessionType): string => {
    switch (type) {
      case 'work':
        return '#2563eb'; // blue-600
      case 'shortBreak':
        return '#16a34a'; // green-600
      case 'longBreak':
        return '#9333ea'; // purple-600
      default:
        return '#2563eb';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      aria-hidden="true"
    >
      {/* 背景の円 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb" // gray-200
        strokeWidth="4"
        fill="transparent"
      />
      {/* プログレスの円 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={getStrokeColor(sessionType)}
        strokeWidth="4"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-300 ease-in-out"
      />
    </svg>
  );
};

/**
 * TimerDisplay コンポーネント
 * 
 * タイマーの現在状態と残り時間を表示する純粋コンポーネント
 * 要件1.4: タイマーが動作中のとき、システムは残り時間をMM:SS形式で表示する
 */
export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeLeft,
  isRunning,
  sessionType,
  currentSession,
  progress
}) => {
  const formattedTime = formatTime(timeLeft);
  const sessionTypeName = getSessionTypeName(sessionType);
  const sessionTypeColor = getSessionTypeColor(sessionType);
  const progressBarColor = getProgressBarColor(sessionType);

  return (
    <div className="text-center">
      {/* セッション情報 */}
      <div className="mb-6">
        <div className={`text-lg font-semibold mb-2 ${sessionTypeColor}`}>
          {sessionTypeName}
        </div>
        <div className="text-sm text-gray-600">
          セッション {currentSession}
        </div>
      </div>

      {/* 円形プログレスバーとタイマー表示 */}
      <div className="relative mb-6 flex justify-center">
        <div className="relative">
          {/* 円形プログレスバー */}
          <CircularProgress 
            progress={progress} 
            sessionType={sessionType} 
            size={240}
          />
          
          {/* 中央のタイマー表示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
              {formattedTime}
            </div>
            
            {/* 実行状態インジケーター */}
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
                aria-hidden="true"
              />
              <span className="text-xs text-gray-600">
                {isRunning ? '実行中' : '停止中'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* シンプルなプログレスバー（フォールバック） */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
          style={{ width: `${progress * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${sessionTypeName}の進捗: ${Math.round(progress * 100)}%`}
        />
      </div>

      {/* アクセシビリティ用の隠しテキスト */}
      <div className="sr-only">
        現在{sessionTypeName}セッション{currentSession}を実行中。
        残り時間は{formattedTime}です。
        進捗は{Math.round(progress * 100)}パーセントです。
        タイマーは{isRunning ? '実行中' : '停止中'}です。
      </div>
    </div>
  );
};

export default TimerDisplay;