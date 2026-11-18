import { markup } from './legacy.generated';
import Studio from './studio';

// The studio app still runs as the hand-written single-file UI from
// index.html; <Studio> signs the user in, syncs their data with Supabase and
// then mounts it. Views move into React components here one at a time.
export default function Home() {
  return <Studio markup={markup} />;
}
