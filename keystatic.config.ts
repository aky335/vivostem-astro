import { config, collection, fields, singleton } from '@keystatic/core';
import { createElement } from 'react';
import { ikonAdlari } from './src/data/ikonlar.js';

// Panelin sol üstündeki marka işareti. Keystatic buraya bir React bileşeni
// bekliyor; dosya .ts olduğu için JSX yerine createElement kullanılıyor.
// Görsel favicon'un kırpılmış hali, ayrı bir logo üretilmedi.
const markaIsareti = () =>
  createElement('img', {
    src: '/assets/img/logo-isaret.png',
    alt: '',
    height: 26,
    style: { display: 'block', width: 'auto' },
  });

// Panelde ikon secimi icin ortak liste.
const ikonAlani = (label: string) =>
  fields.select({
    label,
    description: 'Simgeyi listeden secin.',
    options: ikonAdlari.map((a) => ({ label: a, value: a })),
    defaultValue: ikonAdlari[0],
  });

const butonDizisi = (label: string) =>
  fields.array(
    fields.object({
      yazi: fields.text({ label: 'Buton yazısı' }),
      adres: fields.text({ label: 'Adres', description: 'Örnek: /urunler' }),
      stil: fields.select({
        label: 'Görünüm',
        options: [
          { label: 'Dolu (mor zemin)', value: 'dolu' },
          { label: 'Çizgili (şeffaf)', value: 'cizgi' },
        ],
        defaultValue: 'dolu',
      }),
    }),
    { label }
  );

const baglantiDizisi = (label: string, description: string) =>
  fields.array(
    fields.object({
      yazi: fields.text({ label: 'Görünen yazı', description: 'HTML yazabilirsiniz, örnek: Cellenis<sup>&reg;</sup> PRGF' }),
      adres: fields.text({ label: 'Adres', description: 'Site içi için /sss gibi, dış bağlantı için tam adres.' }),
    }),
    {
      label,
      description,
      itemLabel: (p) => (p.fields.yazi.value || '').replace(/<[^>]+>/g, '') || 'Bağlantı',
    }
  );

const bolumBasligi = (label: string) =>
  fields.object(
    {
      ustBaslik: fields.text({ label: 'Üst başlık', description: 'Küçük mor yazı.' }),
      baslik: fields.text({ label: 'Başlık', description: 'Satır atlatmak için <br> yazabilirsiniz.', multiline: true }),
      metin: fields.text({ label: 'Açıklama', multiline: true }),
    },
    { label }
  );

// Yerelde çalışırken dosyalar doğrudan diske yazılır, giriş istenmez.
//
// Yayında panel Keystatic Cloud üzerinden çalışıyor: kullanıcı e-posta ve
// şifresiyle giriyor, GitHub hesabına ihtiyaç duymuyor. Depoya yazma yetkisi
// kullanıcıda değil, Keystatic Cloud projesinde duruyor. Kaydet dendiğinde yine
// repoya commit atılıyor ve Cloudflare siteyi yeniden yayınlıyor; içerik her
// zaman kendi depomuzda düz dosya olarak kalıyor.
//
// GitHub moduna dönmek gerekirse aşağıdaki satırı şununla değiştirmek yeterli:
//   { kind: 'github', repo: { owner: 'aky335', name: 'vivostem-astro' } }
// O durumda Cloudflare'deki KEYSTATIC_* gizli değişkenleri tekrar devreye girer.
const depolama =
  process.env.NODE_ENV === 'development'
    ? ({ kind: 'local' } as const)
    : ({ kind: 'cloud' } as const);

