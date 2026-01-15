import { ConvoView } from "@/components/ConvoView";
import { supClient } from "@/lib/supabase";
import { ParsedTodoSchema, Todo } from "@/lib/types";
import { convo } from "@convo-lang/convo-lang";
import { Check, ChevronRight, Database, Plus, Sparkles, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function IndexPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [userInput, setUserInput] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [kvData, setKvData] = useState<any>(null);
    const [showRawData, setShowRawData] = useState(false);

    const fetchTodos = useCallback(async () => {
        try {
            const res = await fetch("/api/todos");
            const data = await res.json();
            setTodos(data);
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch raw kv_store data
    const fetchKvData = useCallback(async () => {
        try {
            const r = await supClient().from('kv_store').select('*').eq('name', 'todos').single();
            setKvData(r.data);
        } catch (error) {
            console.error("Failed to fetch kv data:", error);
        }
    }, []);

    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Fetch kv_store data when toggling raw view
    useEffect(() => {
        if (showRawData) {
            fetchKvData();
        }
    }, [showRawData, fetchKvData]);

    // Use convo-lang to parse natural language input into structured todo
    const parseAndAddTodo = useCallback(async () => {
        if (!userInput.trim()) return;

        setParsing(true);
        try {
            // Use convo-lang with zod schema to parse natural language
            const parsed = await convo`
                > system
                You are a task parser. Convert the user's natural language input into a structured todo item.
                Extract the main task as title and any additional context as description.
                Keep the title concise and actionable.

                @json ${ParsedTodoSchema}
                > user
                Create a todo from this input:

                <input>
                ${userInput}
                </input>
            `;

            console.log("Parsed todo:", parsed);

            // Create todo via API
            const res = await fetch("/api/todos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: parsed.title,
                    description: parsed.description || "",
                }),
            });
            const newTodo = await res.json();
            setTodos((prev) => [...prev, newTodo]);
            setUserInput("");
            setShowAddForm(false);
        } catch (error) {
            console.error("Failed to parse/add todo:", error);
        } finally {
            setParsing(false);
        }
    }, [userInput]);

    const toggleComplete = useCallback(async (todo: Todo) => {
        try {
            console.log("Toggling todo:", todo.id, "completed:", !todo.completed);
            const res = await fetch("/api/todos", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: todo.id, completed: !todo.completed }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                console.error("API error:", errorData);
                return;
            }
            const updatedTodo = await res.json();
            console.log("Updated todo:", updatedTodo);
            setTodos((prev) =>
                prev.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
            );
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    }, []);

    const deleteTodo = useCallback(async (id: string) => {
        try {
            await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
            setTodos((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Todo List</h1>
                    <p className="text-slate-400">
                        Manage your tasks with AI-powered input and ask questions about them
                    </p>
                </header>

                {/* Add Todo Button / Form */}
                <div className="mb-6">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors w-full justify-center font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Todo
                        </button>
                    ) : (
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                    <h2 className="text-lg font-semibold text-white">Smart Todo Input</h2>
                                </div>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="p-1 hover:bg-slate-700 rounded"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">
                                Describe your task naturally - AI will parse it into a structured todo
                            </p>
                            <textarea
                                placeholder="e.g., 'Buy groceries tomorrow - need milk, eggs, and bread for breakfast'"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 mb-4 resize-none focus:outline-none focus:border-blue-500"
                                rows={3}
                            />
                            <button
                                onClick={parseAndAddTodo}
                                disabled={!userInput.trim() || parsing}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                {parsing ? (
                                    <>
                                        <Sparkles className="w-4 h-4 animate-spin" />
                                        Parsing with AI...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Add Todo with AI
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Todo List */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Your Tasks</h2>
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-12 text-slate-400">Loading...</div>
                            ) : todos.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    No todos yet. Add your first one!
                                </div>
                            ) : (
                                todos.map((todo) => (
                                    <div
                                        key={todo.id}
                                        className="group bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => toggleComplete(todo)}
                                                className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                                    todo.completed
                                                        ? "bg-green-600 border-green-600"
                                                        : "border-slate-500 hover:border-blue-500"
                                                }`}
                                            >
                                                {todo.completed && <Check className="w-3 h-3 text-white" />}
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className={`font-medium ${
                                                        todo.completed
                                                            ? "text-slate-500 line-through"
                                                            : "text-white"
                                                    }`}
                                                >
                                                    {todo.title}
                                                </h3>
                                                {todo.description && (
                                                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                                        {todo.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => deleteTodo(todo.id)}
                                                    className="p-2 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/todo/${todo.id}`}
                                                    className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                                    title="View details"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Stats */}
                        {todos.length > 0 && (
                            <div className="mt-4 text-center text-slate-500 text-sm">
                                {todos.filter((t) => t.completed).length} of {todos.length} completed
                            </div>
                        )}

                        {/* Raw kv_store data toggle */}
                        <div className="mt-6">
                            <button
                                onClick={() => setShowRawData(!showRawData)}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm"
                            >
                                <Database className="w-4 h-4" />
                                {showRawData ? "Hide" : "Show"} raw kv_store data
                            </button>
                            {showRawData && (
                                <div className="mt-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg overflow-auto max-h-64">
                                    <pre className="text-xs text-slate-400">
                                        <code className="whitespace-pre-wrap">
                                            {JSON.stringify(kvData, null, 2)}
                                        </code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ConvoView for asking questions about todos */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Ask About Your Todos</h2>
                        <ConvoView
                            headerTitle="Todo Assistant"
                            headerSubtitle="Ask anything about your tasks"
                            template={`
> system
You are a helpful todo list assistant. Here are the user's current todos:

${todos.length > 0
    ? todos.map((t, i) => `${i + 1}. [${t.completed ? "✓" : " "}] ${t.title}${t.description ? ` - ${t.description}` : ""}`).join("\n")
    : "No todos yet."}

Total: ${todos.length} tasks, ${todos.filter(t => t.completed).length} completed

Help the user with:
- Summarizing their tasks
- Prioritizing what to do next
- Breaking down complex tasks
- Suggesting time estimates
- Answering questions about their todo list

> assistant
Hello! I can see your todo list. What would you like to know about your tasks?
                            `}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
