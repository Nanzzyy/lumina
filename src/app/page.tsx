import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { TemplateShowcase } from '@/components/landing/TemplateShowcase';
import { LayoutShowcase } from '@/components/landing/LayoutShowcase';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <TemplateShowcase />
      <LayoutShowcase />
      <footer className="py-12 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-zinc-400">
            Lumina — Premium Digital Invitations. Built with care.
          </p>
        </div>
      </footer>
    </>
  );
}
