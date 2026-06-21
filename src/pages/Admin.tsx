import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../utlis/apiClient";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
  plan?: "free" | "pro";
  subscriptionStatus?: string | null;
  isBlocked?: boolean;
  shadowBanned?: boolean;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalContent: number;
  blockedUsers: number;
  shadowBannedUsers: number;
  proUsers: number;
}

const STAT_CARDS: { key: keyof Stats; label: string }[] = [
  { key: "totalUsers", label: "Total users" },
  { key: "proUsers", label: "Pro users" },
  { key: "newUsersThisWeek", label: "New this week" },
  { key: "totalContent", label: "Saved items" },
  { key: "blockedUsers", label: "Blocked" },
  { key: "shadowBannedUsers", label: "Shadowbanned" },
];

export default function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Gate: admins only.
  useEffect(() => {
    apiClient
      .get("/api/v1/plan")
      .then((r) => {
        if (r.data?.role === "admin") {
          setAuthorized(true);
        } else {
          setAuthorized(false);
          toast.error("Admin access required");
          navigate("/dashboard", { replace: true });
        }
      })
      .catch(() => {
        setAuthorized(false);
        navigate("/dashboard", { replace: true });
      });
  }, [navigate]);

  const loadStats = useCallback(() => {
    apiClient
      .get("/api/v1/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  const loadUsers = useCallback((p: number, q: string) => {
    setLoading(true);
    apiClient
      .get("/api/v1/admin/users", { params: { page: p, limit: 20, search: q } })
      .then((r) => {
        setUsers(r.data.users ?? []);
        setPages(r.data.pages ?? 1);
      })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  // Initial load + pagination.
  useEffect(() => {
    if (authorized) {
      loadStats();
      loadUsers(page, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, page]);

  // Debounced search.
  useEffect(() => {
    if (!authorized) return;
    const t = setTimeout(() => {
      setPage(1);
      loadUsers(1, search);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function act(id: string, run: () => Promise<{ data?: { message?: string } }>) {
    setBusyId(id);
    try {
      const r = await run();
      toast.success(r.data?.message || "Done");
      loadUsers(page, search);
      loadStats();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Action failed";
      toast.error(msg);
    } finally {
      setBusyId(null);
    }
  }

  const setPlan = (u: AdminUser, plan: "free" | "pro") =>
    act(u._id, () => apiClient.post(`/api/v1/admin/users/${u._id}/plan`, { plan }));
  const setRole = (u: AdminUser, role: string) =>
    act(u._id, () => apiClient.post(`/api/v1/admin/users/${u._id}/role`, { role }));
  const toggleBlock = (u: AdminUser) =>
    act(u._id, () =>
      apiClient.post(`/api/v1/admin/users/${u._id}/${u.isBlocked ? "unblock" : "block"}`, {})
    );
  const toggleShadow = (u: AdminUser) =>
    act(u._id, () =>
      apiClient.post(
        `/api/v1/admin/users/${u._id}/${u.shadowBanned ? "unshadowban" : "shadowban"}`,
        {}
      )
    );

  if (authorized === null) {
    return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Checking access…</div>;
  }
  if (!authorized) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-3xl font-bold gradient-text mb-1">Admin</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Manage users, plans, roles, and moderation.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {STAT_CARDS.map((c) => (
          <div
            key={c.key}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats ? stats[c.key] : "—"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by username or email…"
        className="w-full sm:max-w-sm mb-4 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Users table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3">Plan</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
            {!loading &&
              users.map((u) => {
                const isPro = u.plan === "pro";
                const busy = busyId === u._id;
                return (
                  <tr key={u._id} className="bg-white dark:bg-gray-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{u.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isPro
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {isPro ? "PRO" : "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={busy}
                        onChange={(e) => setRole(u, e.target.value)}
                        className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked && (
                        <span className="text-xs text-red-600 dark:text-red-400">blocked</span>
                      )}
                      {u.shadowBanned && (
                        <span className="block text-xs text-orange-600 dark:text-orange-400">
                          shadowbanned
                        </span>
                      )}
                      {!u.isBlocked && !u.shadowBanned && (
                        <span className="text-xs text-green-600 dark:text-green-400">active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          disabled={busy}
                          onClick={() => setPlan(u, isPro ? "free" : "pro")}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {isPro ? "Downgrade" : "Make Pro"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => toggleBlock(u)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => toggleShadow(u)}
                          className="px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          {u.shadowBanned ? "Unshadow" : "Shadow"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
