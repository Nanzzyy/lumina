'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Smartphone } from 'lucide-react';

interface Invitation {
  slug: string;
  templateId: string;
  title: string;
  content: any;
  createdAt: string;
  updatedAt: string;
}

export default function MobileBuilderListPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/invitations')
      .then((r) => r.json())
      .then((list: Invitation[]) => {
        setInvites(list.filter((i) => i.templateId === 'mobile-canvas'));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const createNew = () => {
    router.push('/studio/new?template=mobile-canvas');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Mobile Canvas Builder</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Buat undangan dengan kanvas bebas — posisikan teks, gambar, tombol dengan drag & drop.
          </p>
        </div>
        <button
          onClick={createNew}
          className="px-4 py-2 bg-[var(--colors-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--colors-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Mobile Invitation
        </button>
      </div>

      {!loaded ? (
        <div className="text-center py-12 text-sm text-zinc-400">Loading...</div>
      ) : invites.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-300 rounded-xl">
          <Smartphone className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Belum ada undangan mobile.</p>
          <button onClick={createNew} className="mt-3 text-sm text-[var(--colors-primary)] hover:underline">
            Buat undangan mobile pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invites.map((inv) => (
            <button
              key={inv.slug}
              onClick={() => router.push(`/studio/mobile-builder/${inv.slug}`)}
              className="text-left bg-white rounded-xl border border-zinc-200 p-5 hover:border-[var(--colors-primary)]/40 hover:shadow-md transition-all group"
            >
              <div className="w-full aspect-[9/16] rounded-lg mb-3 overflow-hidden bg-zinc-900 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-[var(--colors-primary)] transition-colors text-sm">
                {inv.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {new Date(inv.updatedAt).toLocaleDateString('id-ID')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
