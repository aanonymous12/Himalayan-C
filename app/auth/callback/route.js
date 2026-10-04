import { NextResponse } from 'next/server';

// Customer accounts were removed, so there is nothing to confirm here any more.
export async function GET(request) {
  return NextResponse.redirect(new URL('/', request.url));
}
