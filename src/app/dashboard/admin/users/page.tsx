
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";

interface AdminUser {
  _id: string;
  name?: string;
  email: string;
  role: "customer" | "technician" | "admin";
  phone?: string;
  area?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currentUserId = session?.user?.id;

  const user = session?.user as
    | { role?: string }
    | undefined;

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    if (user?.role !== "admin") {
      if (user?.role === "technician") {
        router.replace("/dashboard/technician/requests");
      } else {
        router.replace("/dashboard/customer");
      }
    }
  }, [isPending, session, user?.role, router]);

  useEffect(() => {
    if (isPending || user?.role !== "admin") return;

    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await api.get("/admin/users");

        if (!cancelled && response.data.success) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Users loading error:", error);
          toast.error("Failed to load users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [isPending, user?.role]);

  const refreshUsers = async () => {
    setRefreshing(true);

    try {
      const response = await api.get("/admin/users");

      if (response.data.success) {
        setUsers(response.data.users || []);
        toast.success("Users refreshed.");
      }
    } catch (error) {
      console.error("Users refresh error:", error);
      toast.error("Unable to refresh users.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoleChange = async (
    userId: string,
    newRole: AdminUser["role"]
  ) => {
    const previousUsers = users;

    setUpdatingId(userId);

    try {
      const response = await api.patch(
        `/admin/users/${userId}/role`,
        { role: newRole }
      );

      if (response.data.success) {
        setUsers((currentUsers) =>
          currentUsers.map((item) =>
            item._id === userId
              ? { ...item, role: newRole }
              : item
          )
        );

        toast.success("User role updated successfully.");
      } else {
        setUsers(previousUsers);
        toast.error(response.data.message || "Role update failed.");
      }
    } catch (error) {
      console.error("Role update error:", error);
      toast.error("Failed to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      (item.name || "").toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      (item.role || "").toLowerCase().includes(keyword) ||
      (item.area || "").toLowerCase().includes(keyword)
    );
  });

  if (isPending || !session || user?.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700"
        >
          <ArrowLeft size={17} />
          Back to Admin Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-teal-700">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Admin Control
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Manage Users
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View platform members and manage their account roles.
            </p>
          </div>

          <button
            onClick={refreshUsers}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh Users
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">
                Total Users
              </p>
              <Users className="text-teal-700" size={22} />
            </div>
            <p className="mt-3 text-3xl font-black text-slate-900">
              {users.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Customers
            </p>
            <p className="mt-3 text-3xl font-black text-purple-700">
              {users.filter((item) => item.role === "customer").length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Technicians
            </p>
            <p className="mt-3 text-3xl font-black text-orange-600">
              {users.filter((item) => item.role === "technician").length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Platform Members
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredUsers.length} users found
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, role..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <Users size={40} className="mb-3 text-slate-300" />
              <h3 className="font-bold text-slate-800">
                No users found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try searching with another name or email.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold">Contact</th>
                      <th className="px-6 py-4 font-bold">Area</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Joined</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((item) => (
                      <tr key={item._id} className="transition hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">
                            {item.name || "Unnamed User"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.phone || "Not provided"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.area || "Not provided"}
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={item.role}
                            disabled={
                              updatingId === item._id ||
                              item._id === currentUserId
                            }
                            onChange={(event) =>
                              handleRoleChange(
                                item._id,
                                event.target.value as AdminUser["role"]
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700 outline-none focus:border-teal-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                          >
                            <option value="customer">Customer</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>

                          {item._id === currentUserId && (
                            <p className="mt-1 text-xs text-slate-400">
                              Your account
                            </p>
                          )}

                          {updatingId === item._id && (
                            <Loader2
                              size={14}
                              className="ml-2 inline animate-spin text-teal-700"
                            />
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((item) => (
                  <div key={item._id} className="space-y-3 p-5">
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.name || "Unnamed User"}
                      </p>
                      <p className="break-all text-sm text-slate-500">
                        {item.email}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="mt-1 text-slate-700">
                          {item.phone || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Area</p>
                        <p className="mt-1 text-slate-700">
                          {item.area || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="mb-1 text-xs text-slate-400">Role</p>
                        <select
                          value={item.role}
                          disabled={
                            updatingId === item._id ||
                            item._id === currentUserId
                          }
                          onChange={(event) =>
                            handleRoleChange(
                              item._id,
                              event.target.value as AdminUser["role"]
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold capitalize text-slate-700 outline-none focus:border-teal-600 disabled:bg-slate-100"
                        >
                          <option value="customer">Customer</option>
                          <option value="technician">Technician</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Joined</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {item._id === currentUserId && (
                      <p className="text-xs text-slate-400">
                        You cannot change your own role.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
