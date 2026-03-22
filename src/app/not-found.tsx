export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[400px] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-[32px] border border-border bg-background-secondary p-6 shadow-[0_18px_44px_rgba(17,17,17,0.08)]">
        <p className="text-sm uppercase tracking-[0.24em] text-foreground-muted">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          The page you are looking for does not exist inside the current app shell.
        </p>
      </div>
    </main>
  );
}
