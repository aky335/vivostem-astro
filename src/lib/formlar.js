// Sitedeki dört formun ortak ayarları. Panelde Ayarlar > Formlar bölümünden
// düzenleniyor. Formlar FormSubmit adlı hizmet üzerinden çalışıyor: form
// gönderildiğinde veri o hizmete gidiyor, hizmet de içeriği e-posta olarak
// iletiyor. Bizim tarafta sunucu yok.
import ham from '../content/formlar/index.json';

export const formAyarlari = {
  ...ham,
  // FormSubmit'in adres biçimi: formsubmit.co/<kod>. Kod ya doğrudan bir
  // e-posta adresi ya da hizmetin verdiği karışık karakterli gizli koddur.
  // Gizli kod tercih ediliyor, çünkü e-posta adresi sayfa kaynağında açıkta
  // kalırsa spam botları toplayabiliyor.
  adres: `https://formsubmit.co/${(ham.formsubmitKodu || '').trim()}`,
};

export default formAyarlari;
