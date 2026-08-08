import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog yazıları: src/content/blog altındaki Markdoc dosyaları.
// Dosya adı adresi belirler: prgf-prp-farki.mdoc -> /blog/prgf-prp-farki
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/blog' }),
  schema: z.object({
    baslik: z.string(),
    ozet: z.string(),
    tarih: z.date(),
    kategori: z.string(),
    // Kapak görseli isteğe bağlı. Boş bırakılırsa kartta marka renginde
    // otomatik zemin ve baş harfler çıkar. Panelden yüklenen görseller
    // public/assets/blog altına düşer, buraya /assets/blog/... yazılır.
    kapak: z.string().optional(),
    kapakAlt: z.string().optional(),
    taslak: z.boolean().default(false),
  }),
});

// Etkinlikler: webinar, yüz yüze eğitim ve kongre/fuar katılımı aynı
// koleksiyonda; tür alanı hangisi olduğunu söylüyor.
const etkinlikler = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/etkinlikler' }),
  schema: z.object({
    baslik: z.string(),
    ozet: z.string(),
    tur: z.enum(['webinar', 'egitim', 'kongre']),
    baslangic: z.date(),
    // Kongre ve çok günlü eğitimlerde bitiş tarihi girilir.
    bitis: z.date().optional(),
    // "20:00" gibi. Tüm gün süren etkinliklerde boş bırakılır.
    saat: z.string().optional(),
    // Webinar için "Online", diğerleri için "İstanbul, Vivostem Eğitim Merkezi"
    konum: z.string(),
    konusmaci: z.string().optional(),
    kontenjan: z.string().optional(),
    standNo: z.string().optional(),
    // Dış kayıt adresi verilirse butonu oraya yönlendirir, verilmezse
    // sitedeki eğitim başvuru formuna gider.
    kayitLinki: z.string().url().optional(),
    taslak: z.boolean().default(false),
  }),
});


// Uzman görüşleri: hem ana sayfadaki kaydırakta hem uzmanlarımız sayfasında
// aynı kaynaktan kullanılıyor.
const uzmanlar = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/uzmanlar' }),
  schema: z.object({
    ad: z.string(),
    brans: z.string(),
    gorus: z.string(),
    fotograf: z.string(),
    // Küçük sayı önce görünür.
    sira: z.number().default(99),
    gizli: z.boolean().default(false),
    // Ana sayfadaki kaydırakta görünsün mü? Uzmanlarımız sayfasında hepsi görünür.
    anaSayfada: z.boolean().default(true),
  }),
});


// Sıkça sorulan sorular. Grup adı aynı olan sorular sayfada aynı başlık
// altında toplanıyor; yeni grup açmak için sadece yeni bir grup adı yazmak yeter.
const sss = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/sss' }),
  schema: z.object({
    soru: z.string(),
    cevap: z.string(),
    grup: z.string(),
    grupSirasi: z.number().default(99),
    sira: z.number().default(99),
    // Sayfa açıldığında bu soru açık gelsin mi?
    acikBasla: z.boolean().default(false),
    gizli: z.boolean().default(false),
  }),
});


// Blog kategorileri. Panelden ekleniyor, siliniyor ve sıralanıyor;
// yazı formundaki kategori seçimi bu listeden besleniyor.
const kategoriler = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/kategoriler' }),
  schema: z.object({
    ad: z.string(),
    sira: z.number().default(99),
  }),
});


// Ürün aileleri: üst menüdeki açılır kutunun sütunlarını belirliyor.
// Yeni bir aile eklendiğinde menüde yeni sütun beliriyor.
const urunAileleri = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/urun-aileleri' }),
  schema: z.object({
    ad: z.string(),
    sira: z.number().default(99),
    gizli: z.boolean().default(false),
  }),
});

// Ürün sayfaları. Gövde, sırası panelden değiştirilebilen bloklardan oluşuyor.
const urunBlogu = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('metin'),
    value: z.object({ metin: z.string() }),
  }),
  z.object({
    discriminant: z.literal('etiketler'),
    value: z.object({ etiketler: z.array(z.string()) }),
  }),
  z.object({
    discriminant: z.literal('kutular'),
    value: z.object({
      baslik: z.string().default(''),
      ustBosluk: z.number().default(0),
      kutular: z.array(
        z.object({
          baslik: z.string().default(''),
          metin: z.string().default(''),
          maddeler: z.array(z.string()).default([]),
        })
      ),
    }),
  }),
  z.object({
    discriminant: z.literal('maddeler'),
    value: z.object({
      baslik: z.string().default(''),
      maddeler: z.array(z.string()),
    }),
  }),
  z.object({
    discriminant: z.literal('tablo'),
    value: z.object({
      basliklar: z.array(z.string()),
      satirlar: z.array(z.object({ hucreler: z.array(z.string()) })),
    }),
  }),
  z.object({
    discriminant: z.literal('odul'),
    value: z.object({ metin: z.string() }),
  }),
  z.object({
    discriminant: z.literal('not'),
    value: z.object({
      vurgu: z.string().default(''),
      metin: z.string(),
      ustBosluk: z.number().default(0),
    }),
  }),
]);

const urunler = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/urunler' }),
  schema: z.object({
    ad: z.string(),
    // Menüde farklı görünmesi isteniyorsa doldurulur, boşsa ad kullanılır.
    menuAdi: z.string().default(''),
    ozet: z.string(),
    seoBaslik: z.string(),
    seoAciklama: z.string(),
    gorsel: z.string(),
    gorselAlt: z.string().default(''),
    aile: z.string(),
    sira: z.number().default(99),
    gizli: z.boolean().default(false),
    ctaBaslik: z.string().default(''),
    ctaMetin: z.string().default(''),
    // Sayfanın altındaki kart şeridi. Ürün olmak zorunda değil; "Tüm ürünler"
    // veya SSS gibi sayfalara da bağlanabiliyor.
    ilgiliKartlar: z
      .array(
        z.object({
          baslik: z.string(),
          aciklama: z.string().default(''),
          adres: z.string(),
        })
      )
      .default([]),
    bloklar: z.array(urunBlogu).default([]),
  }),
});


// "Neden Vivostem" başlıkları. Aynı altı madde hem ana sayfadaki
// kaydırakta hem de neden-vivostem sayfasında kullanılıyor.
const nedenler = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/nedenler' }),
  schema: z.object({
    baslik: z.string(),
    // Ana sayfadaki kartta daha kısa bir başlık kullanılabiliyor.
    kartBaslik: z.string(),
    kartOzet: z.string(),
    ikon: z.string(),
    sira: z.number().default(99),
    gizli: z.boolean().default(false),
    notVurgu: z.string().default(''),
    notMetin: z.string().default(''),
    detay: z.string(),
  }),
});

export const collections = { blog, etkinlikler, uzmanlar, sss, kategoriler, urunler, urunAileleri, nedenler };
