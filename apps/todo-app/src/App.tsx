import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { Sidebar } from './components/Sidebar';
import { TaskDetail } from './components/TaskDetail';

function App() {
  const { tasks, addTask, error } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 選択されているタスクを取得
  const selectedTask = tasks.find(task => task.id === selectedTaskId) || null;

  // 新しいタスクが作成されたら自動的に選択
  const handleAddTask = (formData: { title: string; content: string }): boolean => {
    const success = addTask(formData);
    if (success) {
      // 最新のタスクを選択（タスク追加後に先頭に来るため）
      setTimeout(() => {
        if (tasks.length > 0) {
          setSelectedTaskId(tasks[0]?.id || null);
        }
      }, 0);
    }
    return success;
  };

  return (
    <div className="flex h-screen bg-white">
      {/* サイドバー */}
      <Sidebar
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col">
        {/* タスク詳細表示エリア */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <TaskDetail task={selectedTask} />
        </main>

        {/* 入力フォームエリア（固定） */}
        <footer className="sticky bottom-0">
          <TaskInput onSubmit={handleAddTask} error={error} />
        </footer>
      </div>
    </div>
  );
}

export default App;
