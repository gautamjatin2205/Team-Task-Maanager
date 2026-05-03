"use client";

import { Shell } from "../../frontend/components/shell";
import { useEffect, useState } from "react";

type TeamMember = {
id: string;
name: string;
email: string;
role?: string;
projectCount?: number;
taskCount?: number;
avatar?: string;
};

type TeamData = {
members: TeamMember[];
totalMembers: number;
totalProjects: number;
totalTasks: number;
};

export function TeamPageClient() {
const [data, setData] = useState<TeamData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");

async function loadData() {
try {
setLoading(true);

```
  const dashRes = await fetch("/api/dashboard");
  if (!dashRes.ok) throw new Error("Failed to load team data");

  const dashJson = await dashRes.json();

  const membersMap = new Map<string, TeamMember>();

  if (dashJson.tasksPerUser) {
    dashJson.tasksPerUser.forEach(
      (user: { userId: string; name: string; count: number }) => {
        if (!membersMap.has(user.userId)) {
          membersMap.set(user.userId, {
            id: user.userId,
            name: user.name,
            email: "",
            taskCount: user.count,
            projectCount: 0,
          });
        } else {
          const member = membersMap.get(user.userId)!;
          member.taskCount = user.count;
        }
      }
    );
  }

  setData({
    members: Array.from(membersMap.values()),
    totalMembers: membersMap.size,
    totalProjects: dashJson.projects?.length || 0,
    totalTasks: dashJson.stats?.totalTasks || 0,
  });
} catch (err: unknown) {
  setError(err instanceof Error ? err.message : String(err));
} finally {
  setLoading(false);
}
```

}

useEffect(() => {
loadData();
}, []);

const filteredMembers =
data?.members.filter(
(m) =>
m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
m.email.toLowerCase().includes(searchTerm.toLowerCase())
) || [];

if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
if (loading) return <div className="p-6">Loading team data...</div>;
if (!data) return <div className="p-6">No team data found</div>;

return ( <div className="space-y-6"> <div> <h1 className="text-3xl font-bold text-gray-900">Team Management</h1> <p className="mt-2 text-gray-600">
Manage team members and their assignments </p> </div>

```
  <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-500">Total Members</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">
        {data.totalMembers}
      </div>
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-500">Total Projects</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">
        {data.totalProjects}
      </div>
    </div>
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="text-sm text-gray-500">Total Tasks</div>
      <div className="mt-2 text-2xl font-bold text-gray-900">
        {data.totalTasks}
      </div>
    </div>
  </section>

  <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
      <div className="flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-amber-400"
        />
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              Tasks
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              Projects
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredMembers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                No team members found
              </td>
            </tr>
          ) : (
            filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-sm font-medium text-white">
                      {member.name.split(" ")[0][0] ?? "U"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.name}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600">
                    {member.email || "No email"}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {member.taskCount || 0}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {member.projectCount || 0}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {data.totalMembers === 0 && (
      <div className="mt-6 text-center py-8 text-gray-500">
        <p>No team members yet</p>
      </div>
    )}
  </section>
</div>
```

);
}

export default function TeamPage() {
return ( <Shell> <TeamPageClient /> </Shell>
);
}
