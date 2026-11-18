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

function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false, emailRedirectTo: location.origin },
    });
    setBusy(false);
    if (!error) return setSent(true);
    setError(/sign ?ups? not allowed|not found|not allowed/i.test(error.message)
      ? 'This email hasn’t been invited yet. Ask the studio owner to add you.'
      : error.message);
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Brand />
        {sent ? (
          <>
            <h1>Check your email</h1>
            <p className="auth-note">We sent a sign-in link to <b>{email}</b>. Open it on this device to get into the studio.</p>
            <button className="btn" onClick={() => setSent(false)}>Use a different email</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1>Sign in</h1>
            <p className="auth-note">Enter your email and we’ll send you a link. No password needed.</p>
            <div className="field">
              <label htmlFor="authEmail">Email</label>
              <input id="authEmail" type="email" autoComplete="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="you@themonogram.club" />
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="btn dark auth-submit" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
          </form>
        )}
      </div>
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
