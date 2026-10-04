// Up and down arrows that change the order on the public menu.
export default function MoveButtons({ action, id }) {
  return (
    <span className="move">
      {['up', 'down'].map((d) => (
        <form key={d} action={action}>
          <input type="hidden" name="id" value={id} /><input type="hidden" name="dir" value={d} />
          <button className="icon-btn sm" aria-label={`Move ${d}`} title={`Move ${d}`}>{d === 'up' ? '\u2191' : '\u2193'}</button>
        </form>
      ))}
    </span>
  );
}
