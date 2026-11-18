'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { supabase } from './supabase';
import './auth.css';

// Keys the single-file app (index.html) reads and writes.
const DB_KEY = 'monogram-db';
const DISC_KEY = 'monogram-disc';
const OWNER_KEY = 'monogram-owner';

const readLocal = key => {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};
const writeLocal = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};
const clearLocal = () => [DB_KEY, DISC_KEY, OWNER_KEY].forEach(k => writeLocal(k, null));

// Pull the account's studio into localStorage before the app boots. If the
// account has nothing yet, keep what this browser has (only if it belongs to
// this account or to nobody) so the first sign-in uploads existing work.
async function pull(user) {
  const { data, error } = await supabase
    .from('studio_state')
    .select('db, discovery, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  const owner = readLocal(OWNER_KEY);
  if (data) {
    writeLocal(DB_KEY, data.db);
    writeLocal(DISC_KEY, data.discovery || {});
  } else if (owner && owner !== user.id) {
    clearLocal();
  }
  writeLocal(OWNER_KEY, user.id);
  return data ? Date.parse(data.updated_at) : 0;
}

async function push(user) {
  const db = readLocal(DB_KEY);
  if (!db) return null;
  const updated_at = new Date().toISOString();
  const { error } = await supabase.from('studio_state').upsert({
    user_id: user.id,
    db,
    discovery: readLocal(DISC_KEY) || {},
    updated_at,
  });
  if (error) throw error;
  return Date.parse(updated_at);
}

export default function Studio({ markup }) {
  const [state, setState] = useState('checking'); // checking | signedOut | loading | ready | error
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    let startedFor = null;
    const start = async session => {
      if (!alive) return;
      if (!session) { setUser(null); setState('signedOut'); return; }
      if (startedFor === session.user.id) return;
      startedFor = session.user.id;
      // The email link signs in through the URL fragment; the app uses the
      // fragment for routing, so drop the tokens once the session exists.
      if (location.hash.includes('access_token')) history.replaceState(null, '', location.pathname);
      setUser(session.user);
      setState('loading');
      try {
        window.__monogramSynced = await pull(session.user);
        if (alive) setState('ready');
      } catch (e) {
        if (alive) { setError(e.message || String(e)); setState('error'); }
      }
    };
    supabase.auth.getSession().then(({ data }) => start(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') start(session);
      if (event === 'SIGNED_OUT') { setUser(null); setState('signedOut'); }
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'ready') return <Synced user={user} markup={markup} />;
  if (state === 'signedOut') return <SignIn />;
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Brand />
        {state === 'error' ? (
          <>
            <h1>Couldn’t load your studio</h1>
            <p className="auth-note">{error}</p>
            <button className="btn dark" onClick={() => location.reload()}>Try again</button>
          </>
        ) : (
          <p className="auth-note">Loading your studio…</p>
        )}
      </div>
    </main>
  );
}

// Renders the app and keeps the account in step with it: every save in the
// app is pushed (debounced), and newer data from another device is pulled
// when the tab comes back into view.
function Synced({ user, markup }) {
  const timer = useRef(null);
  const pending = useRef(false);

  useEffect(() => {
    const flush = async () => {
      clearTimeout(timer.current);
      if (!pending.current) return;
      pending.current = false;
      try {
        window.__monogramSynced = await push(user);
      } catch {
        pending.current = true;
        window.toast?.('Couldn’t sync — changes are kept on this device and will retry');
      }
    };
    const onSaved = () => {
      pending.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 800);
    };
    const onVisible = async () => {
      if (document.visibilityState === 'hidden') return flush();
      if (pending.current) return flush();
      const { data } = await supabase.from('studio_state').select('updated_at').eq('user_id', user.id).maybeSingle();
      if (data && Date.parse(data.updated_at) > (window.__monogramSynced || 0)) {
        window.__monogramSynced = await pull(user);
        window.monogramReload?.();
      }
    };

    window.monogramUser = user.email;
    window.monogramSignOut = async () => {
      await flush();
      await supabase.auth.signOut();
      clearLocal();
      location.replace('/');
    };
    window.addEventListener('monogram:saved', onSaved);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('monogram:saved', onSaved);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pagehide', flush);
    };
  }, [user]);

  return (
    <>
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: markup }} />
      <Script
        src="/legacy/app.js"
        strategy="afterInteractive"
        // First sign-in on an account with nothing saved yet: upload what
        // this browser has (or the sample studio) straight away.
        onLoad={() => { if (!window.__monogramSynced) window.dispatchEvent(new Event('monogram:saved')); }}
      />
    </>
  );
}

