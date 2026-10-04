# Progress log: Himalayan Nepalese & Indian Cuisine

## Revision 6: single-page site, admin-only login, promo codes, business card
- **Navigation** (all anchors on the home page): Home, About Us, Menu, Gallery, Reservation, Testimonial, Contact Us, plus an Order Now button.
- **Home page sections**: About (text and image only), Menu (dishes the admin ticks "Show on the home page menu", with Add to cart; "See full menu" opens `/menu`), Gallery, Reservation (tabs for table reservation and catering), Testimonials, Contact (form, details, map), proper footer.
- **No customer accounts**: no signup, no customer login, guest checkout only. Old `/login`, `/account`, `/about` etc. redirect so old links never break.
- **Admin login lives at `/admin`** and nothing links to it (also not listed in robots.txt). One sign-in screen: admins see the dashboard, anyone else is turned away. The public nav never shows an admin item.
- **Admins cannot order** (blocked in the cart, at checkout and again on the server).
- **Promo codes** (Dashboard > Promo codes): percent or dollar discounts, minimum order, start and expiry dates, total uses allowed, uses per customer (by phone), on/off switch, usage and money given shown per code. Validated on the server twice (preview and when the order is placed, including a last-second recount).
- **Spice level, add-ons and special instructions** per dish: customers get a Customize dialog. Prices are always recalculated on the server.
- **Reservations**: admin can add phone bookings, edit or reschedule any reservation and email the guest; closed days plus specific closed dates and opening hours in Settings.
- **Dashboard**: pick a date range (presets or custom). Total sales with comparison to the previous period, orders, average order, discounts, tax, sales by day chart, best-selling items, busiest hours, promo usage, latest orders, and a CSV download. Orders page has the same range picker, status filter and search.
- **Business card** at `/connect` (also `/Connect`): cover photo, logo, name, tagline, intro, Save contact (.vcf), Share, order / reserve / call / directions / review buttons, social links, contact rows. Everything editable in Dashboard > Business card.
- Tested here: pricing, promo rules, date ranges and sales statistics (unit tests), every route, and the generated HTML. Not tested against a live Supabase project.


**Stack (one framework):** Next.js 15 (App Router, React 19) on Vercel, Supabase (Postgres, Auth, Storage). No online payment: customers pay at the restaurant.

## Revision 5: polish, login and dashboard
- **Login fixed**: the password box rejected anything under 6 characters, so short passwords could never log in. Login now accepts any password. One login page for everyone; admins land on the dashboard, customers on their account. Added forgot-password, reset-password and change-password.
- **Admin dashboard rebuilt** with its own layout (sidebar, top bar, mobile menu), separate from the public header and footer.
- **Menu fully customizable**: add, edit, delete, duplicate and reorder (up / down) categories and dishes, photos, options, dietary tags, sold out, popular.
- **Cart**: slide-over cart with quantity controls and remove, plus a floating "View order" bar.
- **Navigation**: Home, Menu, About Us, Gallery, Reviews, Reservations, Contact Us and an Order Now button. Hamburger menu below 1240px.
- **Flat design**: removed the mountain illustration, shadows and hover lifts. Hero can use an admin-uploaded video or photo, otherwise it is plain dark brown.
- Light theme only (no automatic dark mode) so colors stay consistent.

## Revision 4: full restaurant website (this version)

### The crash when adding menu items (fixed)
Vercel hides real errors behind "Application error". Three things in the old admin could trigger it:
1. A validation problem (for example a dish saved without a price) was thrown as an error, which crashes the page.
2. Photos were sent through the server. Vercel rejects request bodies over about 4.5 MB, and phone photos are bigger.
3. Any database error was thrown the same way.

Now every admin and public form returns a readable message next to the form (`lib/action.js`), photos and videos upload straight from the browser to Supabase Storage after being resized (`components/admin/MediaUpload.jsx`), and `app/error.js` shows a proper page with a reference code if anything unexpected still happens.

### Public website (multi-page, like a standard restaurant site)
| Page | What it has |
|---|---|
| Home | Hero with admin-controlled video, hours / address / phone bar, story, signature dishes, ways to order, guest reviews, gallery, map, call to action |
| Menu | Sticky category navigation, dish cards with photos, vegetarian and dietary tags, Popular tag, sold-out state, add to cart |
| Order online | Pickup, catering, walk-in, optional DoorDash link, how it works |
| Checkout | Guest checkout or log in, pickup time, notes, pay at the restaurant, confirmation page |
| Reservations | Table (1 to 12) or event (10 to 300), validated against your opening hours and closed days |
| Catering | Quote request form |
| Gallery | Photos and videos with category filter and lightbox |
| About | Story, philosophy, values, experience |
| Reviews | Guest reviews with average rating, Google review button |
| Review (`/review`) | NFC / QR page: happy guests go to Google, unhappy guests send private feedback |
| Journal (`/blog`) | Articles managed from admin |
| Contact | Address, phone, email, hours, map, contact form, social links |
| Account | Login, past orders |

Also: breadcrumbs with schema, Restaurant and aggregate rating schema, canonical URLs, sitemap, robots, 404 page, honeypot spam protection on all forms, optional email alerts and confirmations.

### Admin (`/admin`)
Dashboard (sales, best sellers, items needing attention), Orders, Reservations (confirm / decline, emails the guest), Inbox (messages, catering requests, private feedback), Menu (categories, dishes, photos, options, tags), Gallery, Reviews, Journal, Settings (hero text and video, hours, closed days, tax, links, toggles for orders / reservations / catering).

## Setup changes
- Database: run `supabase/schema.sql`. It is safe to run on a new project or on top of an older version (it only adds what is missing and keeps all data).
- Optional emails: add `RESEND_API_KEY` and `EMAIL_FROM` in Vercel (see `.env.example`), and put your email in Admin > Settings.
- Put your Google review link in Admin > Settings, then point NFC tags and table QR codes at `yourdomain.com/review`.

## Assumptions to confirm
- Butter and garlic naan prices are placeholders ($2.49, $2.99).
- Tax defaults to 8.25%. Reservation times use the opening and closing times in Settings.
- No fake reviews are included. Add real ones in Admin > Reviews.
- Dishes without a photo show a neutral placeholder tile until you upload one.

## Not built (out of scope or needs your accounts)
Online card payments (by design), loyalty program, Instagram live feed (needs Meta API access; links are supported), custom domain email, ad management, buffet polls (no buffet on the current menu).
