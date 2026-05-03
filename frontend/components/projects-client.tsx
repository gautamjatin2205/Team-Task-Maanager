"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type ProjectItem = {
  id: string;
  name: string;
  description: string;
  members: Array<{ userId: string; role: "ADMIN" | "MEMBER" }>;
  tasks: Array<{ id: string }>;
};

export function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  async function load() {
    const meResponse = await fetch("/api/auth/me");
    if (meResponse.ok) {
      const meJson = await meResponse.json().catch(() => ({}));
      setCurrentUserId(meJson.user?.id ?? null);
    }

    const response = await fetch("/api/projects");
    const json = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setError("Please login to view projects.");
      return;
    }

    if (!response.ok) {
      setError(json.error ?? "Failed to load projects");
      return;
    }

    setProjects(json.projects ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? "")
      })
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      alert(json.error ?? "Failed to create project");
      return;
    }

    setShowCreateProject(false);
    await load();
  }

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black text-gray-900">Projects</h1>
          <button
            type="button"
            onClick={() => setShowCreateProject((v) => !v)}
            className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-yellow-500"
          >
            + Create project
          </button>
        </div>
        <p className="mt-1 text-gray-600">Manage and view all your projects</p>
      </div>

      {showCreateProject && (
        <form onSubmit={createProject} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <input
            name="name"
            required
            minLength={3}
            maxLength={120}
            placeholder="Project name"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={600}
            placeholder="Project description"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateProject(false)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-yellow-500"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const myMembership = project.members.find((m) => m.userId === currentUserId);
          const myRole = myMembership?.role === "ADMIN" ? "Admin" : "Member";
          return (
            <div key={project.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">{myRole}</span>
                </div>
                <p className="text-sm text-gray-600">{project.description}</p>
                <p className="text-xs text-gray-500">{project.members.length} members • {project.tasks.length} tasks</p>
              </div>
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="block rounded-xl bg-yellow-400 px-4 py-2 text-center text-sm font-semibold text-gray-900 hover:bg-yellow-500"
                >
                  Open
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
