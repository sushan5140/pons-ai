import { cn } from "@/lib/utils";

export default function AmbientBackground({
  variant = "default",
  className,
}: {
  variant?: "default" | "dark" | "quiet";
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 grid-texture opacity-60" />

      {variant === "dark" ? (
        <>
          <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
          <div className="absolute bottom-0 right-[-10%] h-[420px] w-[600px] rounded-full bg-secondary/30 blur-[140px]" />
        </>
      ) : variant === "quiet" ? (
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[160px]" />
      ) : (
        <>
          <div className="absolute -top-32 right-[-8%] h-[520px] w-[520px] rounded-full bg-accent/30 blur-[130px]" />
          <div className="absolute bottom-[-15%] left-[-10%] h-[460px] w-[460px] rounded-full bg-primary/10 blur-[130px]" />
        </>
      )}
    </div>
  );
}
