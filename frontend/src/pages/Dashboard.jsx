import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await apiFetch("/tasks");

        if (!response.ok) {
          throw new Error("Gagal mengambil data task");
        }

        const result = await response.json();
        setTasks(result.data);
      } catch (error) {
        console.error("Gagal mengambil task:", error);
        setError("Data task gagal dimuat. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const todoTasks = tasks.filter((task) => task.status === "todo").length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress",
  ).length;

  const completedTasks = tasks.filter((task) => task.status === "done").length;

  const totalTasks = tasks.length;

  const progress = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const statistics = [
    {
      label: "Total Tasks",
      value: totalTasks,
      color: "text-slate-800",
      background: "bg-slate-100",
    },
    {
      label: "Todo",
      value: todoTasks,
      color: "text-orange-700",
      background: "bg-orange-100",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      color: "text-blue-700",
      background: "bg-blue-100",
    },
    {
      label: "Completed",
      value: completedTasks,
      color: "text-emerald-700",
      background: "bg-emerald-100",
    },
  ];

  const recentTasks = [...tasks].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau aktivitas dan progres tugasmu.
        </p>
      </div>

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-slate-500">
          Memuat dashboard...
        </p>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-500">{item.label}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-3xl font-bold ${item.color}`}>
                    {item.value}
                  </span>

                  <span
                    className={`rounded-xl px-3 py-2 text-xs font-medium ${item.background} ${item.color}`}
                  >
                    Tasks
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-bold text-slate-800">Progress Tugas</h2>

              <span className="text-sm font-semibold text-emerald-600">
                {progress}%
              </span>
            </div>

            <div
              className="h-3 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress penyelesaian tugas"
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {completedTasks} dari {totalTasks} task telah selesai.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-bold text-slate-800">Recent Tasks</h2>
                <p className="mt-1 text-sm text-slate-500">5 task terbaru</p>
              </div>
            </div>

            {recentTasks.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Belum ada task. Tambahkan task pertamamu!
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTasks.map((task) => {
                  const statusInfo = {
                    todo: {
                      label: "Todo",
                      className: "bg-orange-100 text-orange-700",
                    },
                    in_progress: {
                      label: "In Progress",
                      className: "bg-blue-100 text-blue-700",
                    },
                    done: {
                      label: "Completed",
                      className: "bg-emerald-100 text-emerald-700",
                    },
                  };

                  const status = statusInfo[task.status] ?? {
                    label: task.status,
                    className: "bg-slate-100 text-slate-700",
                  };

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Task #{task.id}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
