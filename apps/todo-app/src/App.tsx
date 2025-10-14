import { useTasks } from './hooks/useTasks';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';

function App() {
  const { tasks, addTask } = useTasks();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">TODO App</h1>
        </div>
      </header>

      {/* タスク一覧エリア */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <TaskList tasks={tasks} />
        </div>
      </main>

      {/* 入力フォームエリア（固定） */}
      <footer className="sticky bottom-0">
        <TaskInput onSubmit={addTask} />
      </footer>
    </div>
  );
}

export default App;
