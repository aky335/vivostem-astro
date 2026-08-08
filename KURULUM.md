# Vivostem sitesi - kurulum ve kullanım

Site Astro ile kuruldu, içerik yönetimi Keystatic paneli üzerinden yapılıyor,
yayın Cloudflare üzerinde.

## Klasör yapısı

```
src/
  pages/            her dosya bir sayfa (index.astro -> /)
    [urun].astro    tüm ürün sayfaları buradan üretiliyor
    blog/           bilgi merkezi listesi ve yazı sayfası
    keystatic/      içerik panelinin arayüzü
    api/keystatic/  panelin sunucu tarafı
  layouts/
    Layout.astro    tüm sayfaların ortak iskeleti (head, header, footer, script)
  components/
    Header.astro    üst menü (ürün menüsü koleksiyondan üretiliyor)
    Footer.astro    alt bölüm
    Ikon.astro      panelde seçilen simge adını SVG'ye çevirir
    UrunBloklari.astro  ürün sayfasının blok yapısı
    BlogKart / EtkinlikKart / UzmanKart / HukukiSayfa
  data/
    menu.js         ürün dışındaki üst menü ve footer bağlantıları
    ikonlar.js      panelde seçilebilen simgelerin SVG gövdeleri
  content/          PANELİN YAZDIĞI YER, sitenin tüm metni burada
    ayarlar/        site bilgileri (telefon, adres, sosyal medya)
    anasayfa/       ana sayfa metinleri
    sayfalar/       sağlık profesyonelleri, KVKK, gizlilik
    urunler/        11 ürün sayfası
    urun-aileleri/  menü sütunları
    nedenler/       Neden Vivostem başlıkları
    uzmanlar/       uzman görüşleri
    sss/            sıkça sorulan sorular
    blog/           blog yazıları (.mdoc)
    kategoriler/    blog kategorileri
    etkinlikler/    etkinlik takvimi
  lib/
    ayarlar.js      site bilgilerini okur, WhatsApp adresini üretir
    icerik.js       tarih biçimlendirme, sıralama, menü üretimi
  scripts/site.js   sitedeki tüm etkileşim (menü, kaydırak, SSS, sekmeler, süzgeç)
  content.config.ts içerik alanlarının kuralları (hangi alan zorunlu, hangi tipte)
public/
  assets/           görseller ve style.css (elle düzenlenen tek stil dosyası)
keystatic.config.ts panelde görünen alanlar ve etiketler
astro.config.mjs    site adresi, adaptör, entegrasyonlar
```

## Günlük kullanım

### Yeni blog yazısı veya etkinlik eklemek

Panelden: `vivostem.com.tr/keystatic` adresine git, GitHub ile giriş yap,
soldan Blog yazıları veya Etkinlikler seç, doldur, kaydet. Kaydettiğin anda
repoya commit atılır ve Cloudflare siteyi yeniden yayınlar. Yaklaşık 1 dakika
sonra canlıda görünür.

Elle: `src/content/blog/` altına yeni bir `.mdoc` dosyası aç, mevcut bir
yazıyı örnek al, GitHub'a gönder.

**Taslak** kutusu işaretliyken yazı sitede görünmez. Hazır olunca kaldır.

### Yeni ürün sayfası eklemek

Panelden Ürünler > Add. Ürün ailesini seç, sırasını ver, blokları ekle. Üst menüde,
açılır kutuda, mobil menüde ve ürün sayfasında kendiliğinden görünür. Kod dosyası
açmaya gerek yok.


## Panelde ne var, ne nerede

Panel `vivostem.com.tr/keystatic` adresinde. Sol menü beş gruba ayrılıyor:

**Ürünler**

- *Ürünler:* 11 ürün sayfası. Her sayfanın gövdesi bloklardan oluşuyor (metin, etiket şeridi, özellik kutuları, tikli liste, karşılaştırma tablosu, ödül şeridi, uyarı kutusu). Blokları sürükleyerek sıralarsın, "Add" ile yenisini eklersin. Metin bloğunda markdown yazılıyor: `##` başlık açar, boş satır yeni paragraf başlatır, `[yazı](/adres)` bağlantı olur.
- *Ürün aileleri:* Üst menüdeki açılır kutunun sütunları. Yeni aile eklersen menüde yeni sütun belirir.

**İçerik**

- *Blog yazıları*, *Kategoriler*, *Etkinlikler.*

**Sayfalar**

- *Neden Vivostem başlıkları:* Altı madde. Hem ana sayfadaki kaydırakta hem neden-vivostem sayfasında aynı kaynaktan görünüyor.
- *Uzman görüşleri:* "Ana sayfada göster" kutusu, o uzmanın ana sayfadaki kaydırakta çıkıp çıkmayacağını belirler.
- *Sıkça sorulan sorular:* Grup başlığını yazarak yeni bölüm açarsın.

**Sayfa metinleri**

