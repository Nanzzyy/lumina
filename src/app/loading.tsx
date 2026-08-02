export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-stone-950 text-white">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-16 w-16">
          <img src="/icon.png" alt="" className="h-16 w-16 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.18)]" />
          <div className="absolute -inset-2 animate-spin rounded-[1.6rem] border-2 border-transparent border-t-amber-300/80" />
        </div>
        <div className="text-center">
          <p className="font-serif text-2xl tracking-tight">Lumina</p>
          <p className="mt-1 text-xs uppercase tracking-[0.35em] text-stone-400">Loading invitation</p>
        </div>
      </div>
    </div>
  );
}
