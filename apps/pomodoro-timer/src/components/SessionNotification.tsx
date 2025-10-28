import React, { useEffect, useState } from 'react';
import type { SessionType } from '../types';

/**
 * セッション完了通知のプロパティ
 */
interface SessionNotificationProps {
  /** 完了したセッションタイプ */
  sessionType: SessionType | null;
  /** 次のセッションタイプ */
  nextSessionType: SessionType;
  /** 通知を閉じる関数 */
  onClose: () => void;
  /** 次のセッションを開始する関数 */
  onStartNext: () => void;
  /** 表示フラグ */
  isVisible: boolean;
}

/**
 * セッションタイプの表示情報を取得
 */
const getSessionInfo = (sessionType: SessionType) => {
  switch (sessionType) {
    case 'work':
      return {
        name: '作業',
        color: 'blue',
        icon: '💼',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-500 hover:bg-blue-600'
      };
    case 'shortBreak':
      return {
        name: '短い休憩',
        color: 'green',
        icon: '☕',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        buttonColor: 'bg-green-500 hover:bg-green-600'
      };
    case 'longBreak':
      return {
        name: '長い休憩',
        color: 'purple',
        icon: '🌟',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        buttonColor: 'bg-purple-500 hover:bg-purple-600'
      };
    default:
      return {
        name: '作業',
        color: 'blue',
        icon: '💼',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        buttonColor: 'bg-blue-500 hover:bg-blue-600'
      };
  }
};

/**
 * 完了メッセージを取得
 */
const getCompletionMessage = (sessionType: SessionType): { title: string; message: string } => {
  switch (sessionType) {
    case 'work':
      return {
        title: '作業セッション完了！',
        message: '素晴らしい集中でした。休憩を取って、リフレッシュしましょう。'
      };
    case 'shortBreak':
      return {
        title: '短い休憩完了！',
        message: 'リフレッシュできましたね。次の作業セッションを始めましょう。'
      };
    case 'longBreak':
      return {
        title: '長い休憩完了！',
        message: 'しっかり休めましたね。新しいサイクルを始めましょう。'
      };
    default:
      return {
        title: 'セッション完了！',
        message: '次のセッションの準備ができました。'
      };
  }
};

/**
 * SessionNotification コンポーネント
 * 
 * セッション完了時に表示される通知モーダル
 * 要件6.3, 6.4: 視覚的な通知メッセージを表示し、ユーザーが相互作用したときに通知を消去する
 */
export const SessionNotification: React.FC<SessionNotificationProps> = ({
  sessionType,
  nextSessionType,
  onClose,
  onStartNext,
  isVisible
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // 表示状態の変更時にアニメーションを制御
  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, onClose]);

  // セッションタイプがnullの場合は何も表示しない
  if (!sessionType || !isAnimating) {
    return null;
  }

  const completedInfo = getSessionInfo(sessionType);
  const nextInfo = getSessionInfo(nextSessionType);
  const { title, message } = getCompletionMessage(sessionType);

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`
          fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 通知モーダル */}
      <div 
        className={`
          fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        aria-describedby="notification-message"
      >
        <div 
          className={`
            ${completedInfo.bgColor} ${completedInfo.borderColor} 
            border-2 rounded-xl shadow-xl max-w-md w-full mx-auto p-6
            transform transition-all duration-300
          `}
        >
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3" aria-hidden="true">
              {completedInfo.icon}
            </div>
            <h2 
              id="notification-title"
              className={`text-2xl font-bold ${completedInfo.textColor} mb-2`}
            >
              {title}
            </h2>
            <p 
              id="notification-message"
              className={`${completedInfo.textColor} opacity-80`}
            >
              {message}
            </p>
          </div>

          {/* 次のセッション情報 */}
          <div className={`${nextInfo.bgColor} ${nextInfo.borderColor} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl" aria-hidden="true">
                {nextInfo.icon}
              </span>
              <div>
                <div className="text-sm text-gray-600">次のセッション</div>
                <div className={`font-semibold ${nextInfo.textColor}`}>
                  {nextInfo.name}
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-3">
            <button
              onClick={onStartNext}
              className={`
                flex-1 ${nextInfo.buttonColor} text-white font-semibold py-3 px-4 rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
              `}
              aria-label={`${nextInfo.name}セッションを開始`}
            >
              開始
            </button>
            <button
              onClick={onClose}
              className="
                flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
              "
              aria-label="通知を閉じる"
            >
              後で
            </button>
          </div>

          {/* 閉じるボタン（右上） */}
          <button
            onClick={onClose}
            className={`
              absolute top-4 right-4 ${completedInfo.textColor} hover:opacity-70
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 rounded-full p-1
            `}
            aria-label="通知を閉じる"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SessionNotification;