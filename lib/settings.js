import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

const fallback = {
  business_name: 'Himalayan Nepalese & Indian Cuisine',
  phone: '(512) 748-0104', email: '',
  address: '115 Wonder World Drive\nSan Marcos, TX 78666',
  hours: 'Monday to Saturday: 12:00 PM to 9:00 PM\nSunday: Closed',
  open_time: '12:00', close_time: '21:00', closed_days: '0',
  story: '', philosophy: '',
  hero_title: 'Himalayan flavors, made from scratch.',
  hero_subtitle: 'Nepali and Indian cooking in San Marcos.',
  hero_video_url: null, hero_image_url: null, about_image_url: null,
  instagram_url: '', facebook_url: '', google_review_url: '', doordash_url: '',
  announcement: '', closed_dates: '', connect: {}, tax_rate: 0.0825,
  accepting_orders: true, reservations_enabled: true, catering_enabled: true,
};

export const getSettings = cache(async () => {
  try {
    const sb = await createClient();
    const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
    return { ...fallback, ...(data || {}) };
  } catch {
    return fallback;
  }
});
