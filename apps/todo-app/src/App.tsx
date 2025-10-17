import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { Sidebar } from './components/Sidebar';
import { TaskDetail } from './components/TaskDetail';

function App() {
  const { tasks, addTask, selectedTask, selectTask, error } = useTasks();

  return (
    <div className="flex h-screen bg-white">
      {/* サイドバー */}
      <Sidebar
        tasks={tasks}
        selectedTaskId={selectedTask?.id || null}
        onSelectTask={selectTask}
      />

      {/* メインコンテンツエリア */}
      <div className="flex-1 flex flex-col">
        {/* タスク詳細表示エリア */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <TaskDetail task={selectedTask} />
        </main>

        {/* 入力フォームエリア（固定） */}
        <footer className="sticky bottom-0">
          <TaskInput onSubmit={addTask} error={error} />
        </footer>
      </div>
    </div>
  );
}

export default App;
