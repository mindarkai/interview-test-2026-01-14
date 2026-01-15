import { supClient } from '@/lib/supabase';
import { Todo } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

const TODOS_NAME = 'todos';

async function getTodos(): Promise<Todo[]> {
  const { data, error } = await supClient()
    .from('kv_store')
    .select('*')
    .eq('name', TODOS_NAME)
    .single();

  console.log('getTodos - data:', data, 'error:', error);

  if (error || !data) {
    return [];
  }
  return data.value || [];
}

async function saveTodos(todos: Todo[]): Promise<void> {
  const { data: existing } = await supClient()
    .from('kv_store')
    .select('id')
    .eq('name', TODOS_NAME)
    .single();

  let result;
  if (existing) {
    result = await supClient()
      .from('kv_store')
      .update({ value: todos })
      .eq('name', TODOS_NAME)
      .select();
  } else {
    result = await supClient().from('kv_store').insert({ name: TODOS_NAME, value: todos }).select();
  }

  console.log('saveTodos - data:', result.data, 'error:', result.error);

  if (result.error) {
    console.error('saveTodos failed:', result.error.message);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const todos = await getTodos();
        return res.status(200).json(todos);
      }

      case 'POST': {
        const { title, description } = req.body;
        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        const todos = await getTodos();
        const newTodo: Todo = {
          id: crypto.randomUUID(),
          title,
          description: description || '',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        todos.push(newTodo);
        await saveTodos(todos);
        return res.status(201).json(newTodo);
      }

      case 'PUT': {
        const { id, title, description, completed } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'ID is required' });
        }

        const todos = await getTodos();
        const index = todos.findIndex((t) => t.id === id);
        if (index === -1) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        todos[index] = {
          ...todos[index],
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(completed !== undefined && { completed }),
          updatedAt: new Date().toISOString(),
        };
        await saveTodos(todos);
        return res.status(200).json(todos[index]);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ error: 'ID is required' });
        }

        const todos = await getTodos();
        const filteredTodos = todos.filter((t) => t.id !== id);
        if (filteredTodos.length === todos.length) {
          return res.status(404).json({ error: 'Todo not found' });
        }

        await saveTodos(filteredTodos);
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
