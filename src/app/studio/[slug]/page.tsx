'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useStudioStore, exportInvitationJSON } from '@/lib/studio/store';
import { getTemplate, TemplateRenderer } from '@/lib/template';
import { getLayout, getAllLayouts } from '@/lib/layout';
import { defaultTheme, ThemeProvider } from '@/lib/theme';
import type { InvitationContent, OrnamentConfig } from '@/lib/content/types';
import type { DeepPartial, ThemeConfig } from '@/lib/theme/types';
import { cn } from '@/lib/utils/cn';
import { OrnamentCanvas, OrnamentPreview } from '@/components/studio/OrnamentCanvas';
import { IframePreview } from '@/components/studio/IframePreview';

type EditorTab = 'content' | 'theme' | 'layout' | 'preview';

/* ─── Field helper ─── */
function Field({ label, children, fullWidth }: { label: string; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={cn(!fullWidth && 'sm:col-span-1', fullWidth && 'col-span-full')}>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 2, type }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; rows?: number; type?: string;
}) {
  const cls = 'w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent transition-shadow';
  if (multiline) return <textarea className={`${cls} resize-none`} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
  return <input type={type || 'text'} className={cls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-md border border-zinc-300 cursor-pointer flex-shrink-0" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent" placeholder="#hex" />
    </div>
  );
}

/* ─── Content Editor Sections ─── */
function CoupleEditor({ content, onChange, isSolo }: { content: InvitationContent; onChange: (c: InvitationContent) => void; isSolo?: boolean }) {
  const update = (field: keyof typeof content.couple, value: string) => {
    onChange({ ...content, couple: { ...content.couple, [field]: value } });
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Partner 1 Name"><Input value={content.couple.partner1} onChange={(v) => update('partner1', v)} placeholder="Sarah" /></Field>
      {!isSolo && <><Field label="Partner 2 Name"><Input value={content.couple.partner2} onChange={(v) => update('partner2', v)} placeholder="Alexander" /></Field></>}
      <Field label="Partner 1 Full Title"><Input value={content.couple.partner1Title || ''} onChange={(v) => update('partner1Title', v)} placeholder="Sarah Johnson" /></Field>
      {!isSolo && <><Field label="Partner 2 Full Title"><Input value={content.couple.partner2Title || ''} onChange={(v) => update('partner2Title', v)} placeholder="Alexander Chen" /></Field></>}
      <Field label="Parents" fullWidth><Input value={content.couple.parents || ''} onChange={(v) => update('parents', v)} placeholder="Mr. & Mrs. Johnson" /></Field>
      <div className="col-span-full mt-2">
        <p className="text-xs text-zinc-400 mb-2">Detail per-mempelai (untuk template premium)</p>
      </div>
      <Field label="Partner 1 Father"><Input value={content.couple.partner1Father || ''} onChange={(v) => update('partner1Father', v)} placeholder="Bpk. ..." /></Field>
      <Field label="Partner 1 Mother"><Input value={content.couple.partner1Mother || ''} onChange={(v) => update('partner1Mother', v)} placeholder="Ibu ..." /></Field>
      {!isSolo && <><Field label="Partner 2 Father"><Input value={content.couple.partner2Father || ''} onChange={(v) => update('partner2Father', v)} placeholder="Bpk. ..." /></Field></>}
      {!isSolo && <><Field label="Partner 2 Mother"><Input value={content.couple.partner2Mother || ''} onChange={(v) => update('partner2Mother', v)} placeholder="Ibu ..." /></Field></>}
      <Field label="Partner 1 Instagram"><Input value={content.couple.partner1Instagram || ''} onChange={(v) => update('partner1Instagram', v)} placeholder="@handle" /></Field>
      {!isSolo && <><Field label="Partner 2 Instagram"><Input value={content.couple.partner2Instagram || ''} onChange={(v) => update('partner2Instagram', v)} placeholder="@handle" /></Field></>}
      <Field label="Partner 1 Bio" fullWidth><Input value={content.couple.partner1Desc || ''} onChange={(v) => update('partner1Desc', v)} placeholder="Short bio..." /></Field>
      {!isSolo && <><Field label="Partner 2 Bio" fullWidth><Input value={content.couple.partner2Desc || ''} onChange={(v) => update('partner2Desc', v)} placeholder="Short bio..." /></Field></>}
    </div>
  );
}

function EventEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const ev = content.event || {} as InvitationContent['event'];
  const set = (k: string, v: string) => onChange({ ...content, event: { ...(content.event || {}), [k]: v } });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Date"><Input value={ev.date || ''} onChange={(v) => set('date', v)} placeholder="2026-09-15T16:00:00" /></Field>
      <Field label="Time"><Input value={ev.time || ''} onChange={(v) => set('time', v)} placeholder="4:00 PM" /></Field>
      <Field label="Location" fullWidth><Input value={ev.location || ''} onChange={(v) => set('location', v)} placeholder="The Grand Botanical Garden" /></Field>
      <Field label="Address" fullWidth><Input value={ev.address || ''} onChange={(v) => set('address', v)} placeholder="123 Main Street" /></Field>
      <Field label="Google Maps URL" fullWidth><Input value={ev.mapsUrl || ''} onChange={(v) => set('mapsUrl', v)} placeholder="https://maps.google.com/maps?q=..." /></Field>
      <Field label="Note" fullWidth><Input value={ev.note || ''} onChange={(v) => set('note', v)} multiline rows={2} placeholder="Garden attire..." /></Field>
    </div>
  );
}

function StoryEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const st = content.story || { title: "", paragraphs: [""], imagePosition: "left" };
  const updateParagraph = (i: number, v: string) => {
    const p = [...st.paragraphs];
    p[i] = v;
    onChange({ ...content, story: { ...content.story, paragraphs: p } });
  };
  const addParagraph = () => onChange({ ...content, story: { ...content.story, paragraphs: [...st.paragraphs, ''] } });
  const removeParagraph = (i: number) => onChange({ ...content, story: { ...content.story, paragraphs: st.paragraphs.filter((_, idx) => idx !== i) } });

  return (
    <div className="space-y-4">
      <Field label="Story Title"><Input value={st.title} onChange={(v) => onChange({ ...content, story: { ...content.story, title: v } })} placeholder="Our Love Story" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Image Position">
          <select value={st.imagePosition || 'left'} onChange={(e) => onChange({ ...content, story: { ...content.story, imagePosition: e.target.value as 'left' | 'right' } })}
            className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]">
            <option value="left">Kiri</option>
            <option value="right">Kanan</option>
          </select>
        </Field>
        <Field label="Story Image URL"><Input value={st.image || ''} onChange={(v) => onChange({ ...content, story: { ...content.story, image: v } })} placeholder="https://..." /></Field>
      </div>
      <div className="space-y-3">
        {st.paragraphs.map((p, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1"><Input value={p} onChange={(v) => updateParagraph(i, v)} multiline rows={2} placeholder={`Paragraph ${i + 1}...`} /></div>
            <button onClick={() => removeParagraph(i)} className="mt-2 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
        <button onClick={addParagraph} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)] transition-colors">+ Add paragraph</button>
      </div>
    </div>
  );
}

function GalleryEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const gl = content.gallery || { images: [], layout: "grid" };
  const set = (k: string, v: unknown) => onChange({ ...content, gallery: { ...content.gallery, [k]: v } } as InvitationContent);
  const addImage = () => set('images', [...gl.images, '']);
  const updateImage = (i: number, v: string) => {
    const imgs = [...gl.images]; imgs[i] = v;
    set('images', imgs);
  };
  const removeImage = (i: number) => set('images', gl.images.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <Field label="Layout">
        <select value={gl.layout || 'grid'} onChange={(e) => set('layout', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]">
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="carousel">Carousel</option>
        </select>
      </Field>
      <div className="space-y-2">
        {gl.images.map((img, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-xs text-zinc-400 w-6">{i + 1}.</span>
            <Input value={img} onChange={(v) => updateImage(i, v)} placeholder="Image / video URL (.mp4/.webm)" />
            <button onClick={() => removeImage(i)} className="text-zinc-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        ))}
        <button onClick={addImage} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ Add image</button>
        <p className="text-xs text-zinc-400">{gl.images.length} image{gl.images.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

function ScheduleEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const sch = content.schedule || { title: "", items: [] };
  const updateItem = (i: number, k: string, v: string) => {
    const items = sch.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item);
    onChange({ ...content, schedule: { ...content.schedule, items } });
  };
  const addItem = () => onChange({ ...content, schedule: { ...content.schedule, items: [...sch.items, { time: '', title: '', description: '' }] } } as InvitationContent);
  const removeItem = (i: number) => onChange({ ...content, schedule: { ...content.schedule, items: sch.items.filter((_, idx) => idx !== i) } } as InvitationContent);

  return (
    <div className="space-y-4">
      <Field label="Schedule Title"><Input value={sch.title} onChange={(v) => onChange({ ...content, schedule: { ...content.schedule, title: v } })} placeholder="Wedding Day Timeline" /></Field>
      {sch.items.map((item, i) => (
        <div key={i} className="p-4 border border-zinc-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Event {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-zinc-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-zinc-500 mb-1">Time</label><Input value={item.time} onChange={(v) => updateItem(i, 'time', v)} placeholder="4:00 PM" /></div>
            <div><label className="block text-xs text-zinc-500 mb-1">Title</label><Input value={item.title} onChange={(v) => updateItem(i, 'title', v)} placeholder="Ceremony" /></div>
          </div>
          <div><label className="block text-xs text-zinc-500 mb-1">Venue</label><Input value={item.venue || ''} onChange={(v) => updateItem(i, 'venue', v)} placeholder="Venue name (template premium)" /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Address</label><Input value={item.address || ''} onChange={(v) => updateItem(i, 'address', v)} placeholder="Full address" /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Maps URL</label><Input value={item.mapsUrl || ''} onChange={(v) => updateItem(i, 'mapsUrl', v)} placeholder="https://maps.google.com/..." /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Description</label><Input value={item.description || ''} onChange={(v) => updateItem(i, 'description', v)} multiline rows={1} placeholder="Event description..." /></div>
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ Add event</button>
      <Field label="Schedule Note"><Input value={sch.note || "" || ''} onChange={(v) => onChange({ ...content, schedule: { ...content.schedule, note: v } })} multiline rows={1} placeholder="Subject to change..." /></Field>
    </div>
  );
}

function MediaEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const m = content.media || {};
  const set = (k: 'cover' | 'hero' | 'partner1Photo' | 'partner2Photo', v: string) =>
    onChange({ ...content, media: { ...m, [k]: v } });
  const fields: { k: 'cover' | 'hero' | 'partner1Photo' | 'partner2Photo'; label: string }[] = [
    { k: 'cover', label: 'Cover Background' },
    { k: 'hero', label: 'Hero Background' },
    { k: 'partner1Photo', label: 'Foto Mempelai 1' },
    { k: 'partner2Photo', label: 'Foto Mempelai 2' },
  ];
  const music = content.music ?? { src: '' };
  const setMusic = (k: 'src' | 'title', v: string) => onChange({ ...content, music: { ...music, [k]: v } });

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-400">Gambar <strong>atau video</strong> (.mp4/.webm/.mov) — tempel URL, terdeteksi otomatis.</p>
      {fields.map(({ k, label }) => (
        <div key={k} className="flex gap-3 items-center">
          <div className="w-14 h-14 rounded-lg border border-zinc-200 overflow-hidden flex-shrink-0 bg-zinc-50">
            {m[k] ? (
              <img src={m[k]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">—</div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">{label}</label>
            <Input value={m[k] || ''} onChange={(v) => set(k, v)} placeholder="https://... (gambar / video)" />
          </div>
        </div>
      ))}

      <div className="pt-3 mt-2 border-t border-zinc-200">
        <p className="text-xs text-zinc-400 mb-2">Lagu (background music)</p>
        <div className="space-y-2">
          <Input value={music.src || ''} onChange={(v) => setMusic('src', v)} placeholder="https://.../lagu.mp3" />
          <Input value={music.title || ''} onChange={(v) => setMusic('title', v)} placeholder="Judul lagu (opsional)" />
        </div>
      </div>
    </div>
  );
}

function StoriesEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const stories = content.stories || [];
  const update = (i: number, k: 'year' | 'title' | 'desc', v: string) => {
    const next = stories.map((s, idx) => (idx === i ? { ...s, [k]: v } : s));
    onChange({ ...content, stories: next });
  };
  const add = () => onChange({ ...content, stories: [...stories, { year: '', title: '', desc: '' }] });
  const remove = (i: number) => onChange({ ...content, stories: stories.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-400">Timeline kisah cinta (dipakai template premium). Kosong = fallback default.</p>
      {stories.map((s, i) => (
        <div key={i} className="p-4 border border-zinc-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Momen {i + 1}</span>
            <button onClick={() => remove(i)} className="text-zinc-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-zinc-500 mb-1">Year</label><Input value={s.year} onChange={(v) => update(i, 'year', v)} placeholder="2021" /></div>
            <div className="col-span-2"><label className="block text-xs text-zinc-500 mb-1">Title</label><Input value={s.title} onChange={(v) => update(i, 'title', v)} placeholder="Pertemuan Pertama" /></div>
          </div>
          <div><label className="block text-xs text-zinc-500 mb-1">Description</label><Input value={s.desc} onChange={(v) => update(i, 'desc', v)} multiline rows={2} placeholder="Cerita singkat..." /></div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ Tambah momen</button>
    </div>
  );
}

function RSVPGuestBookGiftEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const rsvp = content.rsvp || {}; const gft = content.gift || { enabled: true, layout: "standalone", items: [] }; const gbk = content.guestbook || { enabled: true, showMessages: true };
  return (
    <div className="space-y-6">
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">RSVP</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs text-zinc-500 mb-1">Title</label><Input value={(rsvp.title ?? "") || ''} onChange={(v) => onChange({ ...content, rsvp: { ...content.rsvp, title: v } })} placeholder="Will You Attend?" /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Deadline</label><Input value={(rsvp.deadline ?? "") || ''} onChange={(v) => onChange({ ...content, rsvp: { ...content.rsvp, deadline: v } })} placeholder="2026-08-15" /></div>
          <div className="col-span-full"><label className="block text-xs text-zinc-500 mb-1">Description</label><Input value={(rsvp.description ?? "") || ''} onChange={(v) => onChange({ ...content, rsvp: { ...content.rsvp, description: v } })} multiline rows={1} placeholder="Please let us know..." /></div>
          <div className="flex items-center gap-3 mt-2">
            <label className="text-sm text-zinc-700">Show Confirmation List</label>
            <input type="checkbox" checked={(rsvp.showConfirmationList ?? true) !== false} onChange={(e) => onChange({ ...content, rsvp: { ...content.rsvp, showConfirmationList: e.target.checked } })}
              className="w-4 h-4 rounded border-zinc-300 text-[var(--colors-primary)] focus:ring-[var(--colors-primary)]" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">Wedding Gift</h3>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-zinc-700">Tampilkan Gift</label>
          <input type="checkbox" checked={(gft.enabled ?? true) !== false} onChange={(e) => onChange({ ...content, gift: { ...content.gift, enabled: e.target.checked } })}
            className="w-4 h-4 rounded border-zinc-300 text-[var(--colors-primary)] focus:ring-[var(--colors-primary)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="col-span-full"><label className="block text-xs text-zinc-500 mb-1">Layout</label>
            <select value={(gft.layout ?? "standalone") || 'standalone'} onChange={(e) => onChange({ ...content, gift: { ...content.gift, layout: e.target.value as 'standalone' | 'below-attendance' } })}
              className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)]">
              <option value="standalone">Section Sendiri</option>
              <option value="below-attendance">Di Bawah Attendance</option>
            </select>
          </div>
          <div><label className="block text-xs text-zinc-500 mb-1">Bank Name</label><Input value={(gft.bankName ?? "") || ''} onChange={(v) => onChange({ ...content, gift: { ...content.gift, bankName: v } })} placeholder="First National Bank" /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Account Number</label><Input value={(gft.accountNumber ?? "") || ''} onChange={(v) => onChange({ ...content, gift: { ...content.gift, accountNumber: v } })} placeholder="1234-5678" /></div>
          <div className="col-span-full"><label className="block text-xs text-zinc-500 mb-1">Account Name</label><Input value={(gft.accountName ?? "") || ''} onChange={(v) => onChange({ ...content, gift: { ...content.gift, accountName: v } })} placeholder="Sarah & Alexander" /></div>
          <div className="col-span-full"><label className="block text-xs text-zinc-500 mb-1">Description</label><Input value={(gft.description ?? "") || ''} onChange={(v) => onChange({ ...content, gift: { ...content.gift, description: v } })} multiline rows={1} placeholder="Your presence is the greatest gift..." /></div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Rekening multiple (template premium)</span>
            <button onClick={() => onChange({ ...content, gift: { ...content.gift, items: [...((gft.items || []) || []), { name: '', bank: '', number: '', owner: '' }] } })}
              className="text-xs text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ tambah</button>
          </div>
          <div className="space-y-2">
            {((gft.items || []) || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input value={item.bank || ''} onChange={(v) => { const items = [...((gft.items || []) || [])]; items[i] = { ...item, bank: v }; onChange({ ...content, gift: { ...content.gift, items } }); }} placeholder="Bank BCA" />
                  <Input value={item.number || ''} onChange={(v) => { const items = [...((gft.items || []) || [])]; items[i] = { ...item, number: v }; onChange({ ...content, gift: { ...content.gift, items } }); }} placeholder="1234567890" />
                  <Input value={item.owner || ''} onChange={(v) => { const items = [...((gft.items || []) || [])]; items[i] = { ...item, owner: v }; onChange({ ...content, gift: { ...content.gift, items } }); }} placeholder="A/N nama" />
                </div>
                <button onClick={() => onChange({ ...content, gift: { ...content.gift, items: ((gft.items || []) || []).filter((_, idx) => idx !== i) } })} className="mt-2 text-zinc-400 hover:text-red-500 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">Guest Book</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs text-zinc-500 mb-1">Title</label><Input value={(gbk.title ?? "") || ''} onChange={(v) => onChange({ ...content, guestbook: { ...content.guestbook, title: v } })} placeholder="Guest Book" /></div>
          <div className="flex items-center gap-3 mt-5">
            <label className="text-sm text-zinc-700">Enabled</label>
            <input type="checkbox" checked={(gbk.enabled ?? true)} onChange={(e) => onChange({ ...content, guestbook: { ...content.guestbook, enabled: e.target.checked } })}
              className="w-4 h-4 rounded border-zinc-300 text-[var(--colors-primary)] focus:ring-[var(--colors-primary)]" />
          </div>
          <div className="col-span-full"><label className="block text-xs text-zinc-500 mb-1">Description</label><Input value={(gbk.description ?? "") || ''} onChange={(v) => onChange({ ...content, guestbook: { ...content.guestbook, description: v } })} multiline rows={1} placeholder="Leave a message..." /></div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-700">Tampilkan Ucapan</label>
            <input type="checkbox" checked={(gbk.showMessages ?? true) !== false} onChange={(e) => onChange({ ...content, guestbook: { ...content.guestbook, showMessages: e.target.checked } })}
              className="w-4 h-4 rounded border-zinc-300 text-[var(--colors-primary)] focus:ring-[var(--colors-primary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuoteFooterEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const qt = content.quote || { text: "" }; const ft = content.footer || { text: "", showCredit: true };
  return (
    <div className="space-y-6">
      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">Quote</h3>
        <div className="space-y-3">
          <div><label className="block text-xs text-zinc-500 mb-1">Quote Text</label><Input value={qt.text} onChange={(v) => onChange({ ...content, quote: { ...content.quote, text: v } })} multiline rows={2} placeholder="Love is..." /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Source</label><Input value={qt.source || "" || ''} onChange={(v) => onChange({ ...content, quote: { ...content.quote, source: v } })} placeholder="Antoine de Saint-Exupéry" /></div>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-3">Footer</h3>
        <div className="space-y-3">
          <div><label className="block text-xs text-zinc-500 mb-1">Footer Text</label><Input value={ft.text} onChange={(v) => onChange({ ...content, footer: { ...content.footer, text: v } })} placeholder="With love..." /></div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-700">Show Credit</label>
            <input type="checkbox" checked={ft.showCredit ?? true} onChange={(e) => onChange({ ...content, footer: { ...content.footer, showCredit: e.target.checked } })}
              className="w-4 h-4 rounded border-zinc-300 text-[var(--colors-primary)] focus:ring-[var(--colors-primary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Partners Editor (multi-person events with >2 people) ─── */
function PartnersEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const list = content.couple?.partners || [];
  const update = (i: number, k: keyof import('@/lib/content/types').Partner, v: string) => {
    const next = list.map((p, idx) => (idx === i ? { ...p, [k]: v } : p));
    onChange({ ...content, couple: { ...content.couple, partners: next } });
  };
  const add = () => onChange({ ...content, couple: { ...content.couple, partners: [...list, { name: '' }] } });
  const remove = (i: number) => onChange({ ...content, couple: { ...content.couple, partners: list.filter((_, idx) => idx !== i) } });
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-400">Untuk acara dengan lebih dari 2 partisipan (keluarga, grup, dll).</p>
      {list.map((p, i) => (
        <div key={i} className="p-4 border border-zinc-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase">Partisipan {i + 1}</span>
            <button onClick={() => remove(i)} className="text-zinc-400 hover:text-red-500 p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={p.name} onChange={(v) => update(i, 'name', v)} placeholder="Nama" />
            <Input value={p.title || ''} onChange={(v) => update(i, 'title', v)} placeholder="Gelar / title" />
            <Input value={p.father || ''} onChange={(v) => update(i, 'father', v)} placeholder="Ayah" />
            <Input value={p.mother || ''} onChange={(v) => update(i, 'mother', v)} placeholder="Ibu" />
            <Input value={p.instagram || ''} onChange={(v) => update(i, 'instagram', v)} placeholder="@instagram" />
            <div className="col-span-full">
              <Input value={p.desc || ''} onChange={(v) => update(i, 'desc', v)} multiline rows={2} placeholder="Deskripsi / bio" />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ Tambah partisipan</button>
    </div>
  );
}

/* ─── Guest List Editor (per-guest shareable links) ─── */
function GuestListEditor({ content, onChange, slug }: { content: InvitationContent; onChange: (c: InvitationContent) => void; slug: string }) {
  const list = content.guestList || [];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const base = `${origin}/i/${slug}`;
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const update = (i: number, v: string) => {
    const next = [...list]; next[i] = v;
    onChange({ ...content, guestList: next });
  };
  const add = () => onChange({ ...content, guestList: [...list, ''] });
  const remove = (i: number) => onChange({ ...content, guestList: list.filter((_, idx) => idx !== i) });
  const named = list.map((n) => n.trim()).filter(Boolean);

  const inputCls = 'flex-1 px-3 py-2 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent transition-shadow min-w-0';

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        Link <strong>default</strong> menampilkan "Tamu Undangan" di cover. Link <strong>per-nama</strong> menampilkan nama tamu tersebut.
      </p>

      {/* Default link */}
      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400 flex-shrink-0">Default</span>
        <code className="flex-1 text-xs text-zinc-600 truncate">{base}</code>
        <button onClick={() => copy('default', base)} className="text-xs px-2.5 py-1.5 rounded-md bg-white border border-zinc-200 hover:bg-zinc-100 flex-shrink-0">
          {copied === 'default' ? '✓ Tersalin' : 'Salin'}
        </button>
      </div>

      {/* Per-guest rows */}
      <div className="space-y-2">
        {list.map((name, i) => {
          const url = name.trim() ? `${base}?to=${encodeURIComponent(name.trim())}` : base;
          return (
            <div key={i} className="flex gap-2 items-center">
              <input value={name} onChange={(e) => update(i, e.target.value)} placeholder="Nama tamu" className={inputCls} />
              <button onClick={() => copy(`g${i}`, url)} title={url} className="text-xs px-2.5 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 flex-shrink-0">
                {copied === `g${i}` ? '✓' : 'Salin Link'}
              </button>
              <button onClick={() => remove(i)} className="text-zinc-400 hover:text-red-500 flex-shrink-0 p-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button onClick={add} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">+ Tambah tamu</button>
        {named.length > 0 && (
          <button onClick={() => copy('all', named.map((n) => `${n}: ${base}?to=${encodeURIComponent(n)}`).join('\n'))}
            className="text-sm text-zinc-500 hover:text-zinc-700">
            {copied === 'all' ? '✓ Semua link tersalin' : 'Salin semua link'}
          </button>
        )}
        {named.length > 0 && <span className="text-xs text-zinc-400 ml-auto">{named.length} tamu</span>}
      </div>
    </div>
  );
}

/* ─── Section Background Editor ─── */
function SectionBackgroundEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const sectionIds = ['hero', 'quote', 'countdown', 'story', 'gallery', 'timeline', 'maps', 'rsvp', 'gift', 'guestbook', 'footer'];
  const bg = content.sectionBackgrounds || {};

  const setBg = (sectionId: string, field: string, value: unknown) => {
    onChange({
      ...content,
      sectionBackgrounds: {
        ...bg,
        [sectionId]: { ...(bg[sectionId] || {}), [field]: value },
      },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Set background per section — bisa warna, gambar, atau efek overlay.</p>
      {sectionIds.map((id) => (
        <details key={id} className="border border-zinc-200 rounded-lg overflow-hidden">
          <summary className="px-4 py-2 text-sm font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50 capitalize">
            {id}
          </summary>
          <div className="p-4 space-y-3 bg-zinc-50/50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Type</label>
                <select value={bg[id]?.type || 'color'} onChange={(e) => setBg(id, 'type', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
                  <option value="color">Color</option>
                  <option value="image">Image</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Overlay</label>
                <select value={bg[id]?.overlay || 'none'} onChange={(e) => setBg(id, 'overlay', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
                  <option value="none">None</option>
                  <option value="darken">Darken</option>
                  <option value="blur">Blur</option>
                </select>
              </div>
            </div>
            {bg[id]?.type === 'color' && (
              <ColorInput value={bg[id]?.color || '#ffffff'} onChange={(v) => setBg(id, 'color', v)} />
            )}
            {bg[id]?.type === 'gradient' && (
              <div><label className="block text-xs text-zinc-500 mb-1">Gradient CSS</label>
                <Input value={bg[id]?.gradient || ''} onChange={(v) => setBg(id, 'gradient', v)} placeholder="linear-gradient(135deg, #xxx, #yyy)" /></div>
            )}
            {bg[id]?.type === 'image' && (
              <div><label className="block text-xs text-zinc-500 mb-1">Image URL</label>
                <Input value={bg[id]?.image || ''} onChange={(v) => setBg(id, 'image', v)} placeholder="https://..." /></div>
            )}
            {bg[id]?.overlay !== 'none' && (
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Overlay Opacity (0-1)</label>
                <input type="range" min="0" max="1" step="0.1" value={bg[id]?.overlayOpacity ?? 0.4}
                  onChange={(e) => setBg(id, 'overlayOpacity', parseFloat(e.target.value))}
                  className="w-full" />
                <span className="text-xs text-zinc-400">{bg[id]?.overlayOpacity ?? 0.4}</span>
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

/* ─── Ornament Editor ─── */
function OrnamentEditor({ content, onChange }: { content: InvitationContent; onChange: (c: InvitationContent) => void }) {
  const ornaments = content.ornaments || [];

  const addOrnament = () => {
    const id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
    onChange({
      ...content,
      ornaments: [...ornaments, { id, type: 'flower' as const, position: 'center' as const, size: 'md' as const, opacity: 0.5 }],
    });
  };

  const updateOrnament = (i: number, field: string, value: unknown) => {
    const updated = ornaments.map((o, idx) => idx === i ? { ...o, [field]: value } : o);
    onChange({ ...content, ornaments: updated });
  };

  const removeOrnament = (i: number) => {
    onChange({ ...content, ornaments: ornaments.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">Tambahkan ornamen dekoratif ke halaman undangan.</p>
      {ornaments.map((ornament, i) => (
        <div key={i} className="p-4 border border-zinc-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 uppercase">Ornamen {i + 1}</span>
            <button onClick={() => removeOrnament(i)} className="text-zinc-400 hover:text-red-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Type</label>
              <select value={ornament.type} onChange={(e) => updateOrnament(i, 'type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
                <option value="flower">Flower</option>
                <option value="heart">Heart</option>
                <option value="divider">Divider</option>
                <option value="dots">Dots</option>
                <option value="leaf">Leaf</option>
                <option value="swirl">Swirl</option>
                <option value="frame">Frame</option>
                <option value="custom">Custom SVG</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Position</label>
              <select value={ornament.position} onChange={(e) => updateOrnament(i, 'position', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Size</label>
              <select value={ornament.size || 'md'} onChange={(e) => updateOrnament(i, 'size', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 text-sm">
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Opacity</label>
              <input type="range" min="0" max="1" step="0.1" value={ornament.opacity ?? 0.5}
                onChange={(e) => updateOrnament(i, 'opacity', parseFloat(e.target.value))}
                className="w-full" />
              <span className="text-xs text-zinc-400">{ornament.opacity ?? 0.5}</span>
            </div>
          </div>
          {ornament.type === 'custom' && (
            <div><label className="block text-xs text-zinc-500 mb-1">Custom SVG Path</label>
              <Input value={ornament.customSvg || ''} onChange={(v) => updateOrnament(i, 'customSvg', v)} placeholder="M12 2... (SVG path data)" /></div>
          )}
        </div>
      ))}
      <button onClick={addOrnament} className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)]">
        + Tambah Ornamen
      </button>
    </div>
  );
}

/* ─── Theme Editor ─── */
function ThemePanel({ overrides, onChange }: { overrides: DeepPartial<ThemeConfig>; onChange: (o: DeepPartial<ThemeConfig>) => void }) {
  const setColor = (key: string, value: string) => {
    onChange({ ...overrides, colors: { ...((overrides.colors || {}) as Record<string, string>), [key]: value } });
  };

  const colorKeys = [
    { key: 'primary', label: 'Primary' },
    { key: 'primary-hover', label: 'Primary Hover' },
    { key: 'primary-light', label: 'Primary Light' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'background-alt', label: 'Alt Background' },
    { key: 'text', label: 'Text' },
    { key: 'text-secondary', label: 'Text Secondary' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {colorKeys.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">{label}</label>
          <ColorInput value={((overrides.colors || {}) as Record<string, string>)[key] || defaultTheme.colors[key as keyof typeof defaultTheme.colors] || ''}
            onChange={(v) => setColor(key, v)} />
        </div>
      ))}
    </div>
  );
}

/* ─── Layout Tab ─── */
function LayoutTab({ invitation, content, layout, onLayoutChange }: {
  invitation: { templateId: string; layoutId?: string };
  content: InvitationContent;
  layout: import('@/lib/layout/types').LayoutDefinition;
  onLayoutChange: (layoutId: string) => void;
}) {
  const [layouts, setLayouts] = useState<{ id: string; name: string; config: any }[]>([]);

  useEffect(() => {
    fetch('/api/layouts')
      .then((r) => r.json())
      .then(setLayouts)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Current Layout</h2>
        <div className="bg-white border border-zinc-200 rounded-xl p-6">
          <select
            value={invitation.layoutId || 'default'}
            onChange={(e) => onLayoutChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--colors-primary)] focus:border-transparent"
          >
            {layouts.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <p className="text-xs text-zinc-400 mt-2">Switch layouts to change section ordering. Your content is preserved.</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Section Structure</h2>
        <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100">
          {layout.sections.map((s, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--colors-primary-light)] text-[var(--colors-primary)] text-xs font-medium flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-700 capitalize flex-1">{s.type}</span>
              {layout.containers[i] && (
                <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                  {layout.containers[i].type}
                </span>
              )}
              {s.hidden && (
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Hidden
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-lg">
        <h3 className="text-sm font-semibold text-zinc-700 mb-2">Want a custom layout?</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Create a new layout with your own section arrangement using the layout builder.
        </p>
        <a
          href="/studio/layouts/new"
          target="_blank"
          className="text-sm text-[var(--colors-primary)] hover:text-[var(--colors-primary-hover)] font-medium inline-flex items-center gap-1"
        >
          Open Layout Builder
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ─── Main Editor Page ─── */
export default function StudioEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { get, update, remove } = useStudioStore();
  const slug = params.slug as string;

  const invitation = useMemo(() => get(slug), [slug, get]);
  const template = useMemo(() => invitation ? getTemplate(invitation.templateId) : null, [invitation]);
  const layout = useMemo(() => invitation ? getLayout(invitation.layoutId || 'default') : null, [invitation]);

  const [tab, setTab] = useState<EditorTab>('content');
  const [content, setContent] = useState<InvitationContent | null>(null);
  const [themeOverrides, setThemeOverrides] = useState<DeepPartial<ThemeConfig>>({});
  const [saved, setSaved] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [editOrnaments, setEditOrnaments] = useState(false);

  useEffect(() => {
    if (invitation) {
      setContent(invitation.content);
      setThemeOverrides(invitation.themeOverrides || {});
    }
  }, [invitation]);

  const save = useCallback(() => {
    if (!content || !invitation) return;
    update(slug, { content, themeOverrides });
    setSaved(true);
  }, [content, themeOverrides, update, slug, invitation]);

  // Auto-save on changes
  useEffect(() => {
    if (!saved) {
      const timer = setTimeout(save, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, themeOverrides, saved, save]);

  const handleChange = useCallback((c: InvitationContent) => {
    setContent(c);
    setSaved(false);
  }, []);

  const handleThemeChange = useCallback((o: DeepPartial<ThemeConfig>) => {
    setThemeOverrides(o);
    setSaved(false);
  }, []);

  const handleDelete = () => {
    if (!confirm('Delete this invitation? This cannot be undone.')) return;
    remove(slug);
    router.push('/studio');
  };

  const handleExport = () => {
    if (!content || !invitation) return;
    const json = exportInvitationJSON({ ...invitation, content, themeOverrides });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  };

  // All hooks must be called before any early return — Rules of Hooks
  const isMonolithic = template?.kind === 'monolithic';
  const tabs: { id: EditorTab; label: string }[] = [
    { id: 'content', label: 'Content' },
    { id: 'preview', label: 'Preview' },
    // Theme + Layout only apply to composed templates (premium renders itself).
    ...(isMonolithic ? [] : [{ id: 'theme' as const, label: 'Theme' }, { id: 'layout' as const, label: 'Layout' }]),
  ];

  const mergedTheme = useMemo(() => {
    if (!template?.theme) return themeOverrides;
    return {
      ...template.theme,
      colors: { ...((template.theme.colors || {}) as Record<string, string>), ...((themeOverrides.colors || {}) as Record<string, string>) },
    } as DeepPartial<ThemeConfig>;
  }, [template?.theme, themeOverrides]);

  if (!invitation || !content || !template || (!isMonolithic && !layout)) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Invitation not found.</p>
        <button onClick={() => router.push('/studio')} className="mt-4 text-sm text-[var(--colors-primary)] hover:underline">Back to dashboard</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <button onClick={() => router.push('/studio')} className="hover:text-zinc-600">Studio</button>
            <span>/</span>
            <span className="text-zinc-600">{invitation.title}</span>
          </div>
          <h1 className="text-xl font-bold font-[var(--typography-font-heading)] text-zinc-900">{invitation.title}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Template: {template.name} · {saved ? 'Saved' : 'Unsaved changes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!saved && (
            <button onClick={save} className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors">
              Save Now
            </button>
          )}
          <button onClick={() => setShowExport(!showExport)}
            className="px-3 py-1.5 text-xs bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export
          </button>
          <button onClick={handleDelete} className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors">
            Delete
          </button>
        </div>
      </div>

      {showExport && (
        <div className="mb-6 p-4 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-between">
          <p className="text-sm text-zinc-600">Download invitation configuration as JSON file.</p>
          <button onClick={handleExport} className="px-4 py-2 bg-[var(--colors-primary)] text-white text-sm rounded-lg hover:bg-[var(--colors-primary-hover)]">
            Download JSON
          </button>
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 p-1 bg-zinc-100 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('px-4 py-2 text-sm rounded-md transition-all',
              tab === t.id ? 'bg-white text-zinc-900 shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-700')}>
            {t.label}
          </button>
        ))}
      </div>{/* close tab nav */}

      {/* Content Tab */}
      {tab === 'content' && (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Couple</h2>
            <CoupleEditor content={content} onChange={handleChange} isSolo={template?.mode === 'solo'} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Partisipan (acara multi orang)</h2>
            <PartnersEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Media (Gambar)</h2>
            <MediaEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Event</h2>
            <EventEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          {!isMonolithic && (
            <>
              <section>
                <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Story</h2>
                <StoryEditor content={content} onChange={handleChange} />
              </section>

              <div className="border-t border-zinc-200" />
            </>
          )}

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Love Story Timeline</h2>
            <StoriesEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Gallery</h2>
            <GalleryEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Schedule</h2>
            <ScheduleEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">RSVP, Gift &amp; Guest Book</h2>
            <RSVPGuestBookGiftEditor content={content} onChange={handleChange} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Daftar Tamu &amp; Link</h2>
            <GuestListEditor content={content} onChange={handleChange} slug={slug} />
          </section>

          <div className="border-t border-zinc-200" />

          <section>
            <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Quote &amp; Footer</h2>
            <QuoteFooterEditor content={content} onChange={handleChange} />
          </section>

          {!isMonolithic && (
            <>
              <div className="border-t border-zinc-200" />

              <section>
                <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Section Backgrounds</h2>
                <SectionBackgroundEditor content={content} onChange={handleChange} />
              </section>

              <div className="border-t border-zinc-200" />

              <section>
                <h2 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">Ornaments</h2>
                <OrnamentEditor content={content} onChange={handleChange} />
              </section>
            </>
          )}
        </div>
      )}

      {/* Theme Tab */}
      {tab === 'theme' && (
        <div>
          <p className="text-sm text-zinc-500 mb-6">Customize colors for this invitation. These override the template defaults.</p>
          <ThemePanel overrides={themeOverrides} onChange={handleThemeChange} />

          {/* Mini preview */}
          <div className="mt-8 p-6 border border-zinc-200 rounded-xl">
            <h3 className="text-sm font-semibold text-zinc-700 mb-4">Color Preview</h3>
            <div className="flex flex-wrap gap-3">
              {['primary', 'secondary', 'accent', 'background', 'text', 'text-secondary'].map((key) => {
                const colors = mergedTheme.colors as Record<string, string> || {};
                const val = colors[key];
                return (
                  <div key={key} className="text-center">
                    <div className="w-12 h-12 rounded-lg border border-zinc-200 mb-1" style={{ background: val || '#ccc' }} />
                    <span className="text-[10px] text-zinc-400">{key}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {tab === 'layout' && layout && (
        <LayoutTab
          invitation={invitation}
          content={content}
          layout={layout}
          onLayoutChange={(newLayoutId) => {
            update(slug, { layoutId: newLayoutId });
            setSaved(true);
          }}
        />
      )}

      {/* Preview Tab */}
      {tab === 'preview' && (
        <div>
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3 mb-0 flex items-center justify-between gap-4 shadow-sm">
            <p className="text-sm text-zinc-500 truncate">Live preview{editOrnaments ? ' — editing ornaments' : ''}</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg">
                {(['mobile', 'tablet', 'desktop'] as const).map((d) => (
                  <button key={d} onClick={() => setDevice(d)}
                    className={cn('px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5',
                      device === d ? 'bg-white text-zinc-900 shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-700')}>
                    {d === 'mobile' && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                    )}
                    {d === 'tablet' && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
                    )}
                    {d === 'desktop' && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    )}
                    {d === 'mobile' ? 'M' : d === 'tablet' ? 'T' : 'D'}
                  </button>
                ))}
              </div>
              {!isMonolithic && (
                <button onClick={() => setEditOrnaments(!editOrnaments)}
                  className={cn('px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5',
                    editOrnaments ? 'bg-[var(--colors-primary)] text-white shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-700 bg-zinc-100')}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                  {editOrnaments ? 'Done' : 'Ornaments'}
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {/* Use iframe for mobile/tablet to properly isolate viewport (position:fixed, vh units, etc.) */}
            {!editOrnaments && device !== 'desktop' ? (
              <div className="shadow-xl" style={{ width: device === 'mobile' ? 384 : 768 }}>
                <div className="bg-zinc-900 text-white/60 text-xs px-4 py-2 flex items-center gap-2 rounded-t-xl">
                  <svg className="w-3 h-3 text-red-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <svg className="w-3 h-3 text-green-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <span className="ml-2 text-[10px]">
                    Preview &middot; {template.name} &middot; {device === 'mobile' ? 'Mobile (384×728)' : 'Tablet (768×1024)'}
                  </span>
                </div>
                <IframePreview
                  width={device === 'mobile' ? 384 : 768}
                  height={device === 'mobile' ? 728 : 1024}
                >
                  <ThemeProvider theme={mergedTheme} scopeClass="lumina-invitation-scope">
                    <TemplateRenderer template={template} layout={layout ?? undefined} content={content} scopeClass="lumina-invitation-scope" hideOrnaments slug={slug} />
                  </ThemeProvider>
                </IframePreview>
              </div>
            ) : (
              <div className={cn(
                'border border-zinc-200 rounded-xl overflow-hidden transition-all duration-300',
                device === 'desktop' ? 'w-full' : 'shadow-xl',
                editOrnaments && 'border-[var(--colors-primary)]/30',
                isMonolithic && 'h-[80vh]',
              )}
                style={{
                  ...(device !== 'desktop' ? { maxWidth: device === 'mobile' ? 384 : 768 } : {}),
                  ...(isMonolithic ? { transform: 'translateZ(0)' } : {}),
                }}
              >
                <div className="bg-zinc-900 text-white/60 text-xs px-4 py-2 flex items-center gap-2">
                  <svg className="w-3 h-3 text-red-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <svg className="w-3 h-3 text-yellow-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <svg className="w-3 h-3 text-green-500" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="currentColor" /></svg>
                  <span className="ml-2 text-[10px]">
                    {editOrnaments ? 'Ornament Editor' : `Preview`} &middot; {template.name} &middot; {device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : 'Desktop'}
                  </span>
                </div>
                <div className={cn('bg-white', isMonolithic && 'h-full overflow-y-auto')} data-lumina-scroll>
                  <ThemeProvider theme={mergedTheme} scopeClass="lumina-invitation-scope">
                    <OrnamentCanvas
                      ornaments={content.ornaments || []}
                      onChange={(ornaments) => handleChange({ ...content, ornaments })}
                      readOnly={!editOrnaments}
                    >
                      <TemplateRenderer template={template} layout={layout ?? undefined} content={content} scopeClass="lumina-invitation-scope" hideOrnaments slug={slug} />
                    </OrnamentCanvas>
                  </ThemeProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Floating + button for adding ornaments. Rendered outside the preview frame to avoid overflow clip. */
function PlusOrnamentButton({ ornaments, onChange }: { ornaments: OrnamentConfig[]; onChange: (o: OrnamentConfig[]) => void }) {
  const [open, setOpen] = useState(false);
  const types: OrnamentConfig['type'][] = ['flower', 'heart', 'leaf', 'swirl', 'dots', 'divider', 'frame', 'custom'];

  const add = (type: OrnamentConfig['type']) => {
    const id = crypto.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
    onChange([...ornaments, { id, type, x: 50, y: 50, size: 24, opacity: 0.6 }]);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-8 z-50" style={{ pointerEvents: 'none' }}>
      <div style={{ pointerEvents: 'auto' }}>
        <button onClick={() => setOpen(!open)}
          className={cn('w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all',
            open ? 'bg-zinc-800 text-white rotate-45' : 'bg-[var(--colors-primary)] text-white')}
          title="Add ornament">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {open && (
          <div className="absolute bottom-16 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 w-48 z-40">
            <div className="grid grid-cols-4 gap-1">
              {types.map((type) => (
                <button key={type} onClick={() => add(type)}
                  className="w-10 h-10 rounded-lg hover:bg-zinc-100 flex items-center justify-center transition-colors" title={`Add ${type}`}>
                  <OrnamentPreview type={type} size="sm" />
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
              <span className="text-[10px] text-zinc-400 pl-1">{ornaments.length} placed</span>
              <button onClick={() => setOpen(false)} className="text-[10px] text-zinc-500 hover:text-zinc-700 px-2 py-0.5 rounded hover:bg-zinc-50">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
