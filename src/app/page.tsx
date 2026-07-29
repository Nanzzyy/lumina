import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { Features } from '@/components/landing/Features';
import { TemplateShowcase } from '@/components/landing/TemplateShowcase';
import { LayoutShowcase } from '@/components/landing/LayoutShowcase';
import { CtaSection } from '@/components/landing/CtaSection';
import { initializeRegistries } from '@/lib/registry';
import { getAllTemplates } from '@/lib/template';

// Populate the template registry server-side so the showcase renders fully on SSR.
initializeRegistries();

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Features />
      <TemplateShowcase templates={getAllTemplates()} />
      <LayoutShowcase />
      <CtaSection />
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <p className="font-serif text-2xl font-bold text-white tracking-tight">Lumina</p>
              <p className="mt-3 text-sm leading-relaxed max-w-sm text-stone-500">
                Premium digital invitations — crafted with character.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-500">Product</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/studio/templates" className="text-stone-400 hover:text-white transition-colors">Templates</a></li>
                <li><a href="/studio/layouts" className="text-stone-400 hover:text-white transition-colors">Layouts</a></li>
                <li><a href="/studio/new" className="text-stone-400 hover:text-white transition-colors">Start Creating</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-500">Account</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/studio" className="text-stone-400 hover:text-white transition-colors">Studio</a></li>
                <li><a href="/login" className="text-stone-400 hover:text-white transition-colors">Login</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-500">© {new Date().getFullYear()} Lumina. Premium Digital Invitations.</p>
            <p className="text-xs text-stone-500">Built with care.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
