'use server';
import { run } from '@/lib/action';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/settings';
import { sendEmail, esc } from '@/lib/email';
import { todayISO, nowHHMM, timeSlots, timeLabel, dateLong, closedDays } from '@/lib/format';

const clean = (v, n = 200) => String(v ?? '').trim().slice(0, n);
const okEmail = (e) => /^\S+@\S+\.\S+$/.test(e);
const isBot = (fd) => !!clean(fd.get('website')); // hidden honeypot field
const row = (k, v) => (v ? `<p><b>${k}:</b> ${esc(v)}</p>` : '');

export async function submitContact(a, b) {
  return run(a, b, async (fd) => {
    if (isBot(fd)) return { ok: true, message: 'Thank you.' };
    const name = clean(fd.get('name'), 80), email = clean(fd.get('email'), 120), phone = clean(fd.get('phone'), 30), message = clean(fd.get('message'), 2000);
    if (!name) throw new Error('Please enter your name.');
    if (!okEmail(email)) throw new Error('Please enter a valid email address.');
    if (message.length < 5) throw new Error('Please write a short message.');
    const { error } = await createAdminClient().from('messages').insert({ kind: 'contact', name, email, phone: phone || null, message });
    if (error) throw new Error('We could not send your message. Please call us instead.');
    const s = await getSettings();
    await sendEmail({ to: s.email, subject: `Website message from ${name}`, html: row('Name', name) + row('Email', email) + row('Phone', phone) + row('Message', message) });
    return { ok: true, message: 'Thank you. We have your message and will reply soon.' };
  });
}

export async function submitCatering(a, b) {
  return run(a, b, async (fd) => {
    if (isBot(fd)) return { ok: true, message: 'Thank you.' };
    const s = await getSettings();
    if (!s.catering_enabled) throw new Error('Catering requests are paused. Please call us.');
    const name = clean(fd.get('name'), 80), email = clean(fd.get('email'), 120), phone = clean(fd.get('phone'), 30), message = clean(fd.get('message'), 2000);
    const guests = parseInt(fd.get('guests'), 10), date = clean(fd.get('event_date'), 10);
    if (!name) throw new Error('Please enter your name.');
    if (phone.replace(/\D/g, '').length < 10) throw new Error('Please enter a phone number with area code.');
    if (email && !okEmail(email)) throw new Error('That email address does not look right.');
    if (!(guests >= 5 && guests <= 1000)) throw new Error('Please tell us how many guests (5 or more).');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO()) throw new Error('Please choose a future event date.');
    if (message.length < 5) throw new Error('Please tell us a little about the event and what you would like.');
    const { error } = await createAdminClient().from('messages').insert({ kind: 'catering', name, email: email || null, phone, event_date: date, guests, message });
    if (error) throw new Error('We could not send your request. Please call us instead.');
    await sendEmail({ to: s.email, subject: `Catering request from ${name}`, html: row('Name', name) + row('Phone', phone) + row('Email', email) + row('Date', dateLong(date)) + row('Guests', String(guests)) + row('Details', message) });
    return { ok: true, message: 'Thank you. We will call you within one business day with a quote.' };
  });
}

export async function submitFeedback(a, b) {
  return run(a, b, async (fd) => {
    if (isBot(fd)) return { ok: true, message: 'Thank you.' };
    const message = clean(fd.get('message'), 1500), name = clean(fd.get('name'), 80), email = clean(fd.get('email'), 120);
    const rating = parseInt(fd.get('rating'), 10);
    if (message.length < 3) throw new Error('Please tell us a little more.');
    if (email && !okEmail(email)) throw new Error('That email address does not look right.');
    const { error } = await createAdminClient().from('feedback').insert({ rating: rating >= 1 && rating <= 5 ? rating : null, name: name || null, email: email || null, message });
    if (error) throw new Error('We could not save your feedback. Please call us.');
    const s = await getSettings();
    await sendEmail({ to: s.email, subject: 'New private feedback', html: row('From', name || 'Anonymous') + row('Email', email) + row('Message', message) });
    return { ok: true, message: 'Thank you for telling us. We take this seriously and will work on it.' };
  });
}

