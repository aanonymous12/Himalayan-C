import { redirect } from 'next/navigation';

// Moved: this content now lives on the home page.
export const metadata = { robots: { index: false } };
export default function Page() {
  redirect('/#testimonials');
}
