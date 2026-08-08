// Site geneli bilgiler. Panelde "Site bilgileri" bölümünden düzenleniyor,
// buradan da tüm sayfalara dağılıyor. Telefon numarası değiştiğinde tek
// yerden değişsin diye WhatsApp adresi de burada üretiliyor.
import ham from '../content/ayarlar/index.json';

export const ayarlar = {
  ...ham,
  whatsappAdres: `https://wa.me/${ham.whatsappNumarasi}`,
};

export default ayarlar;