// Errors come back from Supabase in the URL after a Google sign-in or an
// expired email link. Read them once, then clean the address bar.
function takeUrlError() {
  const params = new URLSearchParams(location.hash.slice(1) || location.search.slice(1));
  const code = params.get('error_code') || '';
  const desc = params.get('error_description') || params.get('error') || '';
  if (!code && !desc) return '';
  history.replaceState(null, '', location.pathname);
  return friendly(code + ' ' + desc);
}

function friendly(message) {
  if (/sign ?ups? (are )?not allowed|signup_disabled|user not found|not allowed for otp/i.test(message))
    return 'This account hasn’t been invited yet. Ask the studio owner to add your email.';
  if (/expired|otp_expired|invalid/i.test(message))
    return 'That sign-in link has expired or was already used. Request a new one below.';
  if (/rate limit|only request this after/i.test(message))
    return 'Too many sign-in emails in a short time. Wait a few minutes, then try again.';
  if (/provider is not enabled|unsupported provider/i.test(message))
    return 'Google sign-in isn’t switched on yet. Use your email for now.';
  return message.trim();
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { setError(takeUrlError()); }, []);

  const withGoogle = async () => {
    setBusy('google');
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin, queryParams: { prompt: 'select_account' } },
    });
    if (error) { setBusy(''); setError(friendly(error.message)); }
  };

  const withEmail = async e => {
    e.preventDefault();
    setBusy('email');
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: location.origin },
    });
    setBusy('');
    if (error) setError(friendly(error.message));
    else setSent(true);
  };

  return (
    <main className="auth-split">
      <section className="auth-panel">
        <Brand />
        {sent ? (
          <div className="auth-body">
            <h1>Check your email</h1>
            <p className="auth-note">
              We sent a sign-in link to <b>{email}</b>. Open it in this browser to get into the
              studio. Each link works once.
            </p>
            <button className="btn auth-wide" onClick={() => setSent(false)}>Use a different email</button>
          </div>
        ) : (
          <div className="auth-body">
            <h1>Welcome back</h1>
            <p className="auth-note">Sign in to the Monogram Club studio.</p>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn auth-wide auth-google" onClick={withGoogle} disabled={!!busy}>
              <GoogleMark />
              {busy === 'google' ? 'Opening Google…' : 'Continue with Google'}
            </button>
            <div className="auth-or"><span>or use your email</span></div>
            <form onSubmit={withEmail}>
              <div className="field">
                <label htmlFor="authEmail">Email</label>
                <input id="authEmail" type="email" autoComplete="email" required value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@themonogram.club" />
              </div>
              <button className="btn dark auth-wide" disabled={!!busy}>
                {busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
              </button>
            </form>
          </div>
        )}
        <p className="auth-foot">Access is by invitation. Ask the studio owner to add your email.</p>
      </section>
      <aside className="auth-art" aria-hidden="true">
        <div className="auth-art-copy">
          <span>Monogram OS</span>
          <p>Discovery, strategy and the Brand Hub — the studio, in one place.</p>
        </div>
      </aside>
    </main>
  );
}

function Brand() {
  return (
    <div className="brand auth-brand">
      <div className="brand-mark">M</div>
      <div className="brand-text">MONOGRAM <span>OS</span></div>
    </div>
  );
}

// Google's standard "G" mark, as required next to "Continue with Google".
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
