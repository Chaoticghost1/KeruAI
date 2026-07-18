import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { PageLayout } from "@/components/PageLayout";

export function ProtectedRoute({
  path,
  component: Component,
  roles = [],
}: {
  path: string;
  component: () => React.JSX.Element | null;
  roles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <PageLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-youth-primary" />
          </div>
        </PageLayout>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check role permissions if roles are specified
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <PageLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access this page.</p>
            </div>
          </div>
        </PageLayout>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}