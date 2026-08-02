export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-stone-950 text-white">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border border-amber-200/20" />
          <div className="absolute inset-1 animate-spin rounded-full border-2 border-transparent border-t-amber-300" />
          <div className="absolute inset-4 rounded-full bg-amber-200/80 shadow-[0_0_30px_rgba(251,191,36,0.45)]" />
        </div>
        <div className="text-center">
          <p className="font-serif text-2xl tracking-tight">Lumina</p>
          <p className="mt-1 text-xs uppercase tracking-[0.35em] text-stone-400">Loading invitation</p>
        </div>
      </div>
    </div>
  );
}
