# Himalayan Nepalese & Indian Cuisine: website

Next.js + Supabase + Vercel. See `progress.md` for everything that is built.

## Setup
1. **Supabase**: create a project. In *SQL Editor* run `supabase/schema.sql` (safe to run again at any time, it only adds what is missing), then `supabase/seed.sql` for the starting menu. Optional: `supabase/optional_spice_levels.sql` turns on spice levels for the curries, momo and biryani.
2. **Turn off public sign-ups**: *Authentication > Sign In / Providers > Email* and switch **off** "Allow new users to sign up". Customers never need an account, and this keeps strangers from creating one.
3. **Keys**: copy `.env.example` to `.env.local` (and add the same four values in Vercel): project URL, anon key, service role key (*Project Settings > API*), and `NEXT_PUBLIC_SITE_URL`. The service role key is secret.
4. **Make your admin account**: in *Authentication > Users* click *Add user*, enter an email and a strong password, tick *Auto Confirm User*. Then run in the SQL Editor:
   ```sql
   update profiles set is_admin = true where id = (select id from auth.users where email = 'you@example.com');
   ```
5. **Deploy** on Vercel (import the GitHub repository, add the environment variables).
6. **Log in**: go to `your-domain.com/admin` and sign in. That address is not linked anywhere on the website. If someone who is not an admin signs in there, they are turned away.

## Good to know
- Customers order as guests and pay at the restaurant. There are no customer accounts.
- A signed-in admin cannot place orders (this keeps test orders out of your sales).
- `/connect` is the business-card page for NFC cards and QR codes. Edit it in *Dashboard > Business card*.
- Optional emails: create a Resend account and add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel.
