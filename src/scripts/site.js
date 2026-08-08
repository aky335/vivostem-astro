// Sitenin tüm etkileşimi tek dosyada: mobil menü, kaydıraklar, SSS akordiyonu,
// sekmeler, form gönderim durumu ve yan menü takibi.
// Astro bu dosyayı derleyip küçültüyor, tarayıcıya tek script olarak gidiyor.

(function(){
  var b=document.getElementById('burger'), m=document.getElementById('mobilMenu'),
      p=document.getElementById('perde'), k=document.getElementById('mobilKapat');
  function ac(){m.classList.add('acik');p.classList.add('acik');document.body.style.overflow='hidden';}
  function ka(){m.classList.remove('acik');p.classList.remove('acik');document.body.style.overflow='';}
  if(b)b.addEventListener('click',ac); if(k)k.addEventListener('click',ka); if(p)p.addEventListener('click',ka);
  if(m)m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',ka);});

  // Form gonderimi sonrasi yonlendirmeyi sitenin gercek adresine gore ayarla.
  // Boylece test adresinde de, canlida da tesekkurler sayfasina donuyor.
  if(location.protocol === 'http:' || location.protocol === 'https:'){
    document.querySelectorAll('input[name="_next"]').forEach(function(i){
      i.value = location.origin + '/tesekkurler';
    });
  }

  // mobil menude urun listesi akordiyonu
  document.querySelectorAll('.mobil-ok').forEach(function(d){
    d.addEventListener('click',function(){
      var grup=d.closest('.mobil-grup'), acik=grup.classList.toggle('acik');
      d.setAttribute('aria-expanded', acik ? 'true' : 'false');
      d.setAttribute('aria-label', acik ? 'Ürün listesini kapat' : 'Ürün listesini aç');
      var alt=grup.querySelector('.mobil-alt');
      alt.style.height = acik ? alt.scrollHeight+'px' : '0px';
    });
  });

  
document.querySelectorAll('[data-kaydirak]').forEach(function(k){
  var ray = k.querySelector('.kaydirak-ray'),
      alt = k.querySelector('.kaydirak-alt'),
      nokta = k.querySelector('.kaydirak-noktalar'),
      oklar = k.querySelectorAll('.kaydirak-ok');
  if(!ray || !nokta || !ray.children.length) return;

  var adim = 1, sayfa = 1, sayac = null, duraklat = false;
  var yavas = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sure = parseInt(k.dataset.otomatik || '0', 10);

  function olc(){
    var bosluk = parseFloat(getComputedStyle(ray).columnGap || getComputedStyle(ray).gap || 0) || 0;
    var kart = ray.children[0].getBoundingClientRect().width + bosluk;
    if(!kart) return;
    var gorunen = Math.max(1, Math.round(ray.clientWidth / kart));
    adim = gorunen * kart;
    sayfa = Math.max(1, Math.ceil(ray.children.length / gorunen));
    if(ray.scrollWidth <= ray.clientWidth + 2) sayfa = 1;
  }
  function git(n, yumusak){
    n = (n + sayfa) % sayfa;
    ray.scrollTo({left: n * adim, behavior: yumusak === false ? 'auto' : 'smooth'});
  }
  function suAn(){
    var i = Math.round(ray.scrollLeft / adim);
    return Math.max(0, Math.min(i, sayfa - 1));
  }
  function isaretle(){
    if(alt.hidden) return;
    var i = suAn();
    [].forEach.call(nokta.children, function(b, n){ b.classList.toggle('aktif', n === i); });
  }
  function kur(){
    olc();
    if(sayfa < 2){ alt.hidden = true; nokta.innerHTML = ''; dur(); return; }
    alt.hidden = false;
    if(nokta.children.length !== sayfa){
      nokta.innerHTML = '';
      for(var i = 0; i < sayfa; i++){
        var b = document.createElement('button');
        b.type = 'button'; b.dataset.n = i; b.setAttribute('aria-label', (i+1) + '. grup');
        b.addEventListener('click', function(){ git(parseInt(this.dataset.n, 10)); ertele(); });
        nokta.appendChild(b);
      }
    }
    isaretle();
    basla();
  }
  oklar.forEach(function(o){
    o.addEventListener('click', function(){
      git(suAn() + parseInt(o.dataset.yon, 10)); ertele();
    });
  });

  function basla(){
    if(sayac || !sure || yavas || sayfa < 2) return;
    sayac = setInterval(function(){ if(!duraklat) git(suAn() + 1); }, sure);
  }
  function dur(){ if(sayac){ clearInterval(sayac); sayac = null; } }
  function ertele(){ duraklat = true; clearTimeout(k._z); k._z = setTimeout(function(){ duraklat = false; }, sure || 6000); }

  ['mouseenter','focusin','touchstart'].forEach(function(e){
    k.addEventListener(e, function(){ duraklat = true; }, {passive:true});
  });
  ['mouseleave','focusout'].forEach(function(e){
    k.addEventListener(e, function(){ duraklat = false; }, {passive:true});
  });
  ray.addEventListener('scroll', isaretle, {passive:true});
  window.addEventListener('resize', kur);
  document.addEventListener('visibilitychange', function(){ duraklat = document.hidden; });

  if(window.IntersectionObserver){
    new IntersectionObserver(function(g){
      g.forEach(function(x){ x.isIntersecting ? basla() : dur(); });
    }, {threshold: 0.15}).observe(k);
  }
  kur();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(kur);
});


  var sorular=[].slice.call(document.querySelectorAll('details.sss'));
  if(sorular.length){
    var yavas = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SURE = 320;
    var sssAc=function(d){
      var c=d.querySelector('.cevap'); d.open=true;
      if(yavas){ c.style.height=''; return; }
      c.style.height='0px';
      c.offsetHeight;
      c.style.transition='height '+SURE+'ms cubic-bezier(.4,0,.2,1)';
      c.style.height=c.scrollHeight+'px';
      var bitir=function(){ c.style.transition=''; c.style.height=''; c.removeEventListener('transitionend',bitir); };
      c.addEventListener('transitionend',bitir);
    };
    var sssKapat=function(d){
      var c=d.querySelector('.cevap');
      if(yavas){ d.open=false; return; }
      c.style.transition='none'; c.style.height=c.scrollHeight+'px';
      c.offsetHeight;
      c.style.transition='height '+SURE+'ms cubic-bezier(.4,0,.2,1)';
      c.style.height='0px';
      var bitir=function(){ d.open=false; c.style.transition=''; c.style.height='';
                            c.removeEventListener('transitionend',bitir); };
      c.addEventListener('transitionend',bitir);
    };
    sorular.forEach(function(d){
      d.querySelector('summary').addEventListener('click',function(e){
        e.preventDefault();
        if(d.open){ sssKapat(d); return; }
        sorular.forEach(function(o){ if(o!==d && o.open) sssKapat(o); });
        sssAc(d);
      });
    });
  }

  var sekmeler=[].slice.call(document.querySelectorAll('.sekme'));
  if(sekmeler.length){
    var sec=function(hedef, kaydir){
      var bulundu=false;
      sekmeler.forEach(function(s){
        var ac = s.getAttribute('aria-controls')===hedef;
        if(ac) bulundu=true;
        s.classList.toggle('aktif',ac);
        s.setAttribute('aria-selected', ac?'true':'false');
        var panel=document.getElementById(s.getAttribute('aria-controls'));
        if(panel) panel.classList.toggle('acik',ac);
      });
      if(bulundu && kaydir){
        var alan=document.querySelector('.sekme-alani');
        if(alan) window.scrollTo({top: alan.getBoundingClientRect().top+window.scrollY-100, behavior:'smooth'});
      }
      return bulundu;
    };
    sekmeler.forEach(function(s){
      s.addEventListener('click',function(){
        var h=s.getAttribute('aria-controls');
        sec(h,false);
        if(history.replaceState) history.replaceState(null,'','#'+h);
      });
    });
    var acilis=function(){
      var h=location.hash.replace('#','');
      if(h) sec(h,true);
    };
    acilis();
    window.addEventListener('hashchange',acilis);
  }

  document.querySelectorAll('form[action]').forEach(function(f){
    f.addEventListener('submit',function(){
      var d=f.querySelector('button[type=submit]');
      if(d){ setTimeout(function(){ d.disabled=true; d.textContent='Gönderiliyor...'; },0); }
    });
  });

  var bolumler=[].slice.call(document.querySelectorAll('.madde')),
      linkler=[].slice.call(document.querySelectorAll('.yan-menu li'));
  if(bolumler.length && linkler.length){
    var isaretle=function(){
      var y=window.scrollY+150, i=0;
      bolumler.forEach(function(s,n){ if(s.offsetTop<=y) i=n; });
      linkler.forEach(function(l,n){ l.classList.toggle('aktif', n===i); });
    };
    window.addEventListener('scroll',isaretle,{passive:true}); isaretle();
  }

  // ---------------------------------------------------------- blog süzgeci --
  // Kategori çipleri. Sunucuda tüm kartlar basılıyor, burada sadece
  // gösterilip gizleniyor; yeniden yükleme yok.
  var izgara = document.getElementById('yaziIzgara');
  if (izgara) {
    var cipler = [].slice.call(document.querySelectorAll('.y-cip'));
    var kartlar = [].slice.call(izgara.querySelectorAll('.y-kart'));
    var bosUyari = document.getElementById('yaziBos');
    cipler.forEach(function (c) {
      c.addEventListener('click', function () {
        var secim = c.dataset.suz;
        cipler.forEach(function (o) { o.classList.toggle('aktif', o === c); });
        var gorunen = 0;
        kartlar.forEach(function (k) {
          var uygun = secim === 'hepsi' || k.dataset.kategori === secim;
          k.hidden = !uygun;
          if (uygun) gorunen++;
        });
        if (bosUyari) bosUyari.hidden = gorunen > 0;
      });
    });
  }

  // ----------------------------------------------------- etkinlik takvimi ---
  // Site yeniden derlenmese bile "yaklaşan" listesi tarihi geçen etkinliği
  // tutmasın diye ayrımı her ziyarette tarayıcı yeniden yapıyor.
  var yaklasanListe = document.getElementById('yaklasanListe');
  if (yaklasanListe) {
    var gecmisListe = document.getElementById('gecmisListe');
    var gecmisAlan = document.getElementById('gecmisAlan');
    var yaklasanBos = document.getElementById('yaklasanBos');
    var bugun = new Date(); bugun.setHours(0, 0, 0, 0);

    var tumKartlar = [].slice.call(document.querySelectorAll('.e-kart'));
    var ileri = [], geri = [];
    tumKartlar.forEach(function (k) {
      var bitis = new Date(k.dataset.bitis + 'T23:59:59');
      (bitis >= bugun ? ileri : geri).push({ el: k, t: bitis });
    });
    ileri.sort(function (a, b) { return a.t - b.t; });
    geri.sort(function (a, b) { return b.t - a.t; });

    ileri.forEach(function (x) { yaklasanListe.appendChild(x.el); });
    if (gecmisListe) geri.forEach(function (x) { gecmisListe.appendChild(x.el); });

    if (yaklasanBos) yaklasanBos.hidden = ileri.length > 0;
    yaklasanListe.hidden = ileri.length === 0;
    if (gecmisAlan) gecmisAlan.hidden = geri.length === 0;
  }

  // Etkinlik kartından gelen kayıt isteğinde başvuru formuna etkinlik adını
  // taşı ki hangi etkinlik için başvurulduğu e-postada görünsün.
  var sorgu = new URLSearchParams(location.search).get('etkinlik');
  if (sorgu) {
    var bolum = document.getElementById('basvuru');
    var form = bolum && bolum.querySelector('form');
    if (form) {
      var gizli = document.createElement('input');
      gizli.type = 'hidden'; gizli.name = 'Etkinlik'; gizli.value = sorgu;
      form.appendChild(gizli);
      var mesaj = form.querySelector('textarea[name="Mesaj"]');
      if (mesaj && !mesaj.value) mesaj.value = '"' + sorgu + '" etkinliğine katılmak istiyorum.';
      var serit = document.createElement('p');
      serit.className = 'e-secim-not';
      serit.textContent = 'Başvurunuz "' + sorgu + '" etkinliği için alınacak.';
      form.insertBefore(serit, form.firstChild);
      bolum.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
})();
