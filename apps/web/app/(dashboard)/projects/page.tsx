import { FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-neutral-400 mt-2">
          Organize your work into projects.
        </p>
      </div>

      <Card className="p-12 text-center bg-neutral-900/50 border-neutral-800">
        <FolderKanban className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Projects - Coming Soon
        </h2>
        <p className="text-neutral-400">
          This feature will be implemented in Phase 6.
        </p>
      </Card>
    </div>
  );
}
