// Keystatic panelinin React bileşeni.
//
// Normalde @keystatic/astro entegrasyonu bu dosyayı kendisi üretir, ama
// entegrasyonun hazır API rotası Astro 7 ile uyumsuz (ayrıntı için
// src/pages/api/keystatic/[...params].ts dosyasındaki nota bakın).
// O yüzden hem paneli hem API'yi elle bağlıyoruz.
import { makePage } from '@keystatic/astro/ui';
import config from '../keystatic.config';

export const Panel = makePage(config);
