import { AppShell } from "@/components/AppShell";
import { SkeletonRows } from "@/components/editorial";

export default function Loading() {
  return (
    <AppShell active="/dashboard">
      <div className="skeleton mb-2 h-4 w-32" />
      <div className="skeleton mb-6 h-8 w-64" />
      <SkeletonRows rows={5} />
    </AppShell>
  );
}
