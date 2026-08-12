import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getInvitation } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Serve a crawler-friendly JPEG for link previews. Uploaded invitation images
 * are stored as WebP for the page, while some WhatsApp crawlers are stricter
 * about the OG image format.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const invitation = getInvitation(slug);
  if (!invitation?.published) return new NextResponse('Not found', { status: 404 });

  const content = invitation.publishedSnapshot?.content || invitation.content;
  const image = content?.ogImage || content?.media?.cover;
  if (typeof image !== 'string' || !image) return new NextResponse('Not found', { status: 404 });

  try {
    const imageUrl = new URL(image, request.url);
    if (imageUrl.protocol !== 'http:' && imageUrl.protocol !== 'https:') {
      return new NextResponse('Unsupported image URL', { status: 415 });
    }

    const response = await fetch(imageUrl, { redirect: 'follow' });
    if (!response.ok) return new NextResponse('Image not found', { status: 404 });

    const input = Buffer.from(await response.arrayBuffer());
    const output = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 86, progressive: true })
      .toBuffer();

    return new NextResponse(output, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return new NextResponse('Unable to render image', { status: 404 });
  }
}
