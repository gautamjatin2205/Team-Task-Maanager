"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type DashboardPayload = {
  me: { id: string; name: string; email: string };
  projectRoles: Array<{ projectId: string; role: "ADMIN" | "MEMBER" }>;
  stats: { totalTasks: number; todo: number; inProgress: number; done: number; overdue: number };
  tasksPerUser: Array<{ userId: string; name: string; count: number }>;
  projects: Array<{ id: string; name: string; description: string; memberCount: number; taskCount: number }>;
  recentTasks: Array<any>;
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const dashRes = await fetch("/api/dashboard");
      const dashJson = await dashRes.json().catch(() => ({}));

      if (dashRes.status === 401) {
        setUnauthenticated(true);
        return;
      }

      if (!dashRes.ok) throw new Error(dashJson.error ?? "Failed to load dashboard");
      setData(dashJson as DashboardPayload);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  if (unauthenticated) {
    return <div className="p-6">You are not logged in. Please sign in to view your dashboard.</div>;
  }

  if (error) return <div className="p-6">Error: {error}</div>;
  if (loading || !data) return <div className="p-6">Loading...</div>;

  const roleByProjectId = new Map(data.projectRoles.map((item) => [item.projectId, item.role]));

  function isAdminForProject(projectId: string) {
    return roleByProjectId.get(projectId) === "ADMIN";
  }

  async function updateTaskStatus(taskId: string, status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to update task");
      return;
    }
    await loadAll();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to delete task");
      return;
    }
    await loadAll();
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "")
      })
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to create project");
      return;
    }

    setShowCreateProject(false);
    await loadAll();
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-5">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Total tasks</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.stats.totalTasks}</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">To Do</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.stats.todo}</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">In Progress</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.stats.inProgress}</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Done</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.stats.done}</div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="mt-2 text-2xl font-bold text-red-600">{data.stats.overdue}</div>
        </div>
      </section>

      {/* Tasks per user & recent tasks */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tasks by user</h3>
          <div className="space-y-3">
            {data.tasksPerUser.map((u) => (
              <div key={u.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">{u.name.split(" ")[0][0] ?? "U"}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.count} tasks</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent tasks</h3>
          </div>

          <div className="space-y-3">
            {data.recentTasks.map((task: any) => {
              const project = data.projects.find((p) => p.id === task.projectId) || null;
              const isAdmin = project ? isAdminForProject(project.id) : false;
              const isAssignee = task.assignee && task.assignee.id === data.me.id;
              return (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">{project?.name ?? ""} • {task.assignee ? task.assignee.name : "Unassigned"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Status control */}
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                      disabled={!isAdmin && !isAssignee}
                      aria-label="Task status"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>

                    {/* Admin controls */}
                    {isAdmin && (
                      <>
                        <button onClick={() => deleteTask(task.id)} className="text-sm text-red-600">Delete</button>
                        <Link href={`/projects/${project?.id}`} className="text-sm text-gray-600">Manage</Link>
                      </>
                    )}

                    {/* Member-only note */}
                    {!isAdmin && !isAssignee && <div className="text-xs text-gray-400">Limited</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Small widgets: projects list */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900">Projects</h3>
            <button
              type="button"
              onClick={() => setShowCreateProject((v) => !v)}
              className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-yellow-500"
            >
              New project
            </button>
          </div>

          {showCreateProject && (
            <form onSubmit={createProject} className="mb-4 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <input
                name="name"
                required
                minLength={3}
                maxLength={120}
                placeholder="Project name"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                name="description"
                required
                minLength={10}
                maxLength={600}
                placeholder="Project description"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-yellow-500"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.memberCount} members • {p.taskCount} tasks</div>
                </div>
                {isAdminForProject(p.id) && <Link href={`/projects/${p.id}`} className="text-sm text-gray-600">Manage</Link>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">My tracking</h3>
          <div className="text-sm text-gray-500">Tracking widget placeholder</div>
        </div>
      </section>
    </div>
  );
}
