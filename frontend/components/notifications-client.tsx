"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardPayload = {
  stats: { totalTasks: number; todo: number; inProgress: number; done: number; overdue: number };
  tasksPerUser: Array<{ userId: string; name: string; count: number }>;
  projects: Array<{ id: string; name: string; description: string; memberCount: number; taskCount: number }>;
  recentTasks: Array<any>;
};

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  tone: "amber" | "red" | "gray" | "green";
  href?: string;
};

export function NotificationsClient() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setError("Unauthorized");
        return;
      }
      if (!res.ok) {
        setError(json.error ?? "Failed to load notifications");
        return;
      }
      setData(json as DashboardPayload);
    }

    load();
  }, []);

  if (error === "Unauthorized") {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-2 text-gray-600">
          Please <Link href="/login" className="font-medium text-amber-600">log in</Link> to see your notifications.
        </p>
      </div>
    );
  }

  if (error) return <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-700 shadow-sm">Error: {error}</div>;
  if (!data) return <div className="rounded-3xl border border-gray-200 bg-white p-8 text-gray-500 shadow-sm">Loading...</div>;

  const notifications: NotificationItem[] = [
    ...(data.stats.overdue > 0
      ? [
          {
            id: "overdue",
            title: `${data.stats.overdue} task${data.stats.overdue === 1 ? " is" : "s are"} overdue`,
            description: "Open the dashboard to review overdue work and update due dates.",
            tone: "red" as const,
            href: "/dashboard"
          }
        ]
      : []),
    ...data.recentTasks.slice(0, 5).map((task: any) => ({
      id: task.id,
      title: task.title,
      description: `${task.project?.name ?? "Project"} • ${task.status.replace("_", " ")}${task.assignee ? ` • ${task.assignee.name}` : ""}`,
      tone: task.status === "DONE" ? ("green" as const) : task.status === "IN_PROGRESS" ? ("amber" as const) : ("gray" as const),
      href: `/projects/${task.projectId}`
    }))
  ];

  const toneClasses: Record<NotificationItem["tone"], string> = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
    gray: "border-gray-200 bg-white text-gray-800",
    green: "border-green-200 bg-green-50 text-green-800"
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-r from-white to-amber-50/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Notifications</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">Updates from your projects, overdue items, and recent task activity.</p>
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            {notifications.length} alerts
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Total tasks</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{data.stats.totalTasks}</div>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Overdue</div>
          <div className="mt-2 text-2xl font-bold text-red-600">{data.stats.overdue}</div>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm text-gray-500">Recent activity</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{Math.min(data.recentTasks.length, 5)}</div>
        </div>
      </section>

      <section className="space-y-3">
        {notifications.map((item) => (
          <Link key={item.id} href={item.href ?? "#"} className={`block rounded-2xl border px-5 py-4 shadow-sm transition hover:-translate-y-0.5 ${toneClasses[item.tone]}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-semibold">{item.title}</div>
                <div className="mt-1 text-sm opacity-80">{item.description}</div>
              </div>
              <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide">Open</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
