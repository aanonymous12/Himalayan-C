'use server';
import { revalidatePath } from 'next/cache';
import { run } from '@/lib/action';
import { requireAdmin } from '@/lib/auth';
import { sendEmail, esc } from '@/lib/email';
import { getSettings } from '@/lib/settings';
import { STATUSES, RES_STATUSES, slugify, dateLong, timeLabel } from '@/lib/format';

// Every action returns { ok } or { error }. Nothing here throws to the page, so a typo or a
// database hiccup shows a message next to the form instead of crashing the site.
const done = () => revalidatePath('/', 'layout');
const t = (fd, k, n = 2000) => String(fd.get(k) ?? '').trim().slice(0, n);
const on = (fd, k) => fd.get(k) === 'on';
const must = (r, msg) => { if (r.error) throw new Error(msg || r.error.message); return r; };

// "Chicken | 14.99" per line -> [{label, price}]
function parseOptions(text) {
  return String(text || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, price] = l.split('|').map((x) => x.trim());
    const p = Number(String(price).replace('$', ''));
    if (!label || !(p >= 0)) throw new Error(`Option "${l}" should look like: Chicken | 14.99`);
    return { label, price: p };
  });
}

export async function setStatus(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const status = t(fd, 'status');
    if (!STATUSES.includes(status)) throw new Error('Unknown status.');
    must(await sb.from('orders').update({ status }).eq('id', t(fd, 'id')));
    revalidatePath('/admin', 'layout');
    return { ok: true };
  });
}

export async function saveCategory(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const name = t(fd, 'name', 60);
    if (!name) throw new Error('Please enter a category name.');
    const row = { name, description: t(fd, 'description', 200) || null, sort_order: Number(fd.get('sort_order')) || 0 };
    const id = t(fd, 'id');
    if (id) must(await sb.from('menu_categories').update({ ...row, visible: on(fd, 'visible') }).eq('id', id));
    else {
      const r = await sb.from('menu_categories').insert({ ...row, slug: slugify(name), visible: true });
      if (r.error?.code === '23505') throw new Error('A category with that name already exists.');
      must(r);
    }
    done();
    return { ok: true, message: id ? 'Category saved.' : 'Category added.' };
  });
}

export async function deleteCategory(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    must(await sb.from('menu_categories').delete().eq('id', t(fd, 'id')));
    done();
    return { ok: true };
  });
}

export async function saveItem(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const name = t(fd, 'name', 80);
    if (!name) throw new Error('Please enter the dish name.');
    if (!t(fd, 'category_id')) throw new Error('Please choose a category. Add a category first if the list is empty.');
    const options = parseOptions(fd.get('options'));
    const priceText = t(fd, 'price', 12);
    const price = priceText === '' ? NaN : Number(priceText);
    if (!options.length && !(price >= 0)) throw new Error('Add a price, or at least one option such as: Chicken | 14.99');
    const image = t(fd, 'image_url', 600);
    if (image && !/^https?:\/\//.test(image)) throw new Error('The photo link must start with https://');

    const row = {
      category_id: t(fd, 'category_id'), name, description: t(fd, 'description', 400) || null,
      price: options.length ? null : price, options, image_url: image || null,
      tags: t(fd, 'tags', 200).split(',').map((x) => x.trim()).filter(Boolean).slice(0, 6),
      vegetarian: on(fd, 'vegetarian'), featured: on(fd, 'featured'), available: on(fd, 'available'),
      sort_order: Number(fd.get('sort_order')) || 0,
    };
    const id = t(fd, 'id');
    must(id ? await sb.from('menu_items').update(row).eq('id', id) : await sb.from('menu_items').insert(row));
    done();
    return { ok: true, message: id ? 'Dish saved.' : `${name} added to the menu.` };
  });
}

export async function deleteItem(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    must(await sb.from('menu_items').delete().eq('id', t(fd, 'id')));
    done();
    return { ok: true };
  });
}

export async function toggleAvailable(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    must(await sb.from('menu_items').update({ available: t(fd, 'available') !== 'true' }).eq('id', t(fd, 'id')));
    done();
    return { ok: true };
  });
}

export async function saveSettings(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const pct = Number(fd.get('tax_percent'));
    const url = (k) => { const v = t(fd, k, 600); if (v && !/^https?:\/\//.test(v)) throw new Error('Links must start with https://'); return v; };
    must(await sb.from('settings').update({
      business_name: t(fd, 'business_name', 100) || 'Himalayan Nepalese & Indian Cuisine',
      phone: t(fd, 'phone', 30), email: t(fd, 'email', 120), address: t(fd, 'address', 200), hours: t(fd, 'hours', 300),
      open_time: t(fd, 'open_time', 5) || '12:00', close_time: t(fd, 'close_time', 5) || '21:00',
      closed_days: fd.getAll('closed').join(','),
      story: t(fd, 'story', 1500), philosophy: t(fd, 'philosophy', 800), about_image_url: url('about_image_url') || null,
      hero_title: t(fd, 'hero_title', 80) || 'Himalayan flavors, made from scratch.', hero_subtitle: t(fd, 'hero_subtitle', 120),
      hero_video_url: url('hero_video_url') || null,
      instagram_url: url('instagram_url'), facebook_url: url('facebook_url'), google_review_url: url('google_review_url'), doordash_url: url('doordash_url'),
      announcement: t(fd, 'announcement', 160), tax_rate: Number.isNaN(pct) ? 0.0825 : pct / 100,
      accepting_orders: on(fd, 'accepting_orders'), reservations_enabled: on(fd, 'reservations_enabled'), catering_enabled: on(fd, 'catering_enabled'),
    }).eq('id', 1));
    done();
    return { ok: true, message: 'Settings saved. The website is updated.' };
  });
}

