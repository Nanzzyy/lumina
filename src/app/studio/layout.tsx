import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { StudioShell } from './studio-shell';

/**
 * Server-side auth gate for the studio. The edge proxy also redirects
 * unauthenticated traffic, but the JWT is verified here so a proxy bypass does
 * not expose the studio UI.
 */
export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('lumina_session')?.value;
  if (!verifySessionToken(token)) redirect('/login');
  return <StudioShell>{children}</StudioShell>;
}
