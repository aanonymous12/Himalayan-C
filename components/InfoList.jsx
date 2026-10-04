import Icon from './Icon';
import { telHref } from '@/lib/format';

export default function InfoList({ s }) {
  return (
    <div>
      <div className="info-item"><span className="icon-badge"><Icon name="pin" size={22} /></span><div><h3>Address</h3><p>{s.address}</p></div></div>
      <div className="info-item"><span className="icon-badge"><Icon name="clock" size={22} /></span><div><h3>Opening hours</h3><p>{s.hours}</p></div></div>
      <div className="info-item"><span className="icon-badge"><Icon name="phone" size={22} /></span><div><h3>Phone</h3><p><a href={telHref(s.phone)}>{s.phone}</a></p></div></div>
      {s.email && <div className="info-item"><span className="icon-badge"><Icon name="mail" size={22} /></span><div><h3>Email</h3><p><a href={`mailto:${s.email}`}>{s.email}</a></p></div></div>}
    </div>
  );
}

export function MapEmbed({ s }) {
  const q = encodeURIComponent(s.address.replace(/\n/g, ', '));
  return <iframe className="map" title="Map to the restaurant" loading="lazy" src={`https://www.google.com/maps?q=${q}&output=embed`} />;
}
export const directionsUrl = (s) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(s.address.replace(/\n/g, ', '))}`;
