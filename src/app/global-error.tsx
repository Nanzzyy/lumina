'use client';

// Catches errors thrown in the root layout itself — must render its own <html>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#292524',
          textAlign: 'center',
          padding: '0 1rem',
        }}
      >
        <p style={{ letterSpacing: '0.3em', fontSize: '0.75rem', textTransform: 'uppercase', color: '#d97706' }}>
          Application error
        </p>
        <h1 style={{ fontSize: '1.875rem', margin: '1rem 0 0.5rem' }}>Something broke</h1>
        <p style={{ color: '#78716c', maxWidth: '28rem' }}>
          A critical error occurred. Please reload the page.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '2rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#1c1917',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
