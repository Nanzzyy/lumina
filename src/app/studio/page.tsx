'use client';

import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/lib/studio/store';
import { getTemplate } from '@/lib/template';

export default function StudioDashboard() {
  const router = useRouter();
  const { invitations, loaded } = useStudioStore();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--typography-font-heading)] text-zinc-900">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">{loaded ? `${invitations.length} invitation${invitations.length !== 1 ? 's' : ''}` : 'Loading...'}</p>
        </div>
        <button
          onClick={() => router.push('/studio/new')}
          className="px-4 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Invitation
        </button>
      </div>

      {invitations.length === 0 && loaded ? (
        <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-xl">
          <svg className="w-12 h-12 mx-auto text-zinc-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-zinc-700 mb-2">No invitations yet</h3>
          <p className="text-sm text-zinc-400 mb-6">Create your first invitation to get started.</p>
          <button
            onClick={() => router.push('/studio/new')}
            className="px-6 py-2.5 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)] transition-colors"
          >
            Create Your First Invitation
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((inv) => {
            const template = getTemplate(inv.templateId);
            return (
              <div key={inv.slug} className="bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Color band */}
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${inv.themeOverrides?.colors?.primary || template?.theme?.colors?.primary || '#db2777'}, ${inv.themeOverrides?.colors?.secondary || template?.theme?.colors?.secondary || '#7c3aed'})` }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-zinc-900">{inv.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {template?.name ?? inv.templateId} · {new Date(inv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-4">
                    <span>{inv.content.couple.partner1} & {inv.content.couple.partner2}</span>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => router.push(`/studio/${inv.slug}`)}
                      className="flex-1 px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors">
                      Edit
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
