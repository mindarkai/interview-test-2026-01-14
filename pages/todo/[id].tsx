import { ConvoView } from '@/components/ConvoView';
import { Todo } from '@/lib/types';
import { ArrowLeft, Calendar, Check, Edit2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

export default function TodoDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchTodo = useCallback(async () => {
    if (!id) return;

    try {
      const res = await fetch('/api/todos');
      const todos: Todo[] = await res.json();
      const found = todos.find((t) => t.id === id);
      if (found) {
        setTodo(found);
        setEditTitle(found.title);
        setEditDescription(found.description);
      }
    } catch (error) {
      console.error('Failed to fetch todo:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTodo();
  }, [fetchTodo]);

  const toggleComplete = useCallback(async () => {
    if (!todo) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todo.id, completed: !todo.completed }),
      });
      const updatedTodo = await res.json();
      setTodo(updatedTodo);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }, [todo]);

  const saveEdit = useCallback(async () => {
    if (!todo) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: todo.id,
          title: editTitle,
          description: editDescription,
        }),
      });
      const updatedTodo = await res.json();
      setTodo(updatedTodo);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  }, [todo, editTitle, editDescription]);

  const deleteTodo = useCallback(async () => {
    if (!todo) return;

    try {
      await fetch(`/api/todos?id=${todo.id}`, { method: 'DELETE' });
      router.push('/');
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  }, [todo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-400">Todo not found</div>
        <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to list
          </Link>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={toggleComplete}
                className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? 'bg-green-600 border-green-600'
                    : 'border-slate-500 hover:border-blue-500'
                }`}>
                {todo.completed && <Check className="w-4 h-4 text-white" />}
              </button>

              {editing ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white text-xl font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-300 resize-none focus:outline-none focus:border-blue-500"
                    rows={4}
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h1
                    className={`text-2xl font-bold mb-2 ${
                      todo.completed ? 'text-slate-500 line-through' : 'text-white'
                    }`}>
                    {todo.title}
                  </h1>
                  {todo.description && <p className="text-slate-400">{todo.description}</p>}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded text-white"
                    title="Save">
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditTitle(todo.title);
                      setEditDescription(todo.description);
                    }}
                    className="p-2 hover:bg-slate-700 rounded text-slate-400"
                    title="Cancel">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                  title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-500 border-t border-slate-700 pt-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Created: {new Date(todo.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Updated: {new Date(todo.updatedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700">
            <button onClick={deleteTodo} className="text-red-400 hover:text-red-300 text-sm">
              Delete this todo
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg overflow-hidden">
          <ConvoView
            headerTitle="Ask about this Todo"
            headerSubtitle="Get help or ask questions about this task"
            template={`
> system
You are a helpful assistant that helps users with their todo tasks. Here is the current todo item:

Title: ${todo.title}
Description: ${todo.description || 'No description provided'}
Status: ${todo.completed ? 'Completed' : 'Not completed'}
Created: ${new Date(todo.createdAt).toLocaleDateString()}
Updated: ${new Date(todo.updatedAt).toLocaleDateString()}

Help the user with questions about this task. You can:
- Suggest ways to break down the task into smaller steps
- Provide tips on how to complete the task
- Help estimate time or effort needed
- Suggest related tasks or follow-ups
- Answer any questions about the task

> assistant
Hello! I'm here to help you with your task: "${todo.title}". What would you like to know?
                        `}
          />
        </div>
      </div>
    </div>
  );
}
