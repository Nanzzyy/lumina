'use client';

import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-fuchsia-950">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-pink-500/15 blur-[100px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-400/10 blur-[80px]" />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-xs font-medium text-white/80 tracking-wide mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Premium Digital Invitations
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-[var(--typography-font-heading)] text-white leading-[1.08] tracking-tight">
              Beautiful
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200">
                Wedding Invitations
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              From elegant minimal to botanical, art-deco, and beyond — craft a one-of-a-kind
              digital invitation. Customize every detail, then share in minutes.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/studio/new"
                className="px-8 py-3.5 bg-white text-indigo-950 rounded-full text-sm font-semibold hover:bg-white/90 transition-all shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start Creating
              </Link>
              <Link
                href="/studio/templates"
                className="px-8 py-3.5 bg-white/10 text-white rounded-full text-sm font-semibold border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all hover:-translate-y-0.5"
              >
                Browse Templates
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-lg mx-auto lg:mx-0">
              {[
                { n: '23+', l: 'Premium Templates' },
                { n: 'Mobile', l: 'First Design' },
                { n: 'RSVP', l: 'Wishes & Gift' },
                { n: 'Music', l: 'Countdown & Maps' },
              ].map((s) => (
                <div key={s.l} className="text-center lg:text-left">
                  <p className="font-[var(--typography-font-heading)] text-xl sm:text-2xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">{s.n}</p>
                  <p className="text-[11px] sm:text-xs text-white/40 mt-0.5 tracking-wide">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-[3/4]">
              {/* Main gradient orb */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-rose-400/20 to-purple-400/20 rounded-[40px] backdrop-blur-sm border border-white/10" />
              {/* Couple silhouette illustration */}
              <svg viewBox="0 0 400 500" fill="none" className="w-full h-full drop-shadow-2xl" aria-hidden="true">
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                </defs>
                {/* Woman silhouette */}
                <path d="M200 80 C180 80, 165 95, 165 115 C165 135, 180 150, 200 150 C220 150, 235 135, 235 115 C235 95, 220 80, 200 80Z" fill="url(#g1)" />
                <path d="M200 150 C150 150, 110 200, 100 270 L300 270 C290 200, 250 150, 200 150Z" fill="url(#g1)" />
                {/* Man silhouette */}
                <path d="M200 80 C175 75, 155 95, 155 120 C155 145, 175 160, 200 160 C225 160, 245 145, 245 120 C245 95, 225 75, 200 80Z" fill="url(#g1)" opacity="0.6" />
                <path d="M200 160 C145 160, 100 215, 90 290 L310 290 C300 215, 255 160, 200 160Z" fill="url(#g1)" opacity="0.6" />
                {/* Heart */}
                <path d="M200 180 C200 170, 190 160, 180 160 C165 160, 155 175, 155 185 C155 205, 200 220, 200 220 C200 220, 245 205, 245 185 C245 175, 235 160, 220 160 C210 160, 200 170, 200 180Z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                {/* Decorative rings */}
                <circle cx="200" cy="250" r="140" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none" />
                <circle cx="200" cy="250" r="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none" />
                <circle cx="200" cy="250" r="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
