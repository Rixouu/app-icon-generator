'use client';

export type ToastVariant = 'default' | 'success' | 'error';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastViewportProps = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

function variantClass(variant: ToastVariant): string {
  if (variant === 'success') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200';
  if (variant === 'error') return 'border-red-500/25 bg-red-500/10 text-red-950 dark:text-red-200';
  return 'border-border bg-card text-foreground';
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-[110] bottom-[calc(max(env(safe-area-inset-bottom,0px),0.75rem)+var(--mobile-nav-offset)+0.5rem)] px-4"
      role="region"
      aria-label="Notifications"
    >
      <div className="mx-auto flex w-full max-w-[420px] flex-col gap-2">
        {toasts.slice(-3).map((toast) => {
          const variant = toast.variant ?? 'default';
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.18)] backdrop-blur ${variantClass(
                variant,
              )}`}
              role="status"
              aria-live="polite"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-background/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 0 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