export async function saveReview(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const author = t(fd, 'author', 60), body = t(fd, 'body', 700), rating = parseInt(fd.get('rating'), 10);
    if (!author || body.length < 5) throw new Error('Please add the customer name and what they said.');
    must(await sb.from('reviews').insert({ author, body, rating: rating >= 1 && rating <= 5 ? rating : 5, source: t(fd, 'source', 20) || 'website', published: true }));
    done();
    return { ok: true, message: 'Review added to the website.' };
  });
}
export async function toggleReview(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('reviews').update({ published: t(fd, 'published') !== 'true' }).eq('id', t(fd, 'id'))); done(); return { ok: true }; });
}
export async function deleteReview(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('reviews').delete().eq('id', t(fd, 'id'))); done(); return { ok: true }; });
}

export async function saveGalleryItem(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const url = t(fd, 'url', 600);
    if (!/^https?:\/\//.test(url)) throw new Error('Please upload a photo or video first.');
    const cat = ['food', 'restaurant', 'events'].includes(t(fd, 'category')) ? t(fd, 'category') : 'food';
    must(await sb.from('gallery_items').insert({ url, media_type: t(fd, 'media_type') === 'video' ? 'video' : 'image', category: cat, caption: t(fd, 'caption', 120) || null }));
    done();
    return { ok: true, message: 'Added to the gallery.' };
  });
}
export async function toggleGallery(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('gallery_items').update({ visible: t(fd, 'visible') !== 'true' }).eq('id', t(fd, 'id'))); done(); return { ok: true }; });
}
export async function deleteGalleryItem(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('gallery_items').delete().eq('id', t(fd, 'id'))); done(); return { ok: true }; });
}

export async function savePost(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const title = t(fd, 'title', 120), body = t(fd, 'body', 20000);
    if (!title) throw new Error('Please enter a title.');
    if (!body) throw new Error('Please write the article text.');
    const published = on(fd, 'published'), id = t(fd, 'id');
    const row = { title, excerpt: t(fd, 'excerpt', 300) || null, body, cover_url: t(fd, 'cover_url', 600) || null, published };
    if (published) row.published_at = t(fd, 'published_at') || new Date().toISOString();
    if (id) must(await sb.from('posts').update(row).eq('id', id));
    else {
      let slug = slugify(title) || 'post';
      const { data: clash } = await sb.from('posts').select('id').eq('slug', slug).maybeSingle();
      if (clash) slug += `-${Date.now().toString(36).slice(-4)}`;
      must(await sb.from('posts').insert({ ...row, slug }));
    }
    done();
    return { ok: true, message: published ? 'Published.' : 'Saved as a draft.' };
  });
}
export async function deletePost(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('posts').delete().eq('id', t(fd, 'id'))); done(); return { ok: true }; });
}

export async function setReservationStatus(a, b) {
  return run(a, b, async (fd) => {
    const { sb } = await requireAdmin();
    const status = t(fd, 'status');
    if (!RES_STATUSES.includes(status)) throw new Error('Unknown status.');
    const { data: r, error } = await sb.from('reservations').update({ status }).eq('id', t(fd, 'id')).select('*').single();
    must({ error });
    if (r.email && (status === 'confirmed' || status === 'declined')) {
      const s = await getSettings();
      const when = `${dateLong(r.res_date)} at ${timeLabel(String(r.res_time).slice(0, 5))}`;
      await sendEmail({
        to: r.email,
        subject: status === 'confirmed' ? `Your reservation is confirmed (#${r.ref})` : `About your reservation request (#${r.ref})`,
        html: status === 'confirmed'
          ? `<p>Hi ${esc(r.name)},</p><p>Your table for ${r.party_size} on <b>${esc(when)}</b> is confirmed. We look forward to seeing you.</p><p>${esc(s.business_name)}<br>${esc(s.phone)}</p>`
          : `<p>Hi ${esc(r.name)},</p><p>Sorry, we cannot take your request for ${esc(when)}. Please call ${esc(s.phone)} and we will find another time.</p>`,
      });
    }
    revalidatePath('/admin', 'layout');
    return { ok: true };
  });
}
export async function setMessageHandled(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('messages').update({ handled: t(fd, 'handled') !== 'true' }).eq('id', t(fd, 'id'))); revalidatePath('/admin', 'layout'); return { ok: true }; });
}
export async function setFeedbackResolved(a, b) {
  return run(a, b, async (fd) => { const { sb } = await requireAdmin(); must(await sb.from('feedback').update({ resolved: t(fd, 'resolved') !== 'true' }).eq('id', t(fd, 'id'))); revalidatePath('/admin', 'layout'); return { ok: true }; });
}
