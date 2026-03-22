import type { Metadata } from "next";
import { ProtectedAppShell } from "@/components/protected-app-shell";
import { requireAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuthSession();

  return <ProtectedAppShell displayName={session.user.displayName}>{children}</ProtectedAppShell>;
}
