import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-semibold text-stone-900">404</p>
      <h1 className="mt-2 font-serif text-2xl text-stone-700">Page not found</h1>
      <p className="mt-3 max-w-md text-stone-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
      >
        Back home
      </Link>
    </div>
  );
}
