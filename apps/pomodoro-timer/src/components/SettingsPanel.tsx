import { useState, useEffect } from 'react';
import { usePomodoroStore } from '../stores/pomodoroStore';
import type { TimerSettings, ValidationError } from '../types';
import { validateTimerSettings } from '../types';

/**
 * 設定パネルのプロパティ
 */
interface SettingsPanelProps {
  /** パネルの表示状態 */
  isVisible: boolean;
  /** パネルを閉じる関数 */
  onClose: () => void;
}

/**
 * 設定パネルコンポーネント
 * 要件4.1, 4.2, 4.3, 4.4, 4.5に基づく設定機能の実装
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isVisible, onClose }) => {
  const { settings, updateSettings } = usePomodoroStore();
  
  // フォームの状態管理
  const [formSettings, setFormSettings] = useState<TimerSettings>(settings);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 設定が変更されたときにフォーム状態を更新
  useEffect(() => {
    setFormSettings(settings);
    setHasUnsavedChanges(false);
  }, [settings]);

  /**
   * フォーム値の変更ハンドラー
   */
  const handleInputChange = (field: keyof TimerSettings, value: number | boolean) => {
    const newSettings = { ...formSettings, [field]: value };
    setFormSettings(newSettings);
    setHasUnsavedChanges(true);

    // リアルタイムバリデーション
    const validationResult = validateTimerSettings({ [field]: value });
    setValidationErrors(prev => {
      // 該当フィールドの既存エラーを削除
      const filteredErrors = prev.filter(error => error.field !== field);
      // 新しいエラーがあれば追加
      return [...filteredErrors, ...validationResult.errors];
    });
  };

  /**
   * 設定保存ハンドラー
   * 要件4.4: ユーザーが新しいタイマー設定を保存したとき、システムは今後のセッションに適用する
   */
  const handleSave = () => {
    // 全体のバリデーション実行
    const validationResult = validateTimerSettings(formSettings);
    
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    // 設定を保存
    updateSettings(formSettings);
    setValidationErrors([]);
    setHasUnsavedChanges(false);
    
    // 成功メッセージ（オプション）
    console.log('設定が保存されました');
  };

  /**
   * 設定リセットハンドラー
   */
  const handleReset = () => {
    setFormSettings(settings);
    setValidationErrors([]);
    setHasUnsavedChanges(false);
  };

  /**
   * パネルを閉じるハンドラー
   */
  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm('未保存の変更があります。閉じてもよろしいですか？');
      if (!shouldClose) return;
    }
    
    handleReset();
    onClose();
  };

  /**
   * 特定フィールドのエラーメッセージを取得
   */
  const getFieldError = (field: string): string | null => {
    const error = validationErrors.find(err => err.field === field);
    return error ? error.message : null;
  };

  /**
   * 数値入力フィールドコンポーネント
   */
  const NumberInput: React.FC<{
    label: string;
    field: keyof TimerSettings;
    value: number;
    min: number;
    max: number;
    unit: string;
    description?: string;
  }> = ({ label, field, value, min, max, unit, description }) => {
    const error = getFieldError(field);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => handleInputChange(field, parseInt(e.target.value) || min)}
            className={`
              flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
            `}
          />
          <span className="text-sm text-gray-500 min-w-[2rem]">{unit}</span>
        </div>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  };

  /**
   * チェックボックス入力フィールドコンポーネント
   */
  const CheckboxInput: React.FC<{
    label: string;
    field: keyof TimerSettings;
    value: boolean;
    description?: string;
  }> = ({ label, field, value, description }) => {
    return (
      <div className="space-y-2">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleInputChange(field, e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </label>
        {description && (
          <p className="text-xs text-gray-500 ml-7">{description}</p>
        )}
      </div>
    );
  };

  // パネルが非表示の場合は何も表示しない
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            タイマー設定
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="設定パネルを閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 設定フォーム */}
        <div className="p-6 space-y-6">
          {/* 時間設定セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              時間設定
            </h3>
            
            {/* 作業時間設定 - 要件4.1 */}
            <NumberInput
              label="作業時間"
              field="workDuration"
              value={formSettings.workDuration}
              min={1}
              max={60}
              unit="分"
              description="集中して作業する時間を設定します（1-60分）"
            />

            {/* 短い休憩時間設定 - 要件4.2 */}
            <NumberInput
              label="短い休憩時間"
              field="shortBreakDuration"
              value={formSettings.shortBreakDuration}
              min={1}
              max={30}
              unit="分"
              description="作業セッション間の短い休憩時間（1-30分）"
            />

            {/* 長い休憩時間設定 - 要件4.3 */}
            <NumberInput
              label="長い休憩時間"
              field="longBreakDuration"
              value={formSettings.longBreakDuration}
              min={1}
              max={60}
              unit="分"
              description="数セッション後の長い休憩時間（1-60分）"
            />

            {/* 長い休憩の間隔設定 */}
            <NumberInput
              label="長い休憩の間隔"
              field="longBreakInterval"
              value={formSettings.longBreakInterval}
              min={2}
              max={10}
              unit="セッション"
              description="何回の作業セッション後に長い休憩を取るか"
            />
          </div>

          {/* 自動開始設定セクション */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">
              自動開始設定
            </h3>
            
            <CheckboxInput
              label="休憩の自動開始"
              field="autoStartBreaks"
              value={formSettings.autoStartBreaks}
              description="作業セッション完了後、自動的に休憩タイマーを開始します"
            />

            <CheckboxInput
              label="作業の自動開始"
              field="autoStartWork"
              value={formSettings.autoStartWork}
              description="休憩完了後、自動的に次の作業セッションを開始します"
            />
          </div>

          {/* 全体のバリデーションエラー表示 */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                設定エラー
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              リセット
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={validationErrors.length > 0 || !hasUnsavedChanges}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};