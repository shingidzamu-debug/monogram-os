import Script from 'next/script';
import { markup } from './legacy.generated';

// The studio app still runs as the hand-written single-file UI from
// index.html. Views move into React components here one at a time.
export default function Home() {
  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />
      <Script src="/legacy/app.js" strategy="afterInteractive" />
    </>
  );
}
