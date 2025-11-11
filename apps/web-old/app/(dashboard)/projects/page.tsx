import { FolderKanban } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Projects</h1>
        <p className="text-dark-text-secondary mt-2">
          Organize your work into projects.
        </p>
      </div>

      <Card className="card p-12 text-center">
        <FolderKanban className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">
          Projects - Coming Soon
        </h2>
        <p className="text-dark-text-secondary">
          This feature will be implemented in Phase 6.
        </p>
      </Card>
    </div>
  );
}
