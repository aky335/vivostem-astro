import type { APIContext } from 'astro';
import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { parseString } from 'set-cookie-parser';
import keystaticConfig from '../../../../keystatic.config';

// Keystatic panelinin sunucu tarafı: dosya okuma, GitHub girişi ve kaydetme
// istekleri buradan geçiyor.
//
// NEDEN ELLE YAZILDI: @keystatic/astro paketinin hazır API rotası
// Astro.locals.runtime.env üzerinden ortam değişkenlerini okuyor. Astro 6 ile
// bu alan kaldırıldı ve Cloudflare adaptörü artık okunduğunda hata fırlatan
// bir alan koyuyor. Paketin kodu optional chaining kullandığı için hatayı
// yakalayamıyor ve panel 500 veriyor. Aşağıdaki rota aynı işi yapıyor ama
// ortam değişkenlerini doğrudan Astro'nun kendi env sisteminden okuyor.
// Keystatic paketi güncellendiğinde bu dosya silinip astro.config.mjs'e
// keystatic() entegrasyonu geri eklenebilir.

export const prerender = false;

// Astro'nun import.meta.env değerleri derleme anında koda gömülüyor.
// Cloudflare'de tanımlanan gizli değişkenler ise çalışma anında geliyor ve
// oradan okunmalı. Bu yüzden önce Cloudflare ortamına bakıp, bulunamazsa
// (geliştirme ortamı) import.meta.env'e düşüyoruz.
async function ortam(): Promise<Record<string, string | undefined>> {
  try {
    const { env } = await import('cloudflare:workers');
    return env as Record<string, string | undefined>;
  } catch {
    return {};
  }
}

export async function ALL(context: APIContext) {
  const cf = await ortam();
  const handler = makeGenericAPIRouteHandler(
    {
      config: keystaticConfig,
      clientId: cf.KEYSTATIC_GITHUB_CLIENT_ID ?? import.meta.env.KEYSTATIC_GITHUB_CLIENT_ID,
      clientSecret: cf.KEYSTATIC_GITHUB_CLIENT_SECRET ?? import.meta.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
      secret: cf.KEYSTATIC_SECRET ?? import.meta.env.KEYSTATIC_SECRET,
    },
    { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' }
  );

  const { body, headers, status } = await handler(context.request);

  // Keystatic başlıkları farklı biçimlerde döndürebiliyor; hepsini tek
  // yapıya indirip Set-Cookie'leri Astro'nun cookie API'sine aktarıyoruz.
  const toplu = new Map<string, string[]>();
  const ekle = (ad: string, deger: string) => {
    const k = ad.toLowerCase();
    if (!toplu.has(k)) toplu.set(k, []);
    toplu.get(k)!.push(deger);
  };

  if (headers) {
    if (Array.isArray(headers)) {
      for (const [ad, deger] of headers) ekle(ad, deger);
    } else if (typeof (headers as Headers).entries === 'function') {
      for (const [ad, deger] of (headers as Headers).entries()) ekle(ad, deger);
      const cerezler = (headers as Headers).getSetCookie?.();
      if (cerezler?.length) toplu.set('set-cookie', cerezler);
    } else {
      for (const [ad, deger] of Object.entries(headers)) ekle(ad, String(deger));
    }
  }

  const cerezler = toplu.get('set-cookie');
  toplu.delete('set-cookie');
  if (cerezler) {
    for (const ham of cerezler) {
      const { name, value, ...ayar } = parseString(ham);
      const ayniSite = ayar.sameSite?.toLowerCase();
      context.cookies.set(name, value, {
        domain: ayar.domain,
        expires: ayar.expires,
        httpOnly: ayar.httpOnly,
        maxAge: ayar.maxAge,
        path: ayar.path,
        sameSite:
          ayniSite === 'lax' || ayniSite === 'strict' || ayniSite === 'none' ? ayniSite : undefined,
      });
    }
  }

  return new Response(body, {
    status,
    headers: [...toplu.entries()].flatMap(([ad, degerler]) => degerler.map((d) => [ad, d] as [string, string])),
  });
}
