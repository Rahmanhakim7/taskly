import { useState } from "react";

function EditTaskModal({ task, onClose, onUpdated }) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const taskData = {
      title: title,
      status: status,
    };

    try {
      setLoading(true);

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah task");
      }

      onUpdated(result.data);
      onClose();
    } catch (error) {
      console.error("Gagal mengubah task:", error);
      alert(error.message || "Terjadi kesalahan saat mengubah task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Edit Task</h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700"
            aria-label="Tutup modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="edit-title"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Judul Task
            </label>

            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masukkan judul task"
              required
              maxLength={255}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="edit-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Status
            </label>

            <select
              id="edit-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
