import { useEffect, type RefObject } from 'react';

/**
 * Autoplay background music on page open. Browsers block audio before a user
 * gesture, so: try immediately on mount; if the browser rejects (no gesture
 * yet), start on the first interaction anywhere (click / touch / keydown /
 * scroll). Integrates with each template's own isPlaying state so the music
 * button stays in sync and acts as a mute/unmute toggle.
 *
 * Drop-in for the premium monoliths: `useAutoplayMusic(audioRef, setIsPlaying)`.
 */
export function useAutoplayMusic(
  audioRef: RefObject<HTMLAudioElement | null>,
  setIsPlaying: (v: boolean) => void,
) {
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const start = () => {
      a.muted = false;
      a.play().then(() => setIsPlaying(true)).catch(() => {});
    };
    const onGesture = () => {
      start();
      document.removeEventListener('click', onGesture);
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('scroll', onGesture);
    };
    const attach = () => {
      document.addEventListener('click', onGesture);
      document.addEventListener('touchstart', onGesture);
      document.addEventListener('keydown', onGesture);
      document.addEventListener('scroll', onGesture);
    };
    const detach = () => {
      document.removeEventListener('click', onGesture);
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('scroll', onGesture);
    };

    // Try autoplay; if blocked, wait for the first user gesture.
    a.play().then(() => setIsPlaying(true)).catch(() => { attach(); });
    return detach;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