- *Ana sayfa:* Giriş başlığı, sertifika şeridi, güven şeridi, bölüm başlıkları, ürün kartları, alt çağrı.
- *Sağlık profesyonelleri sayfası:* Başlıklar ve destek maddeleri. Formlar kodda kalıyor.
- *KVKK* ve *Gizlilik politikası:* Metin markdown olarak yazılıyor. İçinde `{{adres}}`, `{{eposta}}`, `{{telefon}}` yazarsan Site bilgilerinden otomatik doldurulur.

**Ayarlar**

- *Site bilgileri:* Telefon, WhatsApp, e-posta, adres, sosyal medya hesapları ve footer metinleri. Buradaki bir değişiklik sitenin tamamına yayılır.

## Görseller nerede duruyor

Keystatic koleksiyonlarda her kaydın görselini kendi klasörüne koyar. Bu yüzden
klasörler şöyle ayrıldı:

```
public/assets/img/urunler/<ürün>/     ürün sayfasının büyük görseli
public/assets/img/uzmanlar/<uzman>/   uzman fotoğrafı
public/assets/blog/<yazı>/            blog kapak görseli
public/assets/img/                    tek sayfalık görseller (ana sayfa, logo, favicon)
```

Panelden fotoğraf yüklediğinde dosya kendiliğinden doğru klasöre gider ve alanın
adını alır (`fotograf.jpg`, `gorsel.png`). Eski dosya silinir. Elle bir şey
taşımaya gerek yok.

Bu ayrım zorunlu: `fields.image` bir koleksiyonun içindeyken dosya yoluna kaydın
adını da ekliyor. Ortak bir klasör verilirse panel dosyayı bulamıyor ve
"Choose file" kutusu boş görünüyor. Klasör yollarını değiştirmeyin.

## Geliştirme

```bash
npm install       # ilk seferde
npm run dev       # http://localhost:4321
```

Geliştirme sırasında panel `http://localhost:4321/keystatic` adresinde çalışır
ve değişiklikleri doğrudan diske yazar, GitHub'a dokunmaz.

```bash
npm run build     # dist/ klasörüne yayın çıktısı üretir
```

## Yayın (Cloudflare)

Site Cloudflare Workers üzerinde çalışıyor. Sayfaların tamamı build sırasında
statik HTML olarak üretiliyor; sadece `/keystatic` paneli sunucu tarafında
çalıştığı için adaptör gerekiyor.

### Tek seferlik kurulum

1. Cloudflare panelinde **Workers & Pages > Create > Import a repository**,
   `aky335/vivostem` reposunu bağla
2. Build komutu `npm run build`, çıktı klasörü `dist`
3. GitHub'a her gönderimde otomatik yayınlanır

### Panelin GitHub ile çalışması için

Keystatic yayında GitHub üzerinden çalışır. Bunun için bir GitHub App gerekir:

1. Site yayına girdikten sonra `vivostem.com.tr/keystatic/setup` adresini aç
2. Ekrandaki adımları izle, Keystatic GitHub App'i senin adına oluşturur
3. Kurulum sonunda üç değer verir; bunları Cloudflare'de
   **Settings > Variables and Secrets** altına gizli değişken olarak ekle:
   - `KEYSTATIC_GITHUB_CLIENT_ID`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET`
   - `KEYSTATIC_SECRET`
   - `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (bu gizli değil, normal değişken)
4. Yeniden yayınla

Bu değerler repoya yazılmaz, sadece Cloudflare'de durur.

### Alan adına geçerken

- `astro.config.mjs` içindeki `site` değerini gerçek adresle güncelle
- `public/robots.txt` şu an arama motorlarına kapalı, açmayı unutma

## Bilinmesi gereken iki teknik not

**`compressHTML: false`** ayarı bilerek kapalı. Astro varsayılan olarak satır
sonundaki boşluğu siliyor ve "sorularınız için <a>iletişim formunu</a>" ifadesi
"sorularınız içiniletişim formunu" haline geliyor. Açmayın.

**`src/pages/api/keystatic/[...params].ts`** elle yazıldı. `@keystatic/astro`
paketinin hazır rotası Astro 7 ile uyumsuz (dosyanın içinde gerekçe yazılı).
Keystatic güncellendiğinde bu dosya silinip `keystatic()` entegrasyonu
`astro.config.mjs`'e geri eklenebilir.

## Etkinlik takvimi nasıl çalışıyor

Site statik olduğu için "yaklaşan etkinlikler" listesi build anında donar ve
zamanla yanlış hale gelirdi. Bu yüzden yaklaşan/geçmiş ayrımı her ziyarette
tarayıcıda yeniden yapılıyor (`src/scripts/site.js` içinde). Yani tarihi geçen
bir etkinlik, siz hiçbir şey yapmasanız bile ertesi gün geçmişe düşer.

Etkinlik kartındaki "Kayıt ol" butonu, dış bir kayıt adresi girilmediyse
sağlık profesyonelleri sayfasındaki eğitim başvuru formuna gider ve etkinlik
adını forma taşır; başvuru e-postasında hangi etkinlik olduğu görünür.
