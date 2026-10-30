import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { apiFetch } from "../../lib/api";

function Sidebar() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await apiFetch("/tasks");
        if (!response.ok) {
          return;
        }
        const result = await response.json();
        setTasks(result.data || []);
      } catch (error) {
        console.error("Gagal mengambil data task untuk sidebar:", error);
      }
    }

    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex-col bg-slate-900 text-white hidden lg:flex">
      <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold">
            T
          </div>

          <h1 className="text-2xl font-bold">Taskly</h1>
        </div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </div>
        <nav className="space-y-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/my-tasks"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 ${
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            My Tasks
          </NavLink>
        </nav>
        <div className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Task Status
        </div>
        <nav className="space-y-2">
          <NavLink
            to="/my-tasks?status=all"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <span className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              All Tasks
            </span>
            <span className="text-sm text-slate-400">{totalTasks}</span>
          </NavLink>
          <NavLink
            to="/my-tasks?status=todo"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <span className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              Todo
            </span>
            <span className="text-sm text-slate-400">{todoTasks}</span>
          </NavLink>
          <NavLink
            to="/my-tasks?status=in_progress"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <span className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              In Progress
            </span>
            <span className="text-sm text-slate-400">{inProgressTasks}</span>
          </NavLink>
          <NavLink
            to="/my-tasks?status=done"
            className="flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
          >
            <span className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Done
            </span>
            <span className="text-sm text-slate-400">{doneTasks}</span>
          </NavLink>
        </nav>
        <div className="mt-auto pt-10"></div>
      </div>
    </aside>
  );
}

export default Sidebar;
