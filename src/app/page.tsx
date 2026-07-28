import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TemplateShowcase } from '@/components/landing/TemplateShowcase';
import { LayoutShowcase } from '@/components/landing/LayoutShowcase';
import { initializeRegistries } from '@/lib/registry';
import { getAllTemplates } from '@/lib/template';

// Populate the template registry server-side so the showcase renders fully on SSR.
initializeRegistries();

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TemplateShowcase templates={getAllTemplates()} />
      <LayoutShowcase />
      <footer className="relative bg-zinc-950 text-zinc-400 overflow-hidden mt-[-1px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="font-[var(--typography-font-heading)] text-2xl font-bold text-white tracking-tight">Lumina</p>
              <p className="mt-3 text-sm leading-relaxed max-w-sm text-zinc-500">
                Premium digital invitations — crafted with character. Design, customize,
                and share a one-of-a-kind invitation in minutes.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-600">Product</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="/studio/templates" className="text-zinc-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="/studio/layouts" className="text-zinc-400 hover:text-white transition-colors">Layouts</a></li>
                <li><a href="/studio/new" className="text-zinc-400 hover:text-white transition-colors">Start Creating</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-600">Account</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="/studio" className="text-zinc-400 hover:text-white transition-colors">Studio</a></li>
                <li><a href="/login" className="text-zinc-400 hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Lumina. Premium Digital Invitations.</p>
            <p className="text-xs text-zinc-600">Built with care.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
