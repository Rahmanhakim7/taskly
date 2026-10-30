import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AddTaskModal from "./AddTaskModal";
import EditTaskModal from "./EditTaskModal";

const statusConfig = {
  todo: {
    label: "Todo",
    className: "bg-orange-100 text-orange-700",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  done: {
    label: "Done",
    className: "bg-emerald-100 text-emerald-700",
  },
};

function TaskList() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const [showModal, setShowModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const tasksPerPage = 6;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Gagal mengambil Data Task");
      }
      const result = await response.json();
      setTasks(result.data || []);
    } catch (error) {
      console.error("Gagal Mengambil Task:", error);
      setError("Data task gagal dimuat. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch]);

  const filteredTasks = tasks
    .filter((task) => {
      if (statusFilter === "all") return true;
      return task.status === statusFilter;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
    );

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const displayPage =
    totalPages === 0 ? 1 : currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (displayPage - 1) * tasksPerPage;
  const currentTasks = filteredTasks.slice(
    startIndex,
    startIndex + tasksPerPage,
  );

  async function handleDelete(id) {
    const confirmed = window.confirm("Yakin ingin menghapus task ini?");
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus task");
      }
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id),
      );
    } catch (error) {
      console.log("Gagal Menghapus Task", error);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daftar Task</h2>

          <p className="mt-1 text-sm text-slate-500">
            Kelola semua tugas harianmu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Tambah Task
        </button>
      </div>

      <div className="mb-3 flex w-80 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="text-lg text-slate-400">⌕</span>
        <input
          type="text"
          placeholder="Cari task..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />

        <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-slate-400">
          /
        </span>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center text-slate-500">Memuat task...</p>
        ) : error ? (
          <p className="p-6 text-center text-sm text-red-600">{error}</p>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500">
                  <th className="px-3 py-3 font-medium">Nama Task</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Dibuat</th>
                  <th className="px-3 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Task tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-800">
                          {task.title}
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusConfig[task.status]?.className ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {statusConfig[task.status]?.label ?? task.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {task.created_at}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowEditTaskModal(true);
                            }}
                            type="button"
                            aria-label={`Edit task ${task.title}`}
                            title="Edit task"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:translate-y-0"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDelete(task.id)}
                            type="button"
                            aria-label={`Hapus task ${task.title}`}
                            title="Hapus task"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 active:translate-y-0"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Halaman {displayPage} dari {Math.max(totalPages, 1)} · Menampilkan{" "}
                {filteredTasks.length} hasil
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={displayPage === 1 || totalPages === 0}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages === 0 ? 1 : totalPages, page + 1),
                    )
                  }
                  disabled={displayPage >= totalPages || totalPages === 0}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onCreated={(createdTask) => {
            setTasks((previousTasks) => [createdTask, ...previousTasks]);
          }}
        />
      )}
      {showEditTaskModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => {
            setShowEditTaskModal(false);
            setSelectedTask(null);
          }}
          onUpdated={(updatedTask) => {
            setTasks((previousTasks) =>
              previousTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task,
              ),
            );
          }}
        />
      )}
    </section>
  );
}

export default TaskList;