export default config({
  storage: depolama,

  // Keystatic Cloud'daki takım ve proje adı. Gizli bir bilgi değil.
  // Kullanıcı yönetimi (davet, şifre, çıkarma) keystatic.cloud üzerinden yapılır.
  cloud: { project: 'd-option/vivostem-astro' },

  ui: {
    brand: { name: 'Vivostem içerik paneli', mark: markaIsareti },
    navigation: {
      Ürünler: ['urunler', 'urunAileleri'],
      İçerik: ['blog', 'kategoriler', 'etkinlikler'],
      Sayfalar: ['nedenler', 'uzmanlar', 'sss'],
      'Sayfa metinleri': ['anasayfa', 'saglikProfesyonelleri', 'kvkk', 'gizlilik'],
      Ayarlar: ['menuler', 'ayarlar'],
    },
  },

  singletons: {
    anasayfa: singleton({
      label: 'Ana sayfa',
      path: 'src/content/anasayfa/',
      format: { data: 'json' },
      schema: {
        heroUstBaslik: fields.text({ label: 'Giriş üst başlığı' }),
        heroBaslik: fields.text({ label: 'Giriş başlığı', description: 'Satır atlatmak için <br> yazın.', multiline: true }),
        heroMetin: fields.text({ label: 'Giriş metni', multiline: true }),
        heroButonlar: butonDizisi('Giriş butonları'),
        heroBelgeler: fields.array(
          fields.object({ yazi: fields.text({ label: 'Yazı' }), ikon: ikonAlani('Simge') }),
          { label: 'Sertifika şeridi', description: 'FDA, CE gibi rozetler.' }
        ),
        heroGorsel: fields.image({ label: 'Giriş görseli', directory: 'public/assets/img', publicPath: '/assets/img/' }),
        heroGorselAlt: fields.text({ label: 'Giriş görseli açıklaması' }),

        guvenMetin: fields.text({ label: 'Güven şeridi metni', multiline: true }),
        guvenMaddeler: fields.array(
          fields.object({ yazi: fields.text({ label: 'Yazı' }), ikon: ikonAlani('Simge') }),
          { label: 'Güven şeridi maddeleri' }
        ),

        urunBolumu: bolumBasligi('Ürün portföyü bölümü'),
        urunKartlari: fields.array(
          fields.object({
            baslik: fields.text({ label: 'Kart başlığı' }),
            altBaslik: fields.text({ label: 'Alt satır', description: 'Örnek: PRGF · PRF · DermaFiller' }),
            metin: fields.text({ label: 'Açıklama', multiline: true }),
            gorsel: fields.image({ label: 'Görsel', directory: 'public/assets/img', publicPath: '/assets/img/' }),
            gorselAlt: fields.text({ label: 'Görsel açıklaması' }),
            adres: fields.text({ label: 'Adres', description: 'Örnek: /cellenis' }),
          }),
          { label: 'Ürün kartları' }
        ),

        nedenBolumu: bolumBasligi('Neden Vivostem bölümü'),
        nedenButonYazi: fields.text({ label: 'Neden bölümü buton yazısı' }),
        nedenButonAdres: fields.text({ label: 'Neden bölümü buton adresi' }),

        uzmanBolumu: bolumBasligi('Uzman görüşleri bölümü'),
        uzmanButonYazi: fields.text({ label: 'Uzman bölümü buton yazısı' }),
        uzmanButonAdres: fields.text({ label: 'Uzman bölümü buton adresi' }),

        egitimBolumu: bolumBasligi('Sağlık profesyonelleri bölümü'),
        egitimMaddeler: fields.array(
          fields.object({
            baslik: fields.text({ label: 'Madde başlığı' }),
            metin: fields.text({ label: 'Açıklama', multiline: true }),
            ikon: ikonAlani('Simge'),
          }),
          { label: 'Destek maddeleri' }
        ),
        egitimButonlar: butonDizisi('Bölüm butonları'),
        egitimGorsel: fields.image({ label: 'Bölüm görseli', directory: 'public/assets/img', publicPath: '/assets/img/' }),
        egitimGorselAlt: fields.text({ label: 'Bölüm görseli açıklaması' }),

        ctaBaslik: fields.text({ label: 'Alt çağrı başlığı', multiline: true }),
        ctaMetin: fields.text({ label: 'Alt çağrı metni', multiline: true }),
      },
    }),

    saglikProfesyonelleri: singleton({
      label: 'Sağlık profesyonelleri sayfası',
      path: 'src/content/sayfalar/saglik-profesyonelleri',
      format: { data: 'json' },
      schema: {
        baslik: fields.text({ label: 'Sayfa başlığı' }),
        ozet: fields.text({ label: 'Giriş metni', multiline: true }),

        destekUstBaslik: fields.text({ label: 'Destek bölümü üst başlığı' }),
        destekBaslik: fields.text({ label: 'Destek bölümü başlığı' }),
        destekMaddeler: fields.array(
          fields.object({
            baslik: fields.text({ label: 'Madde başlığı' }),
            metin: fields.text({ label: 'Açıklama', multiline: true }),
            ikon: ikonAlani('Simge'),
          }),
          { label: 'Destek maddeleri' }
        ),
        destekGorsel: fields.image({ label: 'Bölüm görseli', directory: 'public/assets/img', publicPath: '/assets/img/' }),
        destekGorselAlt: fields.text({ label: 'Görsel açıklaması' }),

        basvuruUstBaslik: fields.text({ label: 'Başvuru bölümü üst başlığı' }),
        basvuruBaslik: fields.text({ label: 'Başvuru bölümü başlığı' }),
        basvuruMetin: fields.text({ label: 'Başvuru bölümü açıklaması', multiline: true }),

        takvimUstBaslik: fields.text({ label: 'Takvim şeridi üst başlığı' }),
        takvimBaslik: fields.text({ label: 'Takvim şeridi başlığı' }),
        takvimMetin: fields.text({ label: 'Takvim şeridi açıklaması', multiline: true }),
        takvimButonYazi: fields.text({
          label: 'Takvim şeridi buton yazısı',
          description: 'Buton her zaman etkinlik takvimi sayfasına gider.',
        }),

        ctaBaslik: fields.text({ label: 'Alt çağrı başlığı', multiline: true }),
        ctaMetin: fields.text({ label: 'Alt çağrı metni', multiline: true }),
        seoBaslik: fields.text({ label: 'Tarayıcı sekmesi başlığı' }),
        seoAciklama: fields.text({ label: 'Arama motoru açıklaması', multiline: true }),
      },
    }),

    kvkk: singleton({
      label: 'KVKK aydınlatma metni',
      path: 'src/content/sayfalar/kvkk',
      format: { data: 'json' },
      schema: {
        baslik: fields.text({ label: 'Sayfa başlığı' }),
        izlek: fields.text({ label: 'Üstteki yol adı', description: 'Ana Sayfa / ... kısmında görünen ad.' }),
        ozet: fields.text({ label: 'Giriş metni', multiline: true }),
        icerik: fields.text({
          label: 'Metin',
          description:
            'Başlık için ## yazın. {{adres}}, {{eposta}}, {{telefon}} yazarsanız site bilgilerinden otomatik doldurulur.',
          multiline: true,
        }),
        seoBaslik: fields.text({ label: 'Tarayıcı sekmesi başlığı' }),
        seoAciklama: fields.text({ label: 'Arama motoru açıklaması', multiline: true }),
      },
    }),

    gizlilik: singleton({
      label: 'Gizlilik politikası',
      path: 'src/content/sayfalar/gizlilik',
      format: { data: 'json' },
      schema: {
        baslik: fields.text({ label: 'Sayfa başlığı' }),
        izlek: fields.text({ label: 'Üstteki yol adı' }),
        ozet: fields.text({ label: 'Giriş metni', multiline: true }),
        icerik: fields.text({
          label: 'Metin',
          description:
            'Başlık için ## yazın. {{adres}}, {{eposta}}, {{telefon}} yazarsanız site bilgilerinden otomatik doldurulur.',
          multiline: true,
        }),
        seoBaslik: fields.text({ label: 'Tarayıcı sekmesi başlığı' }),
        seoAciklama: fields.text({ label: 'Arama motoru açıklaması', multiline: true }),
      },
    }),

    menuler: singleton({
      label: 'Menüler',
      path: 'src/content/menuler/',
      format: { data: 'json' },
      schema: {
        // ÜST MENÜ. Sadece sayfanın üstünü besler, footer'a dokunmaz.
        anaMenu: baglantiDizisi(
          'ÜST MENÜ · bağlantılar',
          'Ürünler açılır kutusunun sağındaki bağlantılar. Ürün menüsü buraya yazılmaz, ürün koleksiyonundan kendiliğinden üretilir.'
        ),
        urunMenuYazi: fields.text({
          label: 'ÜST MENÜ · ürün kutusunun adı',
          description: 'Hem üst menüde hem mobil menüde açılır kutunun başlığı.',
        }),
        urunTumuYazi: fields.text({ label: 'ÜST MENÜ · açılır kutunun alt butonu' }),
        anaSayfaYazi: fields.text({ label: 'ÜST MENÜ · mobilde ana sayfa yazısı' }),

        // FOOTER. Üst menüden tamamen bağımsız, ayrı listeler.
        urunSutunBaslik: fields.text({ label: 'FOOTER · 1. sütun başlığı' }),
        footerUrunler: baglantiDizisi(
          'FOOTER · 1. sütun bağlantıları',
          'Elle seçiliyor. Yeni ürün eklemek bu listeyi değiştirmez, istersen buraya da elle eklersin.'
        ),

        kurumsalSutunBaslik: fields.text({ label: 'FOOTER · 2. sütun başlığı' }),
        footerKurumsal: baglantiDizisi('FOOTER · 2. sütun bağlantıları', ''),

        iletisimSutunBaslik: fields.text({
          label: 'FOOTER · 3. sütun başlığı',
          description: 'Bu sütunun içindeki telefon, e-posta ve adres Site bilgilerinden geliyor.',
        }),
      },
    }),

    ayarlar: singleton({
      label: 'Site bilgileri',
      path: 'src/content/ayarlar/',
      format: { data: 'json' },
      schema: {
        telefon: fields.text({
          label: 'Telefon (görünen hali)',
          description: 'Sitede yazıyla görünen numara. Örnek: +90 543 359 11 80',
          validation: { length: { min: 1 } },
        }),
        whatsappNumarasi: fields.text({
          label: 'WhatsApp numarası',
          description: 'Sadece rakam, başında sıfır olmadan ülke koduyla. Örnek: 905433591180',
          validation: { length: { min: 1 } },
        }),
        eposta: fields.text({ label: 'E-posta', validation: { length: { min: 1 } } }),
        adres: fields.text({ label: 'Adres', multiline: true, validation: { length: { min: 1 } } }),

        instagramAdres: fields.url({ label: 'Instagram adresi' }),
        instagramKullanici: fields.text({ label: 'Instagram kullanıcı adı', description: 'Örnek: @vivostemturkey' }),
        linkedinAdres: fields.url({ label: 'LinkedIn adresi' }),
        linkedinAd: fields.text({ label: 'LinkedIn görünen ad' }),
        youtubeAdres: fields.url({ label: 'YouTube adresi' }),
        youtubeKullanici: fields.text({ label: 'YouTube kullanıcı adı' }),

        footerTanitim: fields.text({
          label: 'Alt bölüm tanıtım yazısı',
          description: 'Footer\'da logonun altındaki cümle.',
          multiline: true,
        }),
        footerUyari: fields.text({
          label: 'Alt bölüm yasal uyarı',
          description: 'Her sayfanın altında görünen bilgilendirme metni.',
          multiline: true,
        }),
        telifSahibi: fields.text({
          label: 'Telif sahibi',
          description: 'Alt satırdaki şirket adı. Yıl otomatik yazılıyor.',
        }),
      },
    }),
  },

  collections: {
    urunAileleri: collection({
      label: 'Ürün aileleri',
      slugField: 'ad',
      path: 'src/content/urun-aileleri/*',
      format: { data: 'yaml' },
      columns: ['ad', 'sira'],
      schema: {
        ad: fields.slug({
          name: {
            label: 'Aile adı',
            description: 'Üst menüdeki açılır kutuda sütun başlığı olur. HTML kullanabilirsiniz.',
            validation: { length: { min: 1 } },
          },
          slug: { label: 'Kimlik', description: 'Ürünler bu kimlikle aileye bağlanır.' },
        }),
        sira: fields.integer({ label: 'Sıra', description: 'Menüdeki sütun sırası.', defaultValue: 99 }),
        gizli: fields.checkbox({
          label: 'Gizli',
          description: 'İşaretliyse bu aile ve altındaki ürünler menüde görünmez.',
          defaultValue: false,
        }),
      },
    }),

    urunler: collection({
      label: 'Ürünler',
      slugField: 'ad',
      path: 'src/content/urunler/*',
      format: { data: 'yaml' },
      columns: ['ad', 'aile', 'sira'],
      schema: {
        ad: fields.slug({
          name: {
            label: 'Ürün adı',
            description: 'Sayfa başlığı. HTML kullanabilirsiniz, örnek: Cellenis<sup>&reg;</sup> PRGF',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'Adres (URL)',
            description: 'vivostem.com.tr/... kısmı. Yayındaki bir üründe değiştirmeyin.',
          },
        }),
        menuAdi: fields.text({
          label: 'Menüde görünen ad',
          description: 'Boş bırakılırsa ürün adı kullanılır. Örnek: Cellenis<sup>&reg;</sup> ailesi',
        }),
        ozet: fields.text({
          label: 'Kısa tanım',
          description: 'Sayfa başlığının altındaki cümle.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        aile: fields.relationship({
          label: 'Ürün ailesi',
          description: 'Menüde hangi sütunda görüneceğini belirler.',
          collection: 'urunAileleri',
          validation: { isRequired: true },
        }),
        sira: fields.integer({
          label: 'Sıra',
          description: 'Menüde ailenin içindeki sıra. Küçük sayı önce.',
          defaultValue: 99,
        }),
        gizli: fields.checkbox({
          label: 'Gizli',
          description: 'İşaretliyse ürün sayfası yayınlanmaz ve menüde görünmez.',
          defaultValue: false,
        }),

        gorsel: fields.image({
          label: 'Ürün görseli',
          description: 'Sayfanın sol tarafındaki büyük görsel.',
          // Koleksiyonlarda Keystatic görseli ürünün kendi klasörüne koyuyor:
          // public/assets/img/urunler/<ürün>/dosya.png. Bu yüzden klasör ortak
          // değil, koleksiyona özel. Gerekçesi: fields.image koleksiyon
          // içindeyken yol hesabına dosya adını da ekliyor.
          directory: 'public/assets/img/urunler',
          publicPath: '/assets/img/urunler/',
          validation: { isRequired: true },
        }),
        gorselAlt: fields.text({ label: 'Görsel açıklaması' }),

        bloklar: fields.blocks(
          {
            metin: {
              label: 'Metin',
              itemLabel: (props) => (props.fields.metin.value || '').split('\n')[0].replace(/^#+\s*/, '').slice(0, 60) || 'Metin',
              schema: fields.object({
                metin: fields.text({
                  label: 'Metin',
                  description:
                    'Başlık için satır başına ## yazın, alt başlık için ###. Boş satır yeni paragraf açar. Bağlantı: [görünen yazı](/sss)',
                  multiline: true,
                }),
              }),
            },
            etiketler: {
              label: 'Etiket şeridi',
              itemLabel: () => 'Etiket şeridi',
              schema: fields.object({
                etiketler: fields.array(fields.text({ label: 'Etiket' }), {
                  label: 'Etiketler',
                  description: 'Sayfanın en üstündeki küçük mor yazılar. Örnek: Otolog, Lökositsiz',
                  itemLabel: (p) => p.value ?? '',
                }),
              }),
            },
            kutular: {
              label: 'Özellik kutuları',
              itemLabel: (props) => props.fields.baslik.value || 'Özellik kutuları',
              schema: fields.object({
                baslik: fields.text({ label: 'Üst başlık', description: 'Kutuların üstünde görünecek başlık. Boş bırakılabilir.' }),
                ustBosluk: fields.integer({
                  label: 'Üst boşluk (px)',
                  description: 'Bir önceki kutu grubunun devamıysa 20 yazın, değilse 0.',
                  defaultValue: 0,
                }),
                kutular: fields.array(
                  fields.object({
                    baslik: fields.text({ label: 'Kutu başlığı' }),
                    metin: fields.text({ label: 'Açıklama', description: 'Madde listesi kullanacaksanız boş bırakın.', multiline: true }),
                    maddeler: fields.array(fields.text({ label: 'Madde' }), { label: 'Maddeler' }),
                  }),
                  { label: 'Kutular' }
                ),
              }),
            },
            maddeler: {
              label: 'Tikli liste',
              itemLabel: (props) => props.fields.baslik.value || 'Tikli liste',
              schema: fields.object({
                baslik: fields.text({ label: 'Üst başlık', description: 'Boş bırakılabilir.' }),
                maddeler: fields.array(fields.text({ label: 'Madde' }), { label: 'Maddeler' }),
              }),
            },
            tablo: {
              label: 'Karşılaştırma tablosu',
              itemLabel: () => 'Tablo',
              schema: fields.object({
                basliklar: fields.array(fields.text({ label: 'Sütun başlığı' }), {
                  label: 'Sütun başlıkları',
                  description: 'İlk sütun genelde boş bırakılır.',
                  itemLabel: (p) => p.value || '(boş)',
                }),
                satirlar: fields.array(
                  fields.object({
                    hucreler: fields.array(fields.text({ label: 'Hücre' }), { label: 'Hücreler' }),
                  }),
                  { label: 'Satırlar' }
                ),
              }),
            },
            odul: {
              label: 'Ödül şeridi',
              itemLabel: () => 'Ödül',
              schema: fields.object({
                metin: fields.text({
                  label: 'Ödül metni',
                  description: 'Madalya ikonlu şeritte görünür. Vurgu için <strong>...</strong> kullanabilirsiniz.',
                  multiline: true,
                }),
              }),
            },
            not: {
              label: 'Uyarı kutusu',
              itemLabel: (props) => props.fields.vurgu.value || 'Uyarı kutusu',
              schema: fields.object({
                vurgu: fields.text({ label: 'Kalın başlangıç', description: 'Örnek: Hassas bölgeler:' }),
                metin: fields.text({ label: 'Metin', multiline: true }),
                ustBosluk: fields.integer({ label: 'Üst boşluk (px)', defaultValue: 26 }),
              }),
            },
          },
          { label: 'Sayfa içeriği', description: 'Blokları sürükleyerek sırasını değiştirebilirsiniz.' }
        ),

        ilgiliKartlar: fields.array(
          fields.object({
            baslik: fields.text({ label: 'Kart başlığı' }),
            aciklama: fields.text({ label: 'Kısa açıklama' }),
            adres: fields.text({ label: 'Adres', description: 'Örnek: /cellenis-prf veya /sss' }),
          }),
          { label: 'İlgili ürünler şeridi' }
        ),

        ctaBaslik: fields.text({ label: 'Alt çağrı başlığı', multiline: true }),
        ctaMetin: fields.text({ label: 'Alt çağrı metni', multiline: true }),

        seoBaslik: fields.text({
          label: 'Tarayıcı sekmesi başlığı',
          description: 'Google sonuçlarında görünen başlık.',
          validation: { length: { min: 1 } },
        }),
        seoAciklama: fields.text({
          label: 'Arama motoru açıklaması',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
      },
    }),

    nedenler: collection({
      label: 'Neden Vivostem başlıkları',
      slugField: 'baslik',
      path: 'src/content/nedenler/*',
      format: { data: 'yaml' },
      columns: ['baslik', 'sira'],
      schema: {
        baslik: fields.slug({
          name: { label: 'Başlık', description: 'Detay sayfasındaki başlık.', validation: { length: { min: 1 } } },
          slug: { label: 'Bağlantı kimliği', description: 'Ana sayfadaki kart bu kimlikle detaya gidiyor.' },
        }),
        kartBaslik: fields.text({
          label: 'Ana sayfadaki kart başlığı',
          description: 'Kartta daha kısa bir başlık kullanmak isterseniz.',
          validation: { length: { min: 1 } },
        }),
        kartOzet: fields.text({ label: 'Kart açıklaması', multiline: true, validation: { length: { min: 1 } } }),
        ikon: ikonAlani('Kart simgesi'),
        sira: fields.integer({ label: 'Sıra', description: 'Hem karttaki numara hem sıralama.', defaultValue: 99 }),
        gizli: fields.checkbox({ label: 'Gizli', defaultValue: false }),
        detay: fields.text({
          label: 'Detay metni',
          description: 'Başlık için ###, madde için satır başına - yazın. Boş satır yeni paragraf açar.',
          multiline: true,
        }),
        notVurgu: fields.text({ label: 'Uyarı kutusu kalın başlangıç', description: 'Örnek: Klinik karşılığı:' }),
        notMetin: fields.text({ label: 'Uyarı kutusu metni', multiline: true }),
      },
    }),

    kategoriler: collection({
      label: 'Kategoriler',
      slugField: 'ad',
      path: 'src/content/kategoriler/*',
      format: { data: 'yaml' },
      columns: ['ad', 'sira'],
      schema: {
        ad: fields.slug({
          name: { label: 'Kategori adı', validation: { length: { min: 1 } } },
          slug: {
            label: 'Kimlik',
            description: 'Yazılarla bağı bu kimlik kuruyor. Kullanımdaki bir kategoride değiştirmeyin.',
          },
        }),
        sira: fields.integer({
          label: 'Sıra',
          description: 'Bilgi merkezindeki süzgeç butonlarının sırası. Küçük sayı önce.',
          defaultValue: 99,
        }),
      },
    }),

    sss: collection({
      label: 'Sıkça sorulan sorular',
      slugField: 'soru',
      path: 'src/content/sss/*',
      format: { data: 'yaml' },
      columns: ['soru', 'grup', 'sira'],
      schema: {
        soru: fields.slug({
          name: { label: 'Soru', validation: { length: { min: 1 } } },
          slug: { label: 'Dosya adı' },
        }),
        cevap: fields.text({
          label: 'Cevap',
          description: 'Her paragrafı <p> ile sarın. Örnek: <p>Birinci paragraf.</p><p>İkincisi.</p>',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        grup: fields.text({
          label: 'Grup başlığı',
          description: 'Aynı başlığı yazdığınız sorular sayfada aynı bölümde toplanır. Yeni bir başlık yazmak yeni grup açar. HTML etiketi kullanabilirsiniz, örnek: Cellenis<sup>&reg;</sup> teknolojisi',
          validation: { length: { min: 1 } },
        }),
        grupSirasi: fields.integer({
          label: 'Grup sırası',
          description: 'Grupların sayfadaki sırası. Aynı gruptaki tüm sorulara aynı sayıyı yazın.',
          defaultValue: 99,
        }),
        sira: fields.integer({
          label: 'Soru sırası',
          description: 'Grup içindeki sıra. Küçük sayı önce.',
          defaultValue: 99,
        }),
        acikBasla: fields.checkbox({
          label: 'Açık başlasın',
          description: 'Sayfa açıldığında bu sorunun cevabı görünsün mü? Genelde sadece ilk soruda işaretlenir.',
          defaultValue: false,
        }),
        gizli: fields.checkbox({ label: 'Gizli', defaultValue: false }),
      },
    }),

    uzmanlar: collection({
      label: 'Uzman görüşleri',
      slugField: 'ad',
      path: 'src/content/uzmanlar/*',
      format: { data: 'yaml' },
      columns: ['ad', 'brans', 'sira'],
      schema: {
        ad: fields.slug({
          name: { label: 'Ad ve unvan', description: 'Örnek: Uzm. Dr. Seçil Uçar', validation: { length: { min: 1 } } },
          slug: { label: 'Dosya adı' },
        }),
        brans: fields.text({
          label: 'Branş / kullandığı ürün',
          description: 'Kartta adın altında görünür. Örnek: Cellenis<sup>&reg;</sup> PRP',
          validation: { length: { min: 1 } },
        }),
        gorus: fields.text({
          label: 'Görüşü',
          description: 'Tırnak işaretlerini de yazın, kartta olduğu gibi görünür.',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        fotograf: fields.image({
          label: 'Fotoğraf',
          directory: 'public/assets/img/uzmanlar',
          publicPath: '/assets/img/uzmanlar/',
          validation: { isRequired: true },
        }),
        sira: fields.integer({
          label: 'Sıra',
          description: 'Küçük sayı önce görünür.',
          defaultValue: 99,
        }),
        anaSayfada: fields.checkbox({
          label: 'Ana sayfada göster',
          description: 'Uzmanlarımız sayfasında hepsi görünür; bu kutu sadece ana sayfadaki kaydırağı belirler.',
          defaultValue: true,
        }),
        gizli: fields.checkbox({
          label: 'Gizli',
          description: 'İşaretliyse hiçbir yerde görünmez.',
          defaultValue: false,
        }),
      },
    }),

    blog: collection({
      label: 'Blog yazıları',
      slugField: 'baslik',
      path: 'src/content/blog/*',
      format: { contentField: 'icerik' },
      columns: ['baslik', 'kategori', 'tarih'],
      entryLayout: 'content',
      schema: {
        baslik: fields.slug({
          name: {
            label: 'Başlık',
            description: 'Yazının başlığı. Adres bundan üretilir.',
            validation: { length: { min: 1 } },
          },
          slug: {
            label: 'Adres (URL)',
            description: 'vivostem.com.tr/blog/... kısmı. Yayınlandıktan sonra değiştirmeyin.',
          },
        }),
        ozet: fields.text({
          label: 'Özet',
          description: 'Liste kartlarında ve Google sonuçlarında görünür. 1-2 cümle.',
          multiline: true,
          validation: { length: { min: 1, max: 300 } },
        }),
        tarih: fields.date({
          label: 'Yayın tarihi',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
        }),
        kategori: fields.relationship({
          label: 'Kategori',
          description: 'Kategoriler listesinden seçilir. Yeni kategori eklemek için soldaki Kategoriler bölümünü kullanın.',
          collection: 'kategoriler',
          validation: { isRequired: true },
        }),
        kapak: fields.image({
          label: 'Kapak görseli',
          description: 'İsteğe bağlı. Boş bırakılırsa kartta Vivostem amblemi görünür.',
          directory: 'public/assets/blog',
          publicPath: '/assets/blog/',
        }),
        kapakAlt: fields.text({
          label: 'Görsel açıklaması',
          description: 'Görme engelli kullanıcılar ve arama motorları için kısa açıklama.',
        }),
        taslak: fields.checkbox({
          label: 'Taslak',
          description: 'İşaretliyse yazı sitede yayınlanmaz.',
          defaultValue: false,
        }),
        icerik: fields.markdoc({
          label: 'İçerik',
          options: {
            image: {
              directory: 'public/assets/blog',
              publicPath: '/assets/blog/',
            },
          },
        }),
      },
    }),

    etkinlikler: collection({
      label: 'Etkinlikler',
      slugField: 'baslik',
      path: 'src/content/etkinlikler/*',
      format: { contentField: 'icerik' },
      columns: ['baslik', 'tur', 'baslangic'],
      entryLayout: 'form',
      schema: {
        baslik: fields.slug({
          name: { label: 'Etkinlik adı', validation: { length: { min: 1 } } },
          slug: { label: 'Adres (URL)' },
        }),
        ozet: fields.text({
          label: 'Özet',
          description: 'Etkinlik kartında görünen kısa açıklama.',
          multiline: true,
          validation: { length: { min: 1, max: 300 } },
        }),
        tur: fields.select({
          label: 'Etkinlik türü',
          options: [
            { label: 'Online webinar', value: 'webinar' },
            { label: 'Yüz yüze eğitim', value: 'egitim' },
            { label: 'Kongre ve fuar', value: 'kongre' },
          ],
          defaultValue: 'webinar',
        }),
        baslangic: fields.date({
          label: 'Başlangıç tarihi',
          validation: { isRequired: true },
        }),
        bitis: fields.date({
          label: 'Bitiş tarihi',
          description: 'Sadece birden fazla gün sürüyorsa doldurun (kongre, çok günlü eğitim).',
        }),
        saat: fields.text({
          label: 'Saat',
          description: 'Örnek: 20:00 veya 10:00 - 17:00. Tüm gün sürüyorsa boş bırakın.',
        }),
        konum: fields.text({
          label: 'Yer',
          description: 'Örnek: Online (Zoom) veya İstanbul, Vivostem Eğitim Merkezi',
          validation: { length: { min: 1 } },
        }),
        konusmaci: fields.text({ label: 'Konuşmacı' }),
        kontenjan: fields.text({
          label: 'Kontenjan',
          description: 'Örnek: 12 kişi. Sınırsızsa boş bırakın.',
        }),
        standNo: fields.text({
          label: 'Stant numarası',
          description: 'Sadece kongre ve fuar katılımlarında.',
        }),
        kayitLinki: fields.url({
          label: 'Dış kayıt adresi',
          description:
            'Boş bırakılırsa "Kayıt ol" butonu sitedeki eğitim başvuru formuna gider ve etkinlik adını forma taşır.',
        }),
        taslak: fields.checkbox({
          label: 'Taslak',
          description: 'İşaretliyse etkinlik sitede görünmez.',
          defaultValue: false,
        }),
        icerik: fields.markdoc({ label: 'Ayrıntılı açıklama' }),
      },
    }),
  },
});
