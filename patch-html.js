// index.html içindeki "Asistan AI" uygulamasını Gemini'ye bağlar (birden fazla çalıştırılsa da bir kez ekler)
const fs = require('fs');
const f = 'index.html';
let h = fs.readFileSync(f, 'utf8');
if (h.includes('/*KUDUKO-GEMINI*/')) { console.log('Gemini yaması zaten uygulanmış.'); process.exit(0); }
const snippet = `
    /*KUDUKO-GEMINI*/
    if (window.kuduko) {
      A.ai.run = b => {
        const H = [];
        b.innerHTML = '<div class=m style="flex:1;display:flex;flex-direction:column"></div><form class=row><input style="flex:1" placeholder="Gemini\\'ye sorun..."><button>Gönder</button></form>';
        const m = $('.m', b), i = $('input', b);
        const add = (t, u) => { const d = document.createElement('div'); d.className = 'msg' + (u ? ' u' : ''); d.textContent = t; m.append(d); m.scrollTop = m.scrollHeight; return d };
        add('Merhaba! Ben Gemini. Kuduko OS içinden çalışıyorum, istediğini sorabilirsin.');
        $('form', b).onsubmit = async e => {
          e.preventDefault();
          const q = i.value.trim(); if (!q) return;
          i.value = ''; add(q, 1);
          H.push({ role: 'user', content: q });
          const d = add('Düşünüyor...');
          const r = await window.kuduko.gemini(H);
          d.textContent = r;
          if (/^(Hata|Bağlantı hatası)/.test(r)) H.pop(); else H.push({ role: 'assistant', content: r });
          m.scrollTop = m.scrollHeight;
        };
      };
    }
`;
const re = /(\n\s*rebuild\(\);\s*tbr\(\);\s*if \(S\.g\('sess', 0\) == 1\) boot\(\);)/;
if (!re.test(h)) { console.error('Eklenecek yer bulunamadı. HTML farklı olabilir.'); process.exit(1); }
h = h.replace(re, snippet + '$1');
fs.writeFileSync(f, h);
console.log('Gemini yaması uygulandı.');