export async function submitBuffetFeedback(a, b) {
  return run(a, b, async (fd) => {
    if (isBot(fd)) return { ok: true, message: 'Thank you.' };
    const rating = parseInt(fd.get('rating'), 10);
    if (!(rating >= 1 && rating <= 5)) throw new Error('Please choose a star rating.');
    const message = clean(fd.get('message'), 1500), name = clean(fd.get('name'), 80), email = clean(fd.get('email'), 120);
    if (email && !okEmail(email)) throw new Error('That email address does not look right.');
    const { error } = await createAdminClient().from('buffet_feedback').insert({ rating, name: name || null, email: email || null, message: message || null });
    if (error) throw new Error('We could not save your feedback right now. Please tell a team member.');
    const s = await getSettings();
    await sendEmail({ to: s.email, subject: `Buffet feedback: ${rating}/5`, html: row('Rating', `${rating} of 5`) + row('From', name || 'Anonymous') + row('Email', email) + row('Message', message) });
    return { ok: true, message: 'Thank you! Your feedback goes straight to our kitchen team.' };
  });
}

export async function submitReservation(a, b) {
  return run(a, b, async (fd) => {
    if (isBot(fd)) return { ok: true, message: 'Thank you.' };
    const s = await getSettings();
    if (!s.reservations_enabled) throw new Error('Online reservations are paused. Please call us.');
    const kind = fd.get('kind') === 'event' ? 'event' : 'table';
    const name = clean(fd.get('name'), 80), phone = clean(fd.get('phone'), 30), email = clean(fd.get('email'), 120);
    const notes = clean(fd.get('notes'), 500), eventType = kind === 'event' ? clean(fd.get('event_type'), 40) : null;
    const size = parseInt(fd.get('party_size'), 10), date = clean(fd.get('date'), 10), time = clean(fd.get('time'), 5);

    if (!name) throw new Error('Please enter your name.');
    if (phone.replace(/\D/g, '').length < 10) throw new Error('Please enter a phone number with area code.');
    if (email && !okEmail(email)) throw new Error('That email address does not look right.');
    if (kind === 'table' ? !(size >= 1 && size <= 12) : !(size >= 10 && size <= 300)) throw new Error(kind === 'table' ? 'Tables are for 1 to 12 guests. For larger groups choose Event.' : 'Events are for 10 to 300 guests.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Please choose a date.');
    if (date < todayISO()) throw new Error('Please choose today or a future date.');
    if (closedDays(s.closed_days).includes(new Date(`${date}T12:00:00`).getDay())) throw new Error('We are closed that day. Please pick another date.');
    if (String(s.closed_dates || '').split(/[\s,;]+/).includes(date)) throw new Error('We are closed on that date. Please pick another date.');
    if (!timeSlots(s.open_time, s.close_time).includes(time)) throw new Error('Please choose one of the available times.');
    if (date === todayISO() && time <= nowHHMM()) throw new Error('That time has already passed today.');

    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    const { data: r, error } = await createAdminClient().from('reservations')
      .insert({ kind, name, phone, email: email || null, party_size: size, res_date: date, res_time: time, event_type: eventType, notes: notes || null, user_id: user?.id ?? null })
      .select('ref').single();
    if (error) throw new Error('We could not save your reservation. Please call us.');

    const summary = `${dateLong(date)} at ${timeLabel(time)} for ${size} ${size === 1 ? 'guest' : 'guests'}`;
    await Promise.all([
      sendEmail({ to: s.email, subject: `New ${kind} reservation #${r.ref}`, html: row('Name', name) + row('Phone', phone) + row('Email', email) + row('When', summary) + row('Event', eventType) + row('Notes', notes) }),
      sendEmail({ to: email, subject: `We received your reservation request (#${r.ref})`, html: `<p>Hi ${esc(name)},</p><p>We received your request for <b>${esc(summary)}</b>. We will confirm by phone or email shortly. Your table is not held until we confirm.</p><p>${esc(s.business_name)}<br>${esc(s.phone)}</p>` }),
    ]);
    return { ok: true, message: `Request #${r.ref} received for ${summary}. We will confirm by phone or email shortly.` };
  });
}
