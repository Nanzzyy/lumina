'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { getTemplate } from '@/lib/template';
import { MobileBuilderEditor } from '@/components/mobile/MobileBuilderEditor';
import type { InvitationContent } from '@/lib/content/types';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function MobileBuilderSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { get, update } = useStudioStore();
  const slug = params.slug as string;

  const invitation = useMemo(() => get(slug), [slug, get]);
  const template = useMemo(() => invitation ? getTemplate(invitation.templateId) : null, [invitation]);

  const [content, setContent] = useState<InvitationContent | null>(null);
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (invitation) setContent(invitation.content);
  }, [invitation]);

  const save = useCallback(() => {
    if (!content || !invitation) return;
    update(slug, { content });
    setSaved(true);
  }, [content, invitation, update, slug]);

  useEffect(() => {
    if (!saved) {
      const timer = setTimeout(save, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, saved, save]);

  const handleChange = useCallback((c: InvitationContent) => {
    setContent(c);
    setSaved(false);
  }, []);

  if (!invitation || !content || !template) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Invitation not found.</p>
        <button onClick={() => router.push('/studio/mobile-builder')} className="mt-4 text-sm text-[var(--colors-primary)] hover:underline">
          Back to Mobile Builder
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/studio/mobile-builder')} className="text-zinc-400 hover:text-zinc-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900">{invitation.title}</h1>
            <p className="text-[10px] text-zinc-400">
              Mobile Canvas {saved ? '· Saved' : '· Unsaved'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 flex items-center gap-1.5">
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          {!saved && (
            <button onClick={save}
              className="px-3 py-1.5 text-xs bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)] flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {showPreview ? (
        <div className="flex-1 bg-zinc-100 flex items-start justify-center p-6 overflow-auto">
          <div className="w-[384px] bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Dynamic import for CanvasRenderer — it renders the final look */}
            <PreviewFrame content={content} />
          </div>
        </div>
      ) : (
        <MobileBuilderEditor content={content} onChange={handleChange} />
      )}
    </div>
  );
}

/* ─── Preview frame — inline render ─── */

import { CanvasRenderer } from '@/components/mobile/CanvasRenderer';

function PreviewFrame({ content }: { content: InvitationContent }) {
  return <CanvasRenderer content={content} />;
}
