import Link from 'next/link';
import { PRESETS } from '@/lib/range';

// Quick ranges plus a custom from / to. Plain links and a GET form, so it works without any scripting.
export default function RangePicker({ r, path = '/admin', extra = {} }) {
  const keep = new URLSearchParams(Object.entries(extra).filter(([, v]) => v)).toString();
  const href = (k) => `${path}?range=${k}${keep ? `&${keep}` : ''}`;
  return (
    <div className="range">
      <div className="range-chips">
        {PRESETS.map(([k, l]) => <Link key={k} className="chip" aria-pressed={r.preset === k} href={href(k)}>{l}</Link>)}
      </div>
      <form action={path} method="get" className="range-form">
        {Object.entries(extra).filter(([, v]) => v).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        <label className="sr">From</label><input type="date" name="from" defaultValue={r.from} required />
        <span>to</span>
        <label className="sr">To</label><input type="date" name="to" defaultValue={r.to} required />
        <button className="btn sm">Apply</button>
      </form>
    </div>
  );
}
