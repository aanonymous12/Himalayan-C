# Himalayan Nepalese & Indian Cuisine: website

Next.js + Supabase + Vercel. See `progress.md` for what is built and what is next.

## Setup (about 15 minutes)

1. **Supabase**: create a project. In *SQL Editor*, run `supabase/schema.sql`, then `supabase/seed.sql`. (Already ran an older version? Run `supabase/migrations/002_hero_video.sql` instead.)
2. **Auth settings**: *Authentication > Providers > Email*. For simple customer sign-up, turn off "Confirm email" (or keep it on and customers confirm by email). Under *URL Configuration*, set Site URL to your live domain.
3. **Keys**: copy `.env.example` to `.env.local` and fill in the URL, anon key and service role key (*Project Settings > API*). The service role key is secret: never prefix it with `NEXT_PUBLIC_`.
4. **Run locally**: `npm install` then `npm run dev`, open http://localhost:3000.
5. **Make yourself admin**: sign up on the site, then run this in the SQL Editor:
   ```sql
   update profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   Log in again and an **Admin** link appears in the header.
6. **Deploy**: push to GitHub, import the repo in Vercel, add the same four environment variables, deploy. Put your real domain in `NEXT_PUBLIC_SITE_URL`.
7. **Optional emails**: create a free Resend account, verify your domain, then add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel and your email in Admin > Settings.
8. **Homepage video** (optional): Admin > Settings > Home page. Use an MP4 or WebM, 10 to 20 seconds, 1080p, under 15 MB (Supabase free tier allows files up to 50 MB).
9. **Test**: place a guest order, place a logged-in order, and watch both appear in Admin > Orders and the dashboard.
