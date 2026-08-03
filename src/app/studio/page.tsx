'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { getTemplate } from '@/lib/template';

export default function StudioDashboard() {
  const router = useRouter();
  const { invitations, loaded, remove } = useStudioStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{loaded ? `${invitations.length} invitation${invitations.length !== 1 ? 's' : ''}` : 'Loading...'}</p>
        </div>
        <button
          onClick={() => router.push('/studio/new')}
          className="px-5 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-full hover:bg-[var(--colors-primary-hover)] shadow-[0_4px_12px_-2px_rgba(219,39,119,0.35)] hover:shadow-[0_6px_16px_-2px_rgba(219,39,119,0.45)] transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Invitation
        </button>
      </div>

      {invitations.length === 0 && loaded ? (
        <div className="text-center py-24">
          <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-zinc-900/[0.04] flex items-center justify-center">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
          </div>
          <h3 className="text-sm font-medium text-zinc-900 mb-1">No invitations yet</h3>
          <p className="text-sm text-zinc-500 mb-5">Create your first invitation to get started.</p>
          <button
            onClick={() => router.push('/studio/new')}
            className="px-5 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-full hover:bg-[var(--colors-primary-hover)] shadow-[0_4px_12px_-2px_rgba(219,39,119,0.35)] transition-all"
          >
            Create Your First Invitation
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((inv) => {
            const template = getTemplate(inv.templateId);
            const p1 = inv.content?.couple?.partner1?.[0] || '?';
            const p2 = inv.content?.couple?.partner2?.[0] || '?';
            const c1 = inv.themeOverrides?.colors?.primary || template?.theme?.colors?.primary || '#db2777';
            const c2 = inv.themeOverrides?.colors?.secondary || template?.theme?.colors?.secondary || '#9333ea';
            return (
              <div key={inv.slug} className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col">
                {/* Preview tile */}
                <div className="h-40 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  <span className="font-[var(--typography-font-heading)] text-3xl text-white/95 drop-shadow-sm">{p1} & {p2}</span>
                  <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-zinc-700 backdrop-blur-sm">
                    {template?.name ?? inv.templateId}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-zinc-800 truncate">{inv.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{new Date(inv.updatedAt).toLocaleDateString()}</p>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => router.push(`/studio/${inv.slug}`)}
                      className="flex-1 px-3 py-1.5 text-xs font-medium text-zinc-700 border border-zinc-200 rounded-full hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Hapus "${inv.title}"?`)) return;
                        setDeleting(inv.slug);
                        try {
                          await remove(inv.slug);
                        } catch (err) {
                          console.error('[Studio] delete failed', err);
                          alert('Gagal menghapus undangan. Silakan coba lagi.');
                        } finally {
                          setDeleting(null);
                        }
                      }}
                      disabled={deleting === inv.slug}
                      className="px-3 py-1.5 text-xs text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-40">
                      {deleting === inv.slug ? '...' : 'Hapus'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
