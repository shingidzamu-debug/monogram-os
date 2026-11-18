import { title, links, css } from './legacy.generated';

export const metadata = { title };

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {links.map(({ rel, href, ...rest }) => (
          <link key={href} rel={rel} href={href} {...rest} />
        ))}
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
