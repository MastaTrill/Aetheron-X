'use client';

import { useEffect, useState } from 'react';

type Task = {
  id: number;
  title: string;
  status: string;
};

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = (await response.json()) as { items: Task[] };
      setTasks(data.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchTasks();
  }, []);

  async function createTask() {
    if (!newTaskTitle.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, status: 'pending' }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const task = (await response.json()) as Task;
      setTasks([...tasks, task]);
      setNewTaskTitle('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(task: Task) {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updated = (await response.json()) as Task;
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function deleteTask(taskId: number) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter((t) => t.id !== taskId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Loading tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Manage your tasks with full CRUD operations backed by SQLite.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void createTask();
            }}
            placeholder="New task title..."
            className="flex-1 rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
          <button
            onClick={() => void createTask()}
            disabled={creating || !newTaskTitle.trim()}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {creating ? 'Adding...' : 'Add'}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {tasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/30"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => void toggleStatus(task)}
                    className="flex h-5 w-5 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600"
                  >
                    {task.status === 'completed' ? (
                      <svg
                        className="h-3 w-3 text-foreground"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                    ) : null}
                  </button>
                  <span
                    className={
                      task.status === 'completed'
                        ? 'text-sm text-zinc-500 line-through'
                        : 'text-sm'
                    }
                  >
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => void deleteTask(task.id)}
                  className="text-sm text-zinc-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
