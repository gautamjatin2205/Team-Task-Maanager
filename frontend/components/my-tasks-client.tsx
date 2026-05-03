"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TaskItem = {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  project: { id: string; name: string };
  assignee: { id: string; name: string } | null;
};

function bucketForTask(task: TaskItem) {
  const due = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return "This week";
  return "Later";
}

function formatDueLabel(dateString: string) {
  const due = new Date(dateString);
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MyTasksClient() {
  const [tasks, setTasks] = useState<TaskItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/tasks");
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setError("Unauthorized");
      setTasks([]);
      return;
    }
    if (!res.ok) {
      setError(json.error ?? "Failed to load tasks");
      return;
    }
    setTasks(json.tasks ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateTask(taskId: string, status: TaskItem["status"]) {
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

    await load();
  }

  if (error === "Unauthorized") {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">My tasks</h1>
        <p className="mt-2 text-gray-600">
          Please <Link href="/login" className="font-medium text-amber-600">log in</Link> to view your tasks.
        </p>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-700 shadow-sm">Error: {error}</div>;
  }

  if (!tasks) {
    return <div className="rounded-3xl border border-gray-200 bg-white p-8 text-gray-500 shadow-sm">Loading...</div>;
  }

  const groups = ["Today", "Tomorrow", "This week", "Later"] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My tasks</h1>
            <p className="mt-1 text-sm text-gray-500">Tasks across your projects, grouped by due date.</p>
          </div>
          <div className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
            {tasks.length} total tasks
          </div>
        </div>
      </section>

      {groups.map((group) => {
        const bucketTasks = tasks.filter((task) => bucketForTask(task) === group);
        if (bucketTasks.length === 0) return null;

        return (
          <section key={group} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">{group}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Due date</th>
                    <th className="px-6 py-4">Stage</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Team</th>
                    <th className="px-6 py-4">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {bucketTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => updateTask(task.id, task.status === "DONE" ? "TODO" : "DONE")}
                            className={`mt-1 h-5 w-5 rounded-full border-2 ${task.status === "DONE" ? "border-yellow-500 bg-yellow-400" : "border-gray-400 bg-white"}`}
                            aria-label="Toggle done"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="mt-1 text-sm text-gray-500">{task.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-yellow-700">{formatDueLabel(task.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${task.status === "DONE" ? "bg-green-100 text-green-700" : task.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                          {task.status === "TODO" ? "Not started" : task.status === "IN_PROGRESS" ? "In progress" : "Done"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${task.priority === "HIGH" || task.priority === "URGENT" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{task.project.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                            {task.assignee ? task.assignee.name.slice(0, 1).toUpperCase() : "-"}
                          </div>
                          <span className="text-sm text-gray-700">{task.assignee?.name ?? "Unassigned"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
