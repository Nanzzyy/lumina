/**
 * Sample invitation Document — the first product rendered through the OS publish
 * path (ADR-001 hierarchy). Hand-authored fixture; no DB coupling yet.
 *
 * Shape mirrors bench/golden-project.ts. Literal props keep the ResolveContext
 * minimal; one `$token:` ref exercises Resolution step 5.
 *
 * ponytail: replace with a DB-backed Document loader (projects/pages/frames) so
 * invitations are data-driven, not hardcoded.
 */

import { genId } from '@core/id';
import type { Document, Frame, Page } from '@core/document';

export const SAMPLE_SLUG = 'golden';

export function buildSampleInvitation(): Document {
  const nodes = [
    {
      id: genId('n'),
      name: 'Background',
      componentId: 'rectangle',
      frame: { x: 0, y: 0, w: 390, h: 844 },
      props: { backgroundColor: '#15121f' },
    },
    {
      id: genId('n'),
      name: 'Cover Photo',
      componentId: 'image',
      frame: { x: 0, y: 0, w: 390, h: 460 },
      props: {
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
        opacity: 0.55,
      },
    },
    {
      id: genId('n'),
      name: 'Heading',
      componentId: 'text',
      frame: { x: 24, y: 210, w: 342, h: 90 },
      props: {
        title: 'Ananda & Maya',
        color: '#ffffff',
        fontSize: '34px',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
      },
    },
    {
      id: genId('n'),
      name: 'Date',
      componentId: 'text',
      frame: { x: 24, y: 308, w: 342, h: 40 },
      props: {
        text: 'Sabtu, 12 September 2026',
        color: '#e5d8f2',
        fontSize: '14px',
        textAlign: 'center',
      },
    },
    {
      id: genId('n'),
      name: 'Countdown',
      componentId: 'countdown',
      frame: { x: 45, y: 372, w: 300, h: 90 },
      // $token:color-primary resolves via Theme cascade (step 5) → #db2777.
      props: { date: '2026-09-12T08:00:00', color: '$token:color-primary' },
    },
    {
      id: genId('n'),
      name: 'Open Button',
      componentId: 'button',
      frame: { x: 95, y: 720, w: 200, h: 52 },
      props: {
        title: 'Buka Undangan',
        backgroundColor: '$token:color-primary',
        color: '#ffffff',
        borderRadius: '9999px',
        fontSize: '15px',
        textAlign: 'center',
      },
    },
  ];

  const frame: Frame = {
    id: genId('f'),
    pageId: 'pg',
    name: 'Mobile Cover',
    viewport: { w: 390, h: 844, device: 'mobile' },
    nodes,
    ordinal: 0,
  };

  const page: Page = {
    id: 'pg',
    projectId: 'p',
    name: 'Cover',
    route: '/',
    ordinal: 0,
    frames: [frame],
  };

  return {
    schemaVersion: 1,
    workspace: { id: 'ws', schemaVersion: 1, name: 'Sample', variables: [], dataSources: [] },
    project: {
      id: 'p',
      schemaVersion: 1,
      workspaceId: 'ws',
      name: 'Sample Invitation',
      slug: SAMPLE_SLUG,
      status: 'published',
      pages: [page],
      variables: [],
      dataSources: [],
    },
  };
}
