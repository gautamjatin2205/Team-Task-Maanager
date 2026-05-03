import { ProjectDetailClient } from "@frontend/components/project-detail-client";
import { Shell } from "@frontend/components/shell";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell>
      <ProjectDetailClient projectId={id} />
    </Shell>
  );
}
