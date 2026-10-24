// Helpers shared by the blog pages: reading time, headings, and a small, safe text-to-HTML renderer.
export const SITE_NAME = 'Himalayan Nepalese & Indian Cuisine';
export const site = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const abs = (u) => (!u ? null : /^https?:\/\//.test(u) ? u : `${site()}${u.startsWith('/') ? '' : '/'}${u}`);

export const wordCount = (text = '') => (text.match(/\S+/g) || []).length;
export const readingMinutes = (text = '') => Math.max(1, Math.round(wordCount(text) / 200));
export const plain = (text = '') => text.replace(/^#{2,3}\s+/gm, '').replace(/^[-*>]\s+/gm, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\[(.+?)\]\(.+?\)/g, '$1').replace(/\s+/g, ' ').trim();
export const description = (p) => (p.seo_description || p.excerpt || plain(p.body).slice(0, 157) + '...').slice(0, 200);
export const slugId = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Blocks: "## " heading, "### " subheading, lines starting "- " list, "> " quote, otherwise a paragraph.
export function parse(body = '') {
  return body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((b) => {
    if (b.startsWith('### ')) return { type: 'h3', text: b.slice(4) };
    if (b.startsWith('## ')) return { type: 'h2', text: b.slice(3), id: slugId(b.slice(3)) };
    if (b.split('\n').every((l) => /^[-*]\s+/.test(l))) return { type: 'ul', items: b.split('\n').map((l) => l.replace(/^[-*]\s+/, '')) };
    if (b.split('\n').every((l) => /^\d+[.)]\s+/.test(l))) return { type: 'ol', items: b.split('\n').map((l) => l.replace(/^\d+[.)]\s+/, '')) };
    if (b.startsWith('> ')) return { type: 'quote', text: b.replace(/^>\s?/gm, '') };
    return { type: 'p', text: b };
  });
}
export const headings = (body) => parse(body).filter((b) => b.type === 'h2');

// Question and answer pairs from a "Frequently asked questions" section: "### Question" followed by the answer text.
export function faqs(body = '') {
  const blocks = parse(body), out = [];
  let inFaq = false;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'h2') { inFaq = /frequently asked|faq/i.test(b.text); continue; }
    if (!inFaq || b.type !== 'h3') continue;
    const answer = [];
    for (let j = i + 1; j < blocks.length && !['h2', 'h3'].includes(blocks[j].type); j++) answer.push(plain(blocks[j].text || (blocks[j].items || []).join(' ')));
    if (answer.length) out.push({ q: b.text, a: answer.join(' ') });
  }
  return out;
}
