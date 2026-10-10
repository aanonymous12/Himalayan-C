import Icon from './Icon';
import { platformOf } from '@/lib/socials';

// Brand glyph for a platform key. Falls back to a plain "link" icon.
export default function SocialIcon({ name, size = 24 }) {
  const p = platformOf(name);
  if (!p.path) return <Icon name="external" size={size} />;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={p.path} /></svg>;
}
