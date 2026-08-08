// Blog ve etkinlik verilerini biçimlendiren yardımcılar.
// Sayfaların hepsi buradan okuyor ki kural tek yerde dursun.

export const KATEGORILER = [
  'Klinik kanıt',
  'Uygulama protokolü',
  'Ürün karşılaştırma',
  'Ortopedi',
  'Estetik',
  'Saç restorasyonu',
  'Veteriner',
  'Mevzuat ve kalite',
];

export const TUR_ADI = {
  webinar: 'Online webinar',
  egitim: 'Yüz yüze eğitim',
  kongre: 'Kongre ve fuar',
};

const AYLAR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export function tarihYaz(d) {
  return `${d.getUTCDate()} ${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// "12 - 14 Mart 2027" gibi, aynı ay ve yıldaysa tekrar etmeden.
export function araligiYaz(bas, bit) {
  if (!bit) return tarihYaz(bas);
  const ayniAy = bas.getUTCMonth() === bit.getUTCMonth() && bas.getUTCFullYear() === bit.getUTCFullYear();
  if (ayniAy) return `${bas.getUTCDate()} - ${tarihYaz(bit)}`;
  return `${tarihYaz(bas)} - ${tarihYaz(bit)}`;
}

// ISO tarih, <time datetime> ve JS tarafındaki karşılaştırma için.
export function isoYaz(d) {
  return d.toISOString().slice(0, 10);
}

// Ortalama okuma hızı dakikada 200 kelime.
export function okumaSuresi(metin) {
  const kelime = (metin || '').trim().split(/\s+/).length;
  return Math.max(1, Math.round(kelime / 200));
}

// Taslakları ayıklar, yeniden eskiye sıralar.
export function yayindakiYazilar(hepsi) {
  return hepsi
    .filter((y) => !y.data.taslak)
    .sort((a, b) => b.data.tarih - a.data.tarih);
}

// Etkinlikleri tarihe göre artan sırada verir (taslaklar hariç).
export function yayindakiEtkinlikler(hepsi) {
  return hepsi
    .filter((e) => !e.data.taslak)
    .sort((a, b) => a.data.baslangic - b.data.baslangic);
}

// Etkinliğin bittiği an: bitiş varsa o, yoksa başlangıç gününün sonu.
export function bitisAni(e) {
  const d = new Date(e.data.bitis ?? e.data.baslangic);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

// Uzmanları sıra numarasına göre verir, gizli olanları eler.
export function gorunenUzmanlar(hepsi) {
  return hepsi.filter((u) => !u.data.gizli).sort((a, b) => a.data.sira - b.data.sira);
}

// SSS'yi gruplara ayırır. Grup sırası, sonra soru sırası geçerli.
export function sssGruplari(hepsi) {
  const acik = hepsi.filter((s) => !s.data.gizli);
  const adlar = [...new Set(acik.map((s) => s.data.grup))].sort(
    (a, b) =>
      Math.min(...acik.filter((s) => s.data.grup === a).map((s) => s.data.grupSirasi)) -
      Math.min(...acik.filter((s) => s.data.grup === b).map((s) => s.data.grupSirasi))
  );
  return adlar.map((ad) => ({
    ad,
    sorular: acik.filter((s) => s.data.grup === ad).sort((a, b) => a.data.sira - b.data.sira),
  }));
}

// Kategori kimliğinden görünen adı bulur. Kategori silinmişse kimliği
// gösterir ki yazı kaybolmasın.
export function kategoriAdiCozucu(kategoriler) {
  const harita = new Map(kategoriler.map((k) => [k.id, k.data.ad]));
  return (kimlik) => harita.get(kimlik) ?? kimlik;
}

// Ürünleri sıraya dizer, gizli olanları eler.
export function gorunenUrunler(hepsi) {
  return hepsi.filter((u) => !u.data.gizli).sort((a, b) => a.data.sira - b.data.sira);
}

// Menüdeki adı: menuAdi doluysa o, değilse ürün adı.
export function urunMenuAdi(urun) {
  return urun.data.menuAdi || urun.data.ad;
}

// Üst menüdeki açılır kutunun sütunları: aile > o ailenin ürünleri.
export function urunSutunlari(aileler, urunler) {
  return aileler
    .filter((a) => !a.data.gizli)
    .sort((a, b) => a.data.sira - b.data.sira)
    .map((a) => ({
      baslik: a.data.ad,
      linkler: gorunenUrunler(urunler)
        .filter((u) => u.data.aile === a.id)
        .map((u) => ({ ad: urunMenuAdi(u), href: '/' + u.id })),
    }))
    .filter((s) => s.linkler.length > 0);
}

// Neden Vivostem başlıklarını sıraya dizer, gizli olanları eler.
export function gorunenNedenler(hepsi) {
  return hepsi.filter((n) => !n.data.gizli).sort((a, b) => a.data.sira - b.data.sira);
}

// Madde numarası: 01, 02, ...
export function ikiHane(n) {
  return String(n).padStart(2, '0');
}

// Metindeki {{adres}}, {{eposta}} gibi yer tutucuları site bilgileriyle
// doldurur. Hukuki metinlerde iletişim bilgisi tekrar yazılmasın diye.
export function yerTutuculariDoldur(metin, ayarlar) {
  return (metin ?? '').replace(/\{\{(\w+)\}\}/g, (tam, ad) => ayarlar[ad] ?? tam);
}
