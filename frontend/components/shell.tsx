"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { NewTaskModal } from "./new-task-modal";

export function Shell({ children }: { children: ReactNode }) {
  const [showNewTask, setShowNewTask] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/auth/me");
      if (!response.ok) return;
      const json = await response.json().catch(() => ({}));
      if (json.user) {
        setProfile({
          name: json.user.name ?? "User",
          email: json.user.email ?? "",
          role: json.user.role === "ADMIN" ? "Admin" : "User"
        });
      }
    }
    loadProfile();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials =
    (profile?.name ?? "U")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "U";

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-gray-900">
            T
          </div>
          <span className="font-bold text-gray-900">Team Task Manager</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium ${
              isActive("/dashboard")
                ? "bg-yellow-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Dashboard
          </Link>

          {/* Projects */}
          <Link
            href="/projects"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium ${
              isActive("/projects")
                ? "bg-yellow-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Projects
          </Link>

          {/* Tasks */}
          <Link
            href="/tasks"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium ${
              isActive("/tasks")
                ? "bg-yellow-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Task Management
          </Link>

          {/* Team */}
          <Link
            href="/team"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium ${
              isActive("/team")
                ? "bg-yellow-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Team
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 font-medium ${
              isActive("/notifications")
                ? "bg-yellow-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Notifications
          </Link>
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-gray-200 pt-4 space-y-1">
          <Link href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100">
            Settings
          </Link>

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-600 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-8 py-4 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm outline-none"
          />

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewTask(true)}
              className="bg-yellow-400 px-4 py-2 rounded-full font-semibold"
            >
              + New Task
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((v) => !v)}
                className="rounded-full bg-yellow-400 px-3 py-2 font-semibold hover:bg-yellow-500 transition"
              >
                {initials}
              </button>

              {showProfileMenu && profile && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                  </div>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    View profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition border-t border-gray-200"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Modal */}
        {showNewTask && <NewTaskModal onClose={() => setShowNewTask(false)} />}

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}