"use client";

import { useEffect, useState } from "react";
import { Button, Input, Select, Textarea } from "./ui";
import { useRouter } from "next/navigation";

export function NewTaskModal({ onClose }: { onClose: () => void }) {
  const [projects, setProjects] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/projects');
      if (res.status === 401) {
        setProjects([]);
        return;
      }
      if (res.ok) {
        const json = await res.json();
        setProjects(json.projects || []);
      }
    }
    load();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    const fm = new FormData(e.currentTarget as HTMLFormElement);
    const projectId = String(fm.get('projectId') ?? '');
    if (!projectId) return alert('Select a project');
    setLoading(true);
    const payload = {
      title: String(fm.get('title') ?? ''),
      description: String(fm.get('description') ?? ''),
      dueDate: String(fm.get('dueDate') ?? ''),
      priority: String(fm.get('priority') ?? 'MEDIUM'),
      assigneeId: String(fm.get('assigneeId') ?? '') || null
    };

    const res = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? 'Failed to create task');
      return;
    }
    onClose();
    // refresh to reflect new task
    router.refresh();
  }

  async function createProject(e: any) {
    e.preventDefault();
    const fm = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      name: String(fm.get("name") ?? ""),
      description: String(fm.get("description") ?? "")
    };

    setCreatingProject(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setCreatingProject(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Failed to create project");
      return;
    }

    const json = await res.json().catch(() => ({}));
    const created = json.project;
    if (created) {
      setProjects((prev) => [created, ...prev]);
    }
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Create task</h3>
        {projects.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm">No projects available yet. Create your first project to continue.</p>
            <form onSubmit={createProject} className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3">
              <Input name="name" placeholder="Project name" required minLength={3} maxLength={120} />
              <Textarea name="description" placeholder="Project description" required minLength={10} maxLength={600} />
              <div className="flex justify-end gap-2">
                <Button type="submit" className="bg-yellow-400">{creatingProject ? "Creating..." : "Create project"}</Button>
              </div>
            </form>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" onClick={onClose}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select name="projectId" aria-label="Project" className="w-full rounded border px-2 py-1">
              <option value="">Select project</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <Input name="title" placeholder="Title" required />
          <Textarea name="description" placeholder="Description" />
          <Input name="dueDate" type="datetime-local" />
          <Select name="priority" defaultValue="MEDIUM"><option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="URGENT">URGENT</option></Select>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-yellow-400">{loading ? 'Creating...' : 'Create'}</Button>
          </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default NewTaskModal;
