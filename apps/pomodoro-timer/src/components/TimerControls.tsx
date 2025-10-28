import React from 'react';

/**
 * TimerControls コンポーネントのプロパティ
 * 要件1.1, 2.1, 2.2, 2.3, 3.1, 3.2に基づく制御インターフェース
 */
interface TimerControlsProps {
  /** タイマー開始関数 */
  onStart: () => void;
  /** タイマー一時停止関数 */
  onPause: () => void;
  /** タイマーリセット関数 */
  onReset: () => void;
  /** タイマー一時停止中フラグ */
  isPaused: boolean;
  /** 開始ボタンが有効かどうか */
  canStart: boolean;
  /** 一時停止ボタンが有効かどうか */
  canPause: boolean;
  /** リセットボタンが有効かどうか */
  canReset: boolean;
}

/**
 * TimerControls コンポーネント
 * 
 * タイマーの開始・一時停止・リセット制御を行う純粋コンポーネント
 * 
 * 要件1.1: ユーザーが開始ボタンをクリックしたとき、システムは25分のカウントダウンタイマーを開始する
 * 要件2.1: アクティブなタイマー中にユーザーが一時停止ボタンをクリックしたとき、システムはカウントダウンを一時停止する
 * 要件2.2: タイマーが一時停止されたとき、システムは再開ボタンを表示する
 * 要件2.3: ユーザーが再開ボタンをクリックしたとき、システムは一時停止した地点からカウントダウンを継続する
 * 要件3.1: ユーザーがリセットボタンをクリックしたとき、システムは現在のタイマーを停止する
 * 要件3.2: タイマーがリセットされたとき、システムは初期状態（作業セッションの場合25:00）に戻る
 */
export const TimerControls: React.FC<TimerControlsProps> = ({
  onStart,
  onPause,
  onReset,
  isPaused,
  canStart,
  canPause,
  canReset
}) => {
  /**
   * 開始ボタンのテキストを動的に決定
   * 要件2.2: タイマーが一時停止されたとき、システムは再開ボタンを表示する
   */
  const getStartButtonText = (): string => {
    if (isPaused) {
      return '再開';
    }
    return '開始';
  };

  /**
   * ボタンの基本スタイルクラス
   */
  const baseButtonClass = 'px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  /**
   * 有効なボタンのスタイルを取得
   */
  const getEnabledButtonClass = (color: 'green' | 'yellow' | 'red'): string => {
    const colorClasses = {
      green: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500',
      red: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
    };
    
    return `${baseButtonClass} ${colorClasses[color]}`;
  };

  /**
   * 無効なボタンのスタイルクラス
   */
  const disabledButtonClass = `${baseButtonClass} bg-gray-300 text-gray-500 cursor-not-allowed`;

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {/* 開始/再開ボタン */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={canStart ? getEnabledButtonClass('green') : disabledButtonClass}
        aria-label={isPaused ? 'タイマーを再開' : 'タイマーを開始'}
        type="button"
      >
        {getStartButtonText()}
      </button>
      
      {/* 一時停止ボタン */}
      <button
        onClick={onPause}
        disabled={!canPause}
        className={canPause ? getEnabledButtonClass('yellow') : disabledButtonClass}
        aria-label="タイマーを一時停止"
        type="button"
      >
        一時停止
      </button>
      
      {/* リセットボタン */}
      <button
        onClick={onReset}
        disabled={!canReset}
        className={canReset ? getEnabledButtonClass('red') : disabledButtonClass}
        aria-label="タイマーをリセット"
        type="button"
      >
        リセット
      </button>
    </div>
  );
};

export default TimerControls;