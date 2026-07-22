'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useStudioStore } from '@/lib/studio/store';
import { getTemplate, TemplateRenderer } from '@/lib/template';
import { ArrowLeft, Save, Smartphone, Heart, Calendar, MapPin, Clock, Image, Music, Quote, Gift, MessageSquare, Star, Sparkles, Globe, Upload } from 'lucide-react';
import type { InvitationContent, StoryMoment, ScheduleItem, GiftItem } from '@/lib/content/types';

export default function MobileEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { get, update } = useStudioStore();
  const slug = params.slug as string;

  const invitation = get(slug);
  const template = invitation ? getTemplate(invitation.templateId) : null;

  const [content, setContent] = useState<InvitationContent | null>(null);
  const [saved, setSaved] = useState(true);
  const prevSlugRef = useRef(slug);

  // Init content when invitation first loads or slug changes.
  // Skip on refresh (same slug) so local edits aren't overwritten.
  useEffect(() => {
    if (!invitation) return;
    if (prevSlugRef.current !== slug) {
      // Slug changed — re-init content.
      setContent(invitation.content);
      prevSlugRef.current = slug;
    } else if (!content) {
      // First load.
      setContent(invitation.content);
    }
  }, [invitation, slug, content]);

  const save = useCallback(() => {
    if (!content || !invitation) return;
    update(slug, { content });
    setSaved(true);
  }, [content, invitation, update, slug]);

  useEffect(() => {
    if (!saved) { const t = setTimeout(save, 3000); return () => clearTimeout(t); }
  }, [content, saved, save]);

  const set = useCallback((patch: Partial<InvitationContent>) => {
    setContent(c => c ? { ...c, ...patch } : null);
    setSaved(false);
  }, []);

  if (!invitation || !content || !template) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Invitation not found.</p>
        <button onClick={() => router.push('/studio')} className="mt-4 text-sm text-[var(--colors-primary)] hover:underline">Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => router.push('/studio')} className="text-zinc-400 hover:text-zinc-600"><ArrowLeft className="w-5 h-5" /></button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-zinc-900 truncate">{invitation.title}</h1>
            <p className="text-[10px] text-zinc-400"><Smartphone className="w-3 h-3 inline mr-1 -mt-0.5" />{template.name} {saved ? '· Saved' : '· Unsaved'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!saved && (
            <button onClick={save}
              className="px-3 py-1.5 text-xs bg-[var(--colors-primary)] text-white rounded-lg hover:bg-[var(--colors-primary-hover)] flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          )}
          <PublishToggle slug={slug} invitation={invitation} />
        </div>
      </div>

      {/* Body: Left sidebar form + right preview */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Form editor — scroll independent */}
        <div className="w-[420px] min-w-[420px] max-h-full overflow-y-auto border-r border-zinc-200 bg-white p-5 space-y-8">
          <SectionLabel icon={<Sparkles />} label="Tamu" />
          <GuestNameForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Heart />} label="Pasangan" />
          <CoupleForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Calendar />} label="Acara & Waktu" />
          <EventForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Star />} label="Kutipan" />
          <QuoteForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Clock />} label="Cerita" />
          <StoriesForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<MapPin />} label="Jadwal Acara" />
          <ScheduleForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Image />} label="Galeri Foto" />
          <GalleryForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Gift />} label="Kado Digital" />
          <GiftForm content={content} setContent={set} />

          <hr className="border-zinc-100" />
          <SectionLabel icon={<Music />} label="Musik" />
          <MusicForm content={content} setContent={set} />

          <div className="py-4 text-center text-[10px] text-zinc-300 uppercase tracking-widest">— End of form —</div>
        </div>

        {/* Right: Mobile preview */}
        <div className="flex-1 bg-zinc-100 flex items-start justify-center p-6 overflow-auto">
          <div className="w-[393px] bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[700px]">
            <div className="bg-dark text-white text-[9px] text-center py-1.5 uppercase tracking-widest font-medium bg-gradient-to-r from-[#3D2C2A] to-[#4A3530]">
              <Smartphone className="w-3 h-3 inline mr-1 -mt-0.5" />
              {template.name}
            </div>
            <div className="max-h-[780px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <TemplateRenderer template={template} content={content} slug={slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
      <span className="text-[var(--colors-primary)]">{icon}</span>
      {label}
    </div>
  );
}

/* ─── Input helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Inp({ value, onChange, placeholder = "", multiline = false, rows = 2 }: {
  value?: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean; rows?: number;
}) {
  const cls = "w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-[var(--colors-primary)] focus:ring-1 focus:ring-[var(--colors-primary)] transition-shadow bg-zinc-50/50";
  if (multiline) return <textarea className={`${cls} resize-none`} rows={rows} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
  return <input className={cls} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} />;
}

/* ─── Upload Button ─── */
function UploadBtn({ onUploaded, label = 'Upload' }: { onUploaded: (url: string) => void; label?: string }) {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) return;
      const data = await res.json();
      onUploaded(data.url);
    } catch {}
    setLoading(false);
    e.target.value = '';
  };
  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handle} />
      <button type="button" onClick={() => ref.current?.click()} disabled={loading}
        className="text-[10px] text-[var(--colors-primary)] hover:underline flex items-center gap-1">
        <Upload className="w-3 h-3" /> {loading ? '...' : label}
      </button>
    </>
  );
}

/* ─── Guest Name Form ─── */
function GuestNameForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Nama Tamu (Kepada Yth.)">
        <Inp value={content.guestName || ''} onChange={v => setContent({ guestName: v })} placeholder="Bpk/Ibu/Sdr. ..." />
      </Field>
      <p className="text-[9px] text-zinc-400 leading-relaxed">Tampil di cover undangan. Bisa juga pakai <code className="text-[var(--colors-primary)] bg-zinc-100 px-1 py-0.5 rounded">?to=</code> di URL publik.</p>
    </div>
  );
}

/* ─── Couple Form ─── */
function CoupleForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const c = content.couple;
  const set = (k: string, v: string) => setContent({ couple: { ...c, [k]: v } });
  const media = content.media || {};
  const setMedia = (k: string, v: string) => setContent({ media: { ...media, [k]: v } });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mempelai 1"><Inp value={c.partner1} onChange={v => set('partner1', v)} placeholder="Raka" /></Field>
        <Field label="Mempelai 2"><Inp value={c.partner2} onChange={v => set('partner2', v)} placeholder="Dewi" /></Field>
        <Field label="Title 1"><Inp value={c.partner1Title || ''} onChange={v => set('partner1Title', v)} placeholder="Raka Pramana" /></Field>
        <Field label="Title 2"><Inp value={c.partner2Title || ''} onChange={v => set('partner2Title', v)} placeholder="Dewi Ayu" /></Field>
        <Field label="Ayah 1"><Inp value={c.partner1Father || ''} onChange={v => set('partner1Father', v)} placeholder="Bpk. Wayan" /></Field>
        <Field label="Ayah 2"><Inp value={c.partner2Father || ''} onChange={v => set('partner2Father', v)} placeholder="Bpk. Ketut" /></Field>
        <Field label="Ibu 1"><Inp value={c.partner1Mother || ''} onChange={v => set('partner1Mother', v)} placeholder="Ibu Putu" /></Field>
        <Field label="Ibu 2"><Inp value={c.partner2Mother || ''} onChange={v => set('partner2Mother', v)} placeholder="Ibu Made" /></Field>
        <Field label="Instagram 1"><Inp value={c.partner1Instagram || ''} onChange={v => set('partner1Instagram', v)} placeholder="@rakapramana" /></Field>
        <Field label="Instagram 2"><Inp value={c.partner2Instagram || ''} onChange={v => set('partner2Instagram', v)} placeholder="@dewiayusaras" /></Field>
        <Field label="Bio 1"><Inp value={c.partner1Desc || ''} onChange={v => set('partner1Desc', v)} placeholder="Bio singkat..." multiline rows={2} /></Field>
        <Field label="Bio 2"><Inp value={c.partner2Desc || ''} onChange={v => set('partner2Desc', v)} placeholder="Bio singkat..." multiline rows={2} /></Field>
      </div>
      <div className="space-y-2 pt-2 border-t border-zinc-100">
        <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Foto Pasangan</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Foto Mempelai 1">
            <div className="flex items-center gap-2">
              <Inp value={media.partner1Photo || ''} onChange={v => setMedia('partner1Photo', v)} placeholder="URL foto pria" />
              <UploadBtn onUploaded={url => setMedia('partner1Photo', url)} />
            </div>
          </Field>
          <Field label="Foto Mempelai 2">
            <div className="flex items-center gap-2">
              <Inp value={media.partner2Photo || ''} onChange={v => setMedia('partner2Photo', v)} placeholder="URL foto wanita" />
              <UploadBtn onUploaded={url => setMedia('partner2Photo', url)} />
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}

