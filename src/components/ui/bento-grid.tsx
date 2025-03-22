import { cn } from "@/lib/utils";

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  children,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        "group/bento relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-xl dark:border-white/[0.2] dark:bg-black",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 opacity-0 transition-opacity duration-300 group-hover/bento:opacity-100 dark:from-slate-800 dark:to-slate-900" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        {header}
        <div className="mt-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
