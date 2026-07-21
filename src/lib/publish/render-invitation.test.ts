import { describe, it, expect } from 'vitest';
import { renderInvitationHtml, SAMPLE_SLUG } from './render-invitation';

describe('renderInvitationHtml', () => {
  it('renders the sample invitation through the OS publish circuit', () => {
    const out = renderInvitationHtml(SAMPLE_SLUG);
    expect(out).not.toBeNull();
    const html = out!.html;

    // Heading text rendered (content is HTML-escaped by the adapter)
    expect(html).toContain('Ananda &amp; Maya');
    // Cover image node → <img src="...">
    expect(html).toContain('photo-1519741497674-611481863552');
    // Countdown node flagged for runtime hydration
    expect(html).toContain('data-lumina-hydrate');
    // Button node uses the button class + label
    expect(html).toContain('lumina-button');
    expect(html).toContain('Buka Undangan');
    // $token:color-primary resolved through the theme cascade → #db2777
    expect(html).toContain('#db2777');
    // Frame-driven absolute positioning emitted
    expect(html).toContain('position: absolute');
    // Runtime bundle requested (countdown needs hydration)
    expect(out!.needsRuntime).toBe(true);
  });

  it('returns null for an unknown slug', () => {
    expect(renderInvitationHtml('does-not-exist')).toBeNull();
  });
});