/* ─── Event Form ─── */
function EventForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const ev = content.event || {} as InvitationContent['event'];
  const set = (k: string, v: string) => setContent({ event: { ...ev, [k]: v } });
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Tanggal"><Inp value={ev.date} onChange={v => set('date', v)} placeholder="2027-05-15T09:00:00" /></Field>
      <Field label="Waktu"><Inp value={ev.time} onChange={v => set('time', v)} placeholder="09:00 - 11:00 WITA" /></Field>
      <Field label="Tempat (col)"><Inp value={ev.location} onChange={v => set('location', v)} placeholder="Puri Agung Saraswati" /></Field>
      <Field label="Alamat (col)"><Inp value={ev.address} onChange={v => set('address', v)} placeholder="Jl. Raya Ubud, Bali" /></Field>
      <Field label="Maps URL (col)"><Inp value={ev.mapsUrl || ''} onChange={v => set('mapsUrl', v)} placeholder="https://maps.google.com/..." /></Field>
    </div>
  );
}

/* ─── Quote Form ─── */
function QuoteForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const q = content.quote || {} as InvitationContent['quote'];
  return (
    <div className="space-y-3">
      <Field label="Teks Kutipan (col)"><Inp value={q.text || ''} onChange={v => setContent({ quote: { ...q, text: v } })} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." multiline rows={3} /></Field>
      <Field label="Sumber"><Inp value={q.source || ''} onChange={v => setContent({ quote: { ...q, source: v } })} placeholder="QS. Ar-Rum: 21" /></Field>
    </div>
  );
}

