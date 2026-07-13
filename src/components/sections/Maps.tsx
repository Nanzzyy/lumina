'use client';

import { motion } from 'framer-motion';
import type { SectionComponentProps } from '@/lib/template';
import { Container, SectionTitle, Button, Icon } from '@/components/primitives';
import { cn } from '@/lib/utils/cn';

/**
 * Convert any maps URL or address to a Google Maps embed URL.
 * Falls back to search query if no valid format is found.
 */
function toGoogleMapsEmbed(input?: string, location?: string, address?: string): string {
  // Already a Google Maps embed URL
  if (input?.includes('google.com/maps') && input?.includes('output=embed')) return input;

  // Google Maps place URL → convert to embed
  if (input?.includes('google.com/maps')) {
    try {
      const u = new URL(input);
      const q = u.searchParams.get('q') || u.pathname.replace(/^\/maps\/place\//, '').replace(/\/.*$/, '');
      if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    } catch (_) { /* fall through */ }
  }

  // Try OpenStreetMap URL → extract coordinates
  if (input?.includes('openstreetmap.org') || input?.includes('openstreetmap.com')) {
    const match = input.match(new RegExp('#map=\\d+/([\\d.]+)/([\\d.]+)'));
    if (match) {
      return `https://maps.google.com/maps?q=${match[1]},${match[2]}&output=embed`;
    }
  }

  // Try as direct coordinates
  if (input && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(input)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
  }

  // Fallback: use location + address as search query
  const query = [location, address].filter(Boolean).join(', ');
  if (query) return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  // Last resort: use whatever was provided
  if (input) return `https://maps.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;

  // Empty
  return '';
}

export function Maps(props: SectionComponentProps) {
  const { content, variant } = props;
  const { location, address, mapsUrl } = content.event;
  const isNoir = variant === 'noir';
  const embedUrl = toGoogleMapsEmbed(mapsUrl, location, address);

  const openMaps = () => {
    // Open Google Maps in a new tab (desktop or search)
    let url = mapsUrl;
    if (!url || url.includes('openstreetmap')) {
      const query = encodeURIComponent([location, address].filter(Boolean).join(', '));
      url = `https://www.google.com/maps/search/${query}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container>
      <SectionTitle title="Location" subtitle={location} accent />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto"
      >
        {/* Google Maps embed preview — works in all browsers */}
        <div className={cn(
          'aspect-[16/9] overflow-hidden mb-6',
          isNoir ? 'border border-[var(--colors-border)]' : 'rounded-[var(--radius-lg)] border border-[var(--colors-border-light)] shadow-sm',
        )}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${location || address || 'venue'}`}
              className="w-full h-full"
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center',
              isNoir ? 'bg-[var(--colors-surface)]' : 'bg-gradient-to-br from-[var(--colors-primary-light)] to-[var(--colors-secondary)]/20',
            )}>
              <div className="text-center">
                <Icon name="map-pin" size={48} className={cn(
                  'mx-auto mb-3',
                  isNoir ? 'text-[var(--colors-primary)]' : 'text-[var(--colors-secondary)]',
                )} />
                <p className="text-sm text-[var(--colors-text-muted)]">Enter location address to show map</p>
              </div>
            </div>
          )}
        </div>

        {/* Location details */}
        <div className="text-center space-y-2">
          <p className="text-[var(--colors-text)] font-medium">{location}</p>
          <p className="text-sm text-[var(--colors-text-secondary)]">{address}</p>
          <Button
            variant={isNoir ? 'outline' : 'primary'}
            size="sm"
            onClick={openMaps}
            className="mt-4"
          >
            <Icon name="map-pin" size={14} className="mr-2" />
            Buka di Google Maps
          </Button>
        </div>
      </motion.div>
    </Container>
  );
}
