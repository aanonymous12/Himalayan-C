import { money } from '@/lib/format';

const nice = (v) => { const p = 10 ** Math.floor(Math.log10(v || 1)); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
const short = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${Math.round(n)}`);
const label = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Column chart of sales per day. Drawn as plain SVG so it needs no chart library.
export default function SalesChart({ data }) {
  const W = 880, H = 260, L = 52, B = 30, T = 12;
  const top = nice(Math.max(...data.map((d) => d.total), 1));
  const bw = (W - L) / data.length, ch = H - B - T;
  const every = Math.ceil(data.length / 10);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Sales by day" className="chart">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = T + ch - (ch * i) / 4;
        return <g key={i}><line x1={L} x2={W} y1={y} y2={y} stroke="#e3d9d1" /><text x={L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#6b5b50">{short((top * i) / 4)}</text></g>;
      })}
      {data.map((d, i) => {
        const h = (d.total / top) * ch, x = L + i * bw + bw * 0.15;
        return (
          <g key={d.day}>
            <rect x={x} y={T + ch - h} width={Math.max(2, bw * 0.7)} height={h} rx="3" fill="#9a4f26"><title>{`${label(d.day)}: ${money(d.total)} from ${d.orders} ${d.orders === 1 ? 'order' : 'orders'}`}</title></rect>
            {i % every === 0 && <text x={x + bw * 0.35} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b5b50">{label(d.day)}</text>}
          </g>
        );
      })}
    </svg>
  );
}
