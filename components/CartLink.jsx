'use client';
import { useCart } from './CartProvider';
import Icon from './Icon';

export default function CartLink() {
  const { count, setOpen } = useCart();
  return (
    <button type="button" className="cartlink" onClick={() => setOpen(true)} aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
      <Icon name="bag" size={22} />
      {count > 0 && <span className="cart-count">{count}</span>}
    </button>
  );
}
