import { useAuth } from "@/hooks/use-auth";
import { PublicLayout } from "@/components/PublicLayout";
import { PublicNav } from "@/components/PublicNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Sidebar } from "@/components/Sidebar";
import MentorshipHub from "./MentorshipHub";

/**
 * Wrapper for /mentorship: public access for guests (PublicLayout + PublicNav),
 * app layout (Sidebar + main) for logged-in users.
 */
export default function MentorshipHubPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <PublicLayout>
        <PublicNav variant="landing" />
        <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
          Cargando…
        </div>
      </PublicLayout>
    );
  }

  if (!user) {
    return (
      <PublicLayout>
        <PublicNav variant="landing" />
        <ErrorBoundary>
          <MentorshipHub />
        </ErrorBoundary>
      </PublicLayout>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-80 pt-16 lg:pt-0 bg-youth-surface min-h-screen">
        <ErrorBoundary>
          <MentorshipHub />
        </ErrorBoundary>
      </main>
    </div>
  );
}
