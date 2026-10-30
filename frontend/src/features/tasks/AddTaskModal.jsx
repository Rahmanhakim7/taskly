import { useState } from "react";

function AddTaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title wajib diisi");
      return;
    }

    const taskData = {
      title: title.trim(),
      status: status,
    };
    try {
      setLoading(true);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Gagal menambahkan task");
        return;
      }
      if (onCreated && result.data) {
        onCreated(result.data);
      }
      onClose();
    } catch (error) {
      console.log("Gagal Menambahkan Tasks", error);
      setError("Terjadi kesalahan saat menambahkan task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Tambah Task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700"
            aria-label="Tutup popup"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nama Task
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Belajar React"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-500"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;
