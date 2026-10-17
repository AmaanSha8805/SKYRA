'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ResumesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
