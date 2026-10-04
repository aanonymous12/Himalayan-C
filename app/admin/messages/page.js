import AutoRefresh from '@/components/AutoRefresh';
import { requireAdmin } from '@/lib/auth';
import { setMessageHandled, setFeedbackResolved } from '../actions';
import { when, dateLong, telHref, stars } from '@/lib/format';

export default async function Inbox() {
  const { sb } = await requireAdmin();
  const [{ data: m }, { data: f }] = await Promise.all([
    sb.from('messages').select('*').order('handled').order('created_at', { ascending: false }).limit(100),
    sb.from('feedback').select('*').order('resolved').order('created_at', { ascending: false }).limit(100),
  ]);
  const messages = m ?? [], feedback = f ?? [];
  return (
    <>
      <AutoRefresh seconds={60} />
      <h1 style={{ marginBottom: '1.5rem' }}>Inbox</h1>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '.75rem' }}>Messages and catering requests</h2>
      {!messages.length && <p className="muted">Nothing yet.</p>}
      {messages.map((x) => (
        <div className="order" key={x.id} style={{ opacity: x.handled ? .6 : 1 }}>
          <div className="order-top"><b>{x.name} <span className="badge">{x.kind === 'catering' ? 'Catering' : 'Message'}</span></b><span className="muted">{when(x.created_at)}</span></div>
          <div className="muted">{x.phone && <a href={telHref(x.phone)}>{x.phone}</a>} {x.email && <>&nbsp;<a href={`mailto:${x.email}`}>{x.email}</a></>}</div>
          {x.kind === 'catering' && <p style={{ margin: '.5rem 0 0' }}><b>{x.event_date && dateLong(x.event_date)}</b> &nbsp; {x.guests} guests</p>}
          <p style={{ margin: '.5rem 0 .75rem', whiteSpace: 'pre-wrap' }}>{x.message}</p>
          <form action={setMessageHandled}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="handled" value={String(x.handled)} />
            <button className="btn sm line">{x.handled ? 'Reopen' : 'Mark handled'}</button></form>
        </div>
      ))}
      <h2 style={{ fontSize: '1.4rem', margin: '2.5rem 0 .75rem' }}>Private feedback</h2>
      {!feedback.length && <p className="muted">Nothing yet. Feedback from the /review page lands here.</p>}
      {feedback.map((x) => (
        <div className="order" key={x.id} style={{ opacity: x.resolved ? .6 : 1 }}>
          <div className="order-top"><b>{x.name || 'Anonymous'} {x.rating && <span className="stars">{stars(x.rating)}</span>}</b><span className="muted">{when(x.created_at)}</span></div>
          {x.email && <div className="muted"><a href={`mailto:${x.email}`}>{x.email}</a></div>}
          <p style={{ margin: '.5rem 0 .75rem', whiteSpace: 'pre-wrap' }}>{x.message}</p>
          <form action={setFeedbackResolved}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="resolved" value={String(x.resolved)} />
            <button className="btn sm line">{x.resolved ? 'Reopen' : 'Mark resolved'}</button></form>
        </div>
      ))}
    </>
  );
}
