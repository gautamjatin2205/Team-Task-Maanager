"use client";

import { FormEvent, useEffect, useState } from "react";
import { Badge } from "./task-badge";
import { Button, Card, Input, Select, Textarea } from "./ui";

type ProjectPayload = {
  project: {
    id: string;
    name: string;
    description: string;
    members: Array<{ userId: string; role: string; user: { name: string; email: string } | null }>;
    tasks: Array<{ id: string; title: string; description: string; status: string; priority: string; dueDate: string; assigneeId: string | null }>;
  };
  membership: { role: string };
  currentUserId: string;
};

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [data, setData] = useState<ProjectPayload | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  async function load() {
    const response = await fetch(`/api/projects/${projectId}`);
    if (response.status === 401) {
      setData(null);
      return;
    }
    if (response.ok) setData(await response.json());
  }

  useEffect(() => {
    load();
  }, [projectId]);

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(form.get("email") ?? ""), role: String(form.get("role") ?? "MEMBER") })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(err.error ?? "Unable to add member");
      return;
    }

    await load();
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member from the project?")) return;

    const response = await fetch(`/api/projects/${projectId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(err.error ?? "Unable to remove member");
      return;
    }

    await load();
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title") ?? ""),
        description: String(form.get("description") ?? ""),
        dueDate: String(form.get("dueDate") ?? ""),
        priority: String(form.get("priority") ?? "MEDIUM"),
        assigneeId: String(form.get("assigneeId") ?? "") || null
      })
    });
    await load();
  }

  async function updateStatus(taskId: string, status: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task? This action cannot be undone.")) return;
    const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert(err.error ?? "Unable to delete task");
      return;
    }
    await load();
  }

  if (!data) return <Card>
    <div className="space-y-2">
      <p className="font-medium text-gray-900">Unauthorized</p>
      <p className="text-sm text-gray-500">Please <a href="/login" className="text-amber-600 font-medium">log in</a> to view this project.</p>
    </div>
  </Card>;
  const isAdmin = data.membership.role === "ADMIN";
  const visibleTasks = statusFilter === "ALL" ? data.project.tasks : data.project.tasks.filter((task) => task.status === statusFilter);

  return (
    <div className="space-y-6 text-gray-900">
      <Card className="bg-gradient-to-r from-white to-amber-50/60">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{data.project.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{data.project.description}</p>
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
            {data.project.members.length} members • {data.project.tasks.length} tasks
          </div>
        </div>
      </Card>

      {isAdmin && (
        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Add Member</h2>
            <form onSubmit={addMember} className="space-y-2">
              <Input name="email" type="email" required placeholder="member@email.com" />
              <Select name="role" defaultValue="MEMBER"><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></Select>
              <Button type="submit" className="w-full">Add</Button>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              The email must already belong to a user who has signed up. If not, ask them to create an account first, then add them here.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Current members</p>
              {data.project.members.map((member) => {
                const isSelf = member.userId === data.currentUserId;
                return (
                  <div key={member.userId} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user?.name ?? member.userId}</p>
                      <p className="text-xs text-gray-500">{member.user?.email ?? "Unknown email"} • {member.role}</p>
                    </div>
                    <Button
                      type="button"
                      className="bg-rose-500 text-white hover:bg-rose-400 disabled:opacity-50"
                      onClick={() => removeMember(member.userId)}
                      disabled={isSelf}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create Task</h2>
            <form onSubmit={createTask} className="space-y-2">
              <Input name="title" required placeholder="Task title" />
              <Textarea name="description" required placeholder="Task description" />
              <Input name="dueDate" type="datetime-local" required />
              <Select name="priority" defaultValue="MEDIUM"><option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>URGENT</option></Select>
              <Select name="assigneeId" defaultValue=""><option value="">Unassigned</option>{data.project.members.map((m) => <option key={m.userId} value={m.userId}>{m.user?.name ?? m.userId}</option>)}</Select>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </Card>
        </section>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          <div className="flex items-center gap-2">
            {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusFilter === value ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-600'}`}
              >
                {value === 'ALL' ? 'All' : value.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {visibleTasks.map((task) => (
            <div key={task.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">{task.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge text={task.priority} />
                  <Badge text={task.status} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Select
                  className="max-w-44"
                  defaultValue={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  disabled={!isAdmin && task.assigneeId !== data.currentUserId}
                >
                  <option value="TODO">TODO</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="DONE">DONE</option>
                </Select>
                {isAdmin && (
                  <Button type="button" className="ml-auto bg-rose-500 hover:bg-rose-400 text-white" onClick={() => deleteTask(task.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
