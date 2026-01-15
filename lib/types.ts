import z from 'zod';

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().default(''),
  completed: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
});

export const UpdateTodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export const ParsedTodoSchema = z.object({
  title: z.string().describe('The main task title, concise and actionable'),
  description: z.string().describe('Additional details or context about the task'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('Priority level if mentioned'),
});

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
export type ParsedTodo = z.infer<typeof ParsedTodoSchema>;

export interface KVStoreItem {
  id: number;
  key: string;
  value: any;
  created_at?: string;
}
