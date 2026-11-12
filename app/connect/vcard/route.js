// Old address, kept so links and QR codes already printed keep working. Sends people to the .vcf address,
// which iPhone needs (it decides by the file ending).
export function GET(req) {
  return Response.redirect(new URL('/connect/contact.vcf', req.url), 307);
}
