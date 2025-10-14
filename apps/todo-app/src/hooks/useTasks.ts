import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { loadTasks, saveTasks } from '../lib/storage';
import { generateId } from '../lib/utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // 初回ロード
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // タスク追加
  const addTask = (formData: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: formData.title.trim(),
      content: formData.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  return {
    tasks,
    addTask,
  };
}
