import { parse } from '@/lib/blog';

// **bold** and [text](https://link) inside a line. Everything else is plain text, so nothing can inject markup.
function Inline({ text }) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
    else {
      const ext = /^https?:/.test(m[3]);
      out.push(<a key={k++} href={m[3]} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[2]}</a>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Prose({ body }) {
  return parse(body).map((b, i) => {
    if (b.type === 'h2') return <h2 id={b.id} key={i}>{b.text}</h2>;
    if (b.type === 'h3') return <h3 key={i}>{b.text}</h3>;
    if (b.type === 'ul') return <ul key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ul>;
    if (b.type === 'ol') return <ol key={i}>{b.items.map((t, j) => <li key={j}><Inline text={t} /></li>)}</ol>;
    if (b.type === 'quote') return <blockquote key={i}><Inline text={b.text} /></blockquote>;
    return <p key={i}><Inline text={b.text} /></p>;
  });
}
