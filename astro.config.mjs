import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import cloudflare from '@astrojs/cloudflare';

// Cloudflare adaptörü sadece yayın derlemesinde devreye giriyor.
// Geliştirme sırasında Keystatic paneli diske yazdığı için Node ortamı
// gerekiyor; Cloudflare'in workerd çalışma ortamında dosya sistemi yok.
const yayinDerlemesi = process.argv.includes('build');

export default defineConfig({
  // Gerçek alan adına geçince burayı güncelle; kanonik adres ve
  // paylaşım görselinin tam URL'i buradan üretiliyor.
  site: 'https://vivostem.com.tr',

  // Sayfalar build sırasında üretilip statik dosya olarak yayınlanıyor.
  // Sadece Keystatic paneli (/keystatic) sunucu tarafında çalışıyor.
  output: 'static',
  ...(yayinDerlemesi ? { adapter: cloudflare({ imageService: 'passthrough' }) } : {}),

  // markdoc: içerik dosyalarının biçimi (Keystatic editörünün yazdığı format)
  // react: Keystatic paneli React ile çalışıyor
  //
  // keystatic() entegrasyonu bilerek kullanılmıyor: hazır API rotası Astro 7
  // ile uyumsuz. Panel ve API rotaları src/pages altında elle tanımlı,
  // gerekçesi src/pages/api/keystatic/[...params].ts içinde yazılı.
  integrations: [markdoc(), react()],

  build: {
    // /urunler biçiminde temiz adresler (urunler.html değil)
    format: 'directory',
  },

  // Astro varsayılan olarak boşlukları sıkıştırıyor ve satır sonundaki
  // boşluğu tamamen siliyor; bu da "için <a>" ifadesini "için<a>" yapıyor.
  // Metin akışı bozulmasın diye kapalı.
  compressHTML: false,
});
