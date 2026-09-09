// Arama motorlarına sitedeki tüm adresleri veren site haritası.
//
// Hazır bir eklenti yerine elle yazıldı: paket eklemek package-lock.json'ı da
// değiştiriyor, bu da panelden içerik girildiğinde gereksiz çakışma riski
// doğuruyor. Burada adresler zaten sayfaların okuduğu koleksiyonlardan
// üretiliyor, yani yeni ürün ya da blog yazısı eklendiğinde haritaya
// kendiliğinden giriyor.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { gorunenUrunler, yayindakiYazilar } from '../lib/icerik.js';

// Panelden yönetilmeyen, şablonu sabit sayfalar.
const SABIT = [
  '', 'urunler', 'neden-vivostem', 'hakkimizda', 'saglik-profesyonelleri',
  'uzmanlarimiz', 'sss', 'blog', 'etkinlikler', 'iletisim', 'kvkk', 'gizlilik',
];

export const GET: APIRoute = async ({ site }) => {
  const kok = (site ?? new URL('https://vivostem.com')).href.replace(/\/$/, '');

  const urunler = gorunenUrunler(await getCollection('urunler'));
  const yazilar = yayindakiYazilar(await getCollection('blog'));

  const adresler = [
    ...SABIT.map((s) => ({ yol: s, tarih: null as Date | null })),
    ...urunler.map((u) => ({ yol: u.id, tarih: null as Date | null })),
    ...yazilar.map((y) => ({ yol: 'blog/' + y.id, tarih: y.data.tarih as Date })),
  ];

  const satirlar = adresler.map(({ yol, tarih }) => {
    const adres = yol ? `${kok}/${yol}/` : `${kok}/`;
    const gun = tarih ? `\n    <lastmod>${tarih.toISOString().slice(0, 10)}</lastmod>` : '';
    return `  <url>\n    <loc>${adres}</loc>${gun}\n  </url>`;
  });

  const govde =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    satirlar.join('\n') +
    '\n</urlset>\n';

  return new Response(govde, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
