/** @jsxImportSource https://esm.sh/preact@10.27.2 */
// deno-lint-ignore-file no-import-prefix
// @ts-nocheck The old cached version of the library causes type errors sometimes.
import { useEffect, useState } from "https://esm.sh/preact@10.27.2/hooks";
import { serve } from "https://esm.sh/jsr/@d2verb/pera?deps=preact@10.27.2";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
};

export function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const raw = localStorage.getItem("todos");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [newTodo, setNewTodo] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch {
      // Ignore persistence errors (e.g., private mode/localStorage quota)
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === "") return;

    const newTodoItem: Todo = {
      id: Date.now(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // フィルタリングされたTodoの取得
  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case "active":
        return !todo.completed;
      case "completed":
        return todo.completed;
      default:
        return true;
    }
  });

  // 完了済みTodoの数
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo App</h1>
          <p className="text-gray-600">
            A simple Todo app built with pera and TailwindCSS
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo((e.target as HTMLInputElement).value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              placeholder="Type a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTodo}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All ({todos.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "completed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Completed ({completedCount})
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {filteredTodos.length === 0
            ? (
              <div className="p-8 text-center text-gray-500">
                {filter === "all" && "No todos yet. Add a new todo."}
                {filter === "active" && "No active todos."}
                {filter === "completed" && "No completed todos."}
              </div>
            )
            : (
              <div className="divide-y divide-gray-200">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <p
                        className={`${
                          todo.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {todo.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(todo.createdAt).toLocaleString("en-US")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteTodo(todo.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Built with pera, TailwindCSS, and Preact</p>
        </div>
      </div>
    </div>
  );
}

await serve(App, {
  port: 8080,
  title: "Todo App - pera Sample",
  moduleUrl: import.meta.url,
  props: {},
});
