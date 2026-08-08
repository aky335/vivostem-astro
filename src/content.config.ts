import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ÖNEMLİ KURAL: zorunluluk denetimi PANELDE yapılır, derleme içerik yüzünden
// asla durmaz.
//
// Keystatic, zorunlu olmayan bir alan boşaltıldığında dosyaya değer yazmak
// yerine null yazıyor. Zod null'u metin saymadığı için derleme hata veriyor ve
// o andan sonra panelden yapılan HİÇBİR değişiklik yayına çıkamıyor. Yani tek
// bir boş hücre bütün yayını kilitliyor. Bu yüzden aşağıdaki yardımcılar
// null'u sessizce varsayılana çeviriyor.
//
// Bir alanın gerçekten dolu olması gerekiyorsa keystatic.config.ts içinde
// validation: { isRequired: true } yazın; kullanıcı uyarıyı orada, kaydetmeden
// önce görür. Doğru yer orası.
const metin = z.string().nullish().transform((d) => d ?? '');
const metinDizisi = z.array(metin).default([]);
const sayi = (varsayilan: number) => z.number().nullish().transform((d) => d ?? varsayilan);
const mantik = (varsayilan: boolean) => z.boolean().nullish().transform((d) => d ?? varsayilan);

// Blog yazıları: src/content/blog altındaki Markdoc dosyaları.
// Dosya adı adresi belirler: prgf-prp-farki.mdoc -> /blog/prgf-prp-farki
const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/blog' }),
  schema: z.object({
    baslik: metin,
    ozet: metin,
    tarih: z.date(),
    kategori: metin,
    // Kapak görseli isteğe bağlı. Boş bırakılırsa kartta marka renginde
    // otomatik zemin ve baş harfler çıkar. Panelden yüklenen görseller
    // public/assets/blog altına düşer, buraya /assets/blog/... yazılır.
    kapak: metin,
    kapakAlt: metin,
    taslak: mantik(false),
  }),
});

// Etkinlikler: webinar, yüz yüze eğitim ve kongre/fuar katılımı aynı
// koleksiyonda; tür alanı hangisi olduğunu söylüyor.
const etkinlikler = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/etkinlikler' }),
  schema: z.object({
    baslik: metin,
    ozet: metin,
    tur: z.enum(['webinar', 'egitim', 'kongre']),
    baslangic: z.date(),
    // Kongre ve çok günlü eğitimlerde bitiş tarihi girilir.
    bitis: z.date().nullish(),
    // "20:00" gibi. Tüm gün süren etkinliklerde boş bırakılır.
    saat: metin,
    // Webinar için "Online", diğerleri için "İstanbul, Vivostem Eğitim Merkezi"
    konum: metin,
    konusmaci: metin,
    kontenjan: metin,
    standNo: metin,
    // Dış kayıt adresi verilirse butonu oraya yönlendirir, verilmezse
    // sitedeki eğitim başvuru formuna gider.
    kayitLinki: metin,
    taslak: mantik(false),
  }),
});


// Uzman görüşleri: hem ana sayfadaki kaydırakta hem uzmanlarımız sayfasında
// aynı kaynaktan kullanılıyor.
const uzmanlar = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/uzmanlar' }),
  schema: z.object({
    ad: metin,
    brans: metin,
    gorus: metin,
    fotograf: metin,
    // Küçük sayı önce görünür.
    sira: sayi(99),
    gizli: mantik(false),
    // Ana sayfadaki kaydırakta görünsün mü? Uzmanlarımız sayfasında hepsi görünür.
    anaSayfada: mantik(true),
  }),
});


// Sıkça sorulan sorular. Grup adı aynı olan sorular sayfada aynı başlık
// altında toplanıyor; yeni grup açmak için sadece yeni bir grup adı yazmak yeter.
const sss = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/sss' }),
  schema: z.object({
    soru: metin,
    cevap: metin,
    grup: metin,
    grupSirasi: sayi(99),
    sira: sayi(99),
    // Sayfa açıldığında bu soru açık gelsin mi?
    acikBasla: mantik(false),
    gizli: mantik(false),
  }),
});


// Blog kategorileri. Panelden ekleniyor, siliniyor ve sıralanıyor;
// yazı formundaki kategori seçimi bu listeden besleniyor.
const kategoriler = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/kategoriler' }),
  schema: z.object({
    ad: metin,
    sira: sayi(99),
  }),
});


// Ürün aileleri: üst menüdeki açılır kutunun sütunlarını belirliyor.
// Yeni bir aile eklendiğinde menüde yeni sütun beliriyor.
const urunAileleri = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/urun-aileleri' }),
  schema: z.object({
    ad: metin,
    sira: sayi(99),
    gizli: mantik(false),
  }),
});

// Ürün sayfaları. Gövde, sırası panelden değiştirilebilen bloklardan oluşuyor.
const urunBlogu = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('metin'),
    value: z.object({ metin }),
  }),
  z.object({
    discriminant: z.literal('etiketler'),
    value: z.object({ etiketler: metinDizisi }),
  }),
  z.object({
    discriminant: z.literal('kutular'),
    value: z.object({
      baslik: metin,
      ustBosluk: sayi(0),
      kutular: z
        .array(z.object({ baslik: metin, metin, maddeler: metinDizisi }))
        .default([]),
    }),
  }),
  z.object({
    discriminant: z.literal('maddeler'),
    value: z.object({
      baslik: metin,
      maddeler: metinDizisi,
    }),
  }),
  z.object({
    discriminant: z.literal('tablo'),
    value: z.object({
      basliklar: metinDizisi,
      satirlar: z.array(z.object({ hucreler: metinDizisi })).default([]),
    }),
  }),
  z.object({
    discriminant: z.literal('odul'),
    value: z.object({ metin }),
  }),
  z.object({
    discriminant: z.literal('not'),
    value: z.object({
      vurgu: metin,
      metin,
      ustBosluk: sayi(0),
    }),
  }),
]);

const urunler = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/urunler' }),
  schema: z.object({
    ad: metin,
    // Menüde farklı görünmesi isteniyorsa doldurulur, boşsa ad kullanılır.
    menuAdi: metin,
    ozet: metin,
    seoBaslik: metin,
    seoAciklama: metin,
    gorsel: metin,
    gorselAlt: metin,
    aile: metin,
    sira: sayi(99),
    gizli: mantik(false),
    ctaBaslik: metin,
    ctaMetin: metin,
    // Sayfanın altındaki kart şeridi. Ürün olmak zorunda değil; "Tüm ürünler"
    // veya SSS gibi sayfalara da bağlanabiliyor.
    ilgiliKartlar: z
      .array(
        z.object({
          baslik: metin,
          aciklama: metin,
          adres: metin,
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
    baslik: metin,
    // Ana sayfadaki kartta daha kısa bir başlık kullanılabiliyor.
    kartBaslik: metin,
    kartOzet: metin,
    ikon: metin,
    sira: sayi(99),
    gizli: mantik(false),
    notVurgu: metin,
    notMetin: metin,
    detay: metin,
  }),
});

export const collections = { blog, etkinlikler, uzmanlar, sss, kategoriler, urunler, urunAileleri, nedenler };
