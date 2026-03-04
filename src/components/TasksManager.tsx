'use client';

import { useEffect, useState } from 'react';
import { useToast } from './Toast';

type Task = {
  id: number;
  title: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
};

type FilterType = 'all' | 'pending' | 'completed';
type SortType = 'created' | 'dueDate' | 'title';

export default function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('created');
  const { showToast } = useToast();

  async function fetchTasks() {
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = (await response.json()) as { items: Task[] };
      setTasks(data.items);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error loading tasks', 'error');
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

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          status: 'pending',
          dueDate: newTaskDueDate || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      const task = (await response.json()) as Task;
      setTasks([...tasks, task]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      showToast('Task created successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error creating task', 'error');
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
      showToast(`Task marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating task', 'error');
    }
  }

  async function updateTaskTitle(taskId: number) {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) throw new Error('Failed to update task');

      const updated = (await response.json()) as Task;
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
      setEditingId(null);
      showToast('Task updated', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error updating task', 'error');
    }
  }

  async function deleteTask(taskId: number) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter((t) => t.id !== taskId));
      setDeleteConfirm(null);
      showToast('Task deleted', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error deleting task', 'error');
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'created') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sort === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-foreground" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Manage your tasks with filtering, sorting, and due dates.
        </p>

        {/* Create Task Form */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex gap-2">
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
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
            />
            <button
              onClick={() => void createTask()}
              disabled={creating || !newTaskTitle.trim()}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {creating ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['all', 'pending', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-foreground text-background'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="rounded-lg border border-zinc-200 bg-transparent px-3 py-1 text-xs font-medium outline-none dark:border-zinc-700"
          >
            <option value="created">Sort: Created</option>
            <option value="dueDate">Sort: Due Date</option>
            <option value="title">Sort: Title</option>
          </select>

          <span className="ml-auto text-xs text-zinc-500">
            {sortedTasks.length} {sortedTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {/* Task List */}
        <div className="mt-6 flex flex-col gap-2">
          {sortedTasks.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {filter === 'all' ? 'No tasks yet.' : `No ${filter} tasks.`}
            </p>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/30"
              >
                <button
                  onClick={() => void toggleStatus(task)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border border-zinc-300 dark:border-zinc-600"
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

                <div className="flex flex-1 flex-col gap-1">
                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void updateTaskTitle(task.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => void updateTaskTitle(task.id)}
                      autoFocus
                      className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                      }}
                      className={`cursor-pointer text-sm ${
                        task.status === 'completed'
                          ? 'text-zinc-500 line-through'
                          : ''
                      }`}
                    >
                      {task.title}
                    </span>
                  )}
                  {task.dueDate ? (
                    <span className="text-xs text-zinc-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>

                {deleteConfirm === task.id ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => void deleteTask(task.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs font-medium text-zinc-500 hover:text-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(task.id)}
                    className="text-sm text-zinc-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
