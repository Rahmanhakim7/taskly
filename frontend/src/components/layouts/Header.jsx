import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/login");
  }

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-sm text-slate-500">Taskly</p>
      </div>
      <div className="flex items-center gap-5">
        {!user ? (
          <Link
            to="/login"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Login
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                {getInitials(user.name)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-800">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
              >
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  Profil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  Pengaturan
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
