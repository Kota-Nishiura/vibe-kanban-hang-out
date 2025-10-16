import { TaskFormData } from '../types/task';
import { ValidationError, Result } from '../types/validation';

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 1000;

export function validateTaskInput(
  data: TaskFormData
): Result<TaskFormData, ValidationError> {
  const trimmedTitle = data.title.trim();

  // タイトル必須チェック
  if (!trimmedTitle) {
    return {
      success: false,
      error: {
        field: 'title',
        message: 'タイトルを入力してください',
      },
    };
  }

  // タイトル文字数チェック
  if (trimmedTitle.length > MAX_TITLE_LENGTH) {
    return {
      success: false,
      error: {
        field: 'title',
        message: `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください`,
      },
    };
  }

  // 内容文字数チェック
  if (data.content.length > MAX_CONTENT_LENGTH) {
    return {
      success: false,
      error: {
        field: 'content',
        message: `内容は${MAX_CONTENT_LENGTH}文字以内で入力してください`,
      },
    };
  }

  // 成功
  return {
    success: true,
    data: {
      title: trimmedTitle,
      content: data.content,
    },
  };
}