/* ─── Stories Form ─── */
function StoriesForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const stories = content.stories || [];
  const setStories = (list: StoryMoment[]) => setContent({ stories: list });
  const add = () => setStories([...stories, { year: '', title: '', desc: '' }]);
  const del = (i: number) => setStories(stories.filter((_, idx) => idx !== i));
  const upd = (i: number, k: keyof StoryMoment, v: string) => {
    const s = [...stories]; s[i] = { ...s[i], [k]: v }; setStories(s);
  };
  return (
    <div className="space-y-4">
      {stories.map((s, i) => (
        <div key={i} className="p-3 bg-zinc-50 rounded-xl space-y-2 relative border border-zinc-100">
          <button onClick={() => del(i)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-400 text-sm">&times;</button>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Tahun"><Inp value={s.year} onChange={v => upd(i, 'year', v)} placeholder="2022" /></Field>
            <Field label="Judul (col)"><Inp value={s.title} onChange={v => upd(i, 'title', v)} placeholder="Awal Pertemuan" /></Field>
          </div>
          <Field label="Cerita"><Inp value={s.desc} onChange={v => upd(i, 'desc', v)} placeholder="Cerita singkat..." multiline rows={2} /></Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 text-xs text-[var(--colors-primary)] border border-dashed border-[var(--colors-primary)]/30 rounded-xl hover:bg-[var(--colors-primary)]/5 transition-colors">+ Tambah Cerita</button>
    </div>
  );
}

/* ─── Schedule Form ─── */
function ScheduleForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const sch = content.schedule || { title: '', items: [] };
  const items = sch.items || [];
  const setItems = (list: ScheduleItem[]) => setContent({ schedule: { ...sch, items: list } });
  const add = () => setItems([...items, { time: '', title: '', venue: '', address: '', mapsUrl: '' }]);
  const del = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const upd = (i: number, k: keyof ScheduleItem, v: string) => {
    const s = [...items]; s[i] = { ...s[i], [k]: v }; setItems(s);
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="p-3 bg-zinc-50 rounded-xl space-y-2 relative border border-zinc-100">
          <button onClick={() => del(i)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-400 text-sm">&times;</button>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Judul"><Inp value={item.title} onChange={v => upd(i, 'title', v)} placeholder="Akad Nikah" /></Field>
            <Field label="Waktu"><Inp value={item.time} onChange={v => upd(i, 'time', v)} placeholder="09:00 - 11:00" /></Field>
            <Field label="Tempat (col)"><Inp value={item.venue || ''} onChange={v => upd(i, 'venue', v)} placeholder="Puri Agung" /></Field>
            <Field label="Alamat (col)"><Inp value={item.address || ''} onChange={v => upd(i, 'address', v)} placeholder="Jl. ..." /></Field>
          </div>
          <Field label="Maps URL (col)"><Inp value={item.mapsUrl || ''} onChange={v => upd(i, 'mapsUrl', v)} placeholder="https://maps.google.com/..." /></Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 text-xs text-[var(--colors-primary)] border border-dashed border-[var(--colors-primary)]/30 rounded-xl hover:bg-[var(--colors-primary)]/5 transition-colors">+ Tambah Jadwal Acara</button>
    </div>
  );
}

/* ─── Gallery Form ─── */
function GalleryForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const gallery = content.gallery || { images: [] };
  const images = gallery.images || [];
  const add = () => setContent({ gallery: { ...gallery, images: [...images, 'https://images.unsplash.com/photo-'] } });
  const del = (i: number) => setContent({ gallery: { ...gallery, images: images.filter((_, idx) => idx !== i) } });
  const upd = (i: number, v: string) => {
    const imgs = [...images]; imgs[i] = v; setContent({ gallery: { ...gallery, images: imgs } });
  };
  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <div key={i} className="flex items-center gap-2">
          <Inp value={img} onChange={v => upd(i, v)} placeholder="https://images.unsplash.com/photo-..." />
          <UploadBtn onUploaded={url => upd(i, url)} label="" />
          <button onClick={() => del(i)} className="text-zinc-300 hover:text-red-400 text-sm px-1">&times;</button>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 text-xs text-[var(--colors-primary)] border border-dashed border-[var(--colors-primary)]/30 rounded-xl hover:bg-[var(--colors-primary)]/5 transition-colors">+ Tambah URL Gambar</button>
    </div>
  );
}

/* ─── Gift Form ─── */
function GiftForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const gift = content.gift || { items: [] };
  const items = gift.items || [];
  const add = () => setContent({ gift: { ...gift, items: [...items, { name: '', bank: '', number: '', owner: '' }] } });
  const del = (i: number) => setContent({ gift: { ...gift, items: items.filter((_, idx) => idx !== i) } });
  const upd = (i: number, k: string, v: string) => {
    const s: any[] = [...items]; s[i] = { ...s[i], [k]: v }; setContent({ gift: { ...gift, items: s } });
  };
  return (
    <div className="space-y-3">
      {items.map((g, i) => (
        <div key={i} className="p-3 bg-zinc-50 rounded-xl space-y-2 relative border border-zinc-100">
          <button onClick={() => del(i)} className="absolute top-2 right-2 text-zinc-300 hover:text-red-400 text-sm">&times;</button>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Bank"><Inp value={g.bank || ''} onChange={v => upd(i, 'bank', v)} placeholder="BCA" /></Field>
            <Field label="No. Rek"><Inp value={g.number || ''} onChange={v => upd(i, 'number', v)} placeholder="1234567890" /></Field>
            <Field label="A/N (col)"><Inp value={g.owner || ''} onChange={v => upd(i, 'owner', v)} placeholder="Raka Pramana" /></Field>
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 text-xs text-[var(--colors-primary)] border border-dashed border-[var(--colors-primary)]/30 rounded-xl hover:bg-[var(--colors-primary)]/5 transition-colors">+ Tambah Rekening</button>
    </div>
  );
}

/* ─── Music Form ─── */
function MusicForm({ content, setContent }: { content: InvitationContent; setContent: (p: Partial<InvitationContent>) => void }) {
  const m = content.music || { src: '' };
  return (
    <Field label="URL Audio"><Inp value={m.src || ''} onChange={v => setContent({ music: { ...m, src: v } })} placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" /></Field>
  );
}

/* ─── Publish Toggle ─── */
function PublishToggle({ slug, invitation }: { slug: string; invitation: { published?: boolean } }) {
  const [pub, setPub] = useState(invitation.published ?? false);
  const [copied, setCopied] = useState(false);
  const { update } = useStudioStore();

  const toggle = async () => {
    const next = !pub;
    setPub(next);
    await update(slug, { published: next });
  };

  const url = `${window.location.origin}/invitation/${slug}`;
  const copyLink = () => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex items-center gap-2">
      {pub && (
        <button onClick={copyLink} className="px-2.5 py-1.5 text-[10px] bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center gap-1">
          {copied ? '✓ Copied' : <><Globe className="w-3 h-3" /> Copy Link</>}
        </button>
      )}
      <button onClick={toggle}
        className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all flex items-center gap-1.5 ${
          pub ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
        }`}>
        {pub ? 'Published' : 'Draft'}
      </button>
    </div>
  );
}
