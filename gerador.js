// Gerador de certificado/carteirinha e moldura de perfil. Tudo roda no navegador do comprador.
(function () {
  const CFG = window.KIT;
  const $ = (s) => document.querySelector(s);
  let photo = null;   // foto para carteirinha/moldura
  let format = 'story';

  const hash = (s) => {
    let h = 2166136261;
    for (const c of s.toLowerCase().trim()) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return (h >>> 0) % 9000000 + 100000;
  };
  const num = (n) => String(n).padStart(7, '0').replace(/(\d)(\d{3})(\d{3})$/, '$1.$2.$3');

  function wrap(ctx, text, maxW) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }
  function fitText(ctx, text, font, maxW, start, min) {
    let size = start;
    do { ctx.font = font.replace('{s}', size); size -= 4; } while (ctx.measureText(text).width > maxW && size > min);
    return size + 4;
  }
  function stripes(ctx, W, H, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#fff';
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-0.6);
    for (let x = -2000; x < 2000; x += 120) ctx.fillRect(x, -2000, 60, 4000);
    ctx.restore();
  }
  function drawPhoto(ctx, x, y, w, h, r) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.clip();
    if (photo) {
      const s = Math.max(w / photo.width, h / photo.height);
      ctx.drawImage(photo, x + (w - photo.width * s) / 2, y + (h - photo.height * s) / 2, photo.width * s, photo.height * s);
    } else {
      ctx.fillStyle = 'rgba(0,0,0,.15)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.font = `${Math.round(w / 2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(CFG.emoji, x + w / 2, y + h / 2);
    }
    ctx.restore();
  }

  // ---------- Certificado (vitória) ----------
  function certificado(ctx, W, H, nome, cidade) {
    const c = CFG.colors;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c.a); g.addColorStop(1, c.dark);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    stripes(ctx, W, H, 0.05);
    const tall = H > 1500;
    const m = 70;
    ctx.strokeStyle = c.b; ctx.lineWidth = 8; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.lineWidth = 2; ctx.strokeRect(m + 18, m + 18, W - 2 * m - 36, H - 2 * m - 36);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    let y = tall ? 330 : 210;
    ctx.fillStyle = c.b; ctx.font = '600 38px "Archivo Black", "Arial Black", sans-serif';
    ctx.fillText('C E R T I F I C A D O   D O   P O V O', W / 2, y);
    y += tall ? 230 : 150;
    ctx.fillStyle = '#fff'; ctx.font = `${tall ? 170 : 128}px Anton, Impact, sans-serif`;
    for (const l of CFG.titulo) { ctx.fillText(l, W / 2, y); y += tall ? 170 : 124; }
    y += tall ? 120 : 30;
    ctx.font = '40px Georgia, serif'; ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText('Certificamos que', W / 2, y);
    y += tall ? 150 : 120;
    ctx.fillStyle = c.b;
    fitText(ctx, nome, '{s}px "Permanent Marker", "Marker Felt", cursive', W - 260, 120, 50);
    ctx.fillText(nome, W / 2, y);
    y += 30;
    ctx.fillRect(W / 2 - 300, y, 600, 4);
    y += tall ? 90 : 70;
    ctx.fillStyle = '#fff'; ctx.font = '40px Georgia, serif';
    const corpo = `${cidade ? 'de ' + cidade + ', ' : ''}${CFG.corpo}`;
    for (const l of wrap(ctx, corpo, W - 280)) { ctx.fillText(l, W / 2, y); y += 56; }
    y += tall ? 160 : 50;
    ctx.font = '34px "Archivo Black", "Arial Black", sans-serif'; ctx.fillStyle = c.b;
    ctx.fillText(`${CFG.numeroLabel} Nº ${num(hash(nome + cidade))}`, W / 2, y);
    y += 60;
    ctx.font = '32px Georgia, serif'; ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.fillText(CFG.data, W / 2, y);
    ctx.font = '28px "Archivo Black", "Arial Black", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText(CFG.rodape, W / 2, H - m - 50);
  }

  // ---------- Carteirinha (resistência) ----------
  function carteirinha(ctx, W, H, nome, cidade) {
    const c = CFG.colors;
    ctx.fillStyle = c.dark; ctx.fillRect(0, 0, W, H);
    stripes(ctx, W, H, 0.04);
    const tall = H > 1500;
    const cw = W - 140, ch = tall ? 1250 : 1000;
    const cx = 70, cy = (H - ch) / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    ctx.fillStyle = c.light; ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 40); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 40); ctx.clip();
    ctx.fillStyle = c.a; ctx.fillRect(cx, cy, cw, 230);
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = '30px "Archivo Black", "Arial Black", sans-serif';
    ctx.fillText('CARTEIRINHA DE MEMBRO', cx + 60, cy + 85);
    fitText(ctx, CFG.titulo.join(' '), '{s}px Anton, Impact, sans-serif', cw - 120, 96, 40);
    ctx.fillText(CFG.titulo.join(' '), cx + 60, cy + 190);
    const ph = tall ? 560 : 330, pw = ph * 0.8;
    const py = cy + 290;
    drawPhoto(ctx, cx + 60, py, pw, ph, 24);
    ctx.strokeStyle = c.a; ctx.lineWidth = 6; ctx.beginPath(); ctx.roundRect(cx + 60, py, pw, ph, 24); ctx.stroke();
    const tx = cx + 60 + pw + 50, tw = cw - (tx - cx) - 50;
    const field = (label, value, yy, big) => {
      ctx.fillStyle = '#7a7a7a'; ctx.font = '24px "Archivo Black", "Arial Black", sans-serif';
      ctx.fillText(label, tx, yy);
      ctx.fillStyle = c.ink;
      fitText(ctx, value, `{s}px ${big ? '"Permanent Marker", "Marker Felt", cursive' : 'Anton, Impact, sans-serif'}`, tw, big ? 64 : 48, 26);
      ctx.fillText(value, tx, yy + (big ? 70 : 56));
    };
    field('NOME', nome, py + 30, true);
    field('CIDADE', cidade || '—', py + 160);
    field('MEMBRO Nº', num(hash(nome + cidade)), py + 270);
    if (tall) field('MEMBRO DESDE', '25/10/2026', py + 380);
    if (tall) field('STATUS', 'ATIVO E DE PÉ', py + 490);
    const by = py + ph + (tall ? 130 : 80);
    ctx.fillStyle = c.ink; ctx.font = '30px "Archivo Black", "Arial Black", sans-serif';
    ctx.fillText('VALIDADE:', cx + 60, by);
    ctx.fillStyle = c.a; ctx.font = '42px "Permanent Marker", "Marker Felt", cursive';
    ctx.fillText(CFG.validade, cx + 60, by + 60);
    // "código de barras" decorativo
    const bx = cx + 60, bby = cy + ch - 130;
    let r = hash(nome + 'x');
    for (let x = 0; x < cw - 120; x += 0) {
      r = (r * 1103515245 + 12345) & 0x7fffffff;
      const w = 3 + (r % 9);
      if ((r >> 4) % 3) { ctx.fillStyle = c.ink; ctx.fillRect(bx + x, bby, w, 70); }
      x += w + 3;
    }
    ctx.textAlign = 'center';
    ctx.font = '26px "Archivo Black", "Arial Black", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.fillText(CFG.rodape, W / 2, H - 60);
    ctx.textAlign = 'left';
  }

  // ---------- Moldura de perfil ----------
  function moldura(ctx, W) {
    const c = CFG.colors;
    ctx.fillStyle = c.a; ctx.fillRect(0, 0, W, W);
    drawPhoto(ctx, 70, 70, W - 140, W - 140, (W - 140) / 2);
    ctx.lineWidth = 34; ctx.strokeStyle = c.a;
    ctx.beginPath(); ctx.arc(W / 2, W / 2, W / 2 - 70, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = c.b;
    ctx.beginPath(); ctx.arc(W / 2, W / 2, W / 2 - 92, 0, Math.PI * 2); ctx.stroke();
    // faixa
    ctx.save();
    ctx.translate(W / 2, W - 190);
    ctx.rotate(-0.06);
    ctx.fillStyle = c.b; ctx.fillRect(-W / 2 + 40, -70, W - 80, 140);
    ctx.fillStyle = c.dark; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    fitText(ctx, CFG.faixa, '{s}px Anton, Impact, sans-serif', W - 160, 100, 40);
    ctx.fillText(CFG.faixa, 0, 6);
    ctx.restore();
  }

  function render() {
    const nome = ($('#nome').value.trim() || 'Seu Nome Aqui').slice(0, 40);
    const cidade = $('#cidade').value.trim().slice(0, 32);
    const cv = $('#cv');
    cv.width = 1080; cv.height = format === 'story' ? 1920 : 1350;
    const ctx = cv.getContext('2d');
    (CFG.tipo === 'carteirinha' ? carteirinha : certificado)(ctx, cv.width, cv.height, nome, cidade);
    const mv = $('#mv');
    mv.width = mv.height = 1080;
    moldura(mv.getContext('2d'), 1080);
  }

  async function save(canvas, name) {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
    const file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: CFG.nome }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try { await Promise.all(['Anton', 'Permanent Marker', 'Archivo Black'].map((f) => document.fonts.load(`40px "${f}"`))); } catch (e) {}
    $('#nome').addEventListener('input', render);
    $('#cidade').addEventListener('input', render);
    document.querySelectorAll('[data-fmt]').forEach((b) => b.addEventListener('click', () => {
      format = b.dataset.fmt;
      document.querySelectorAll('[data-fmt]').forEach((x) => x.classList.toggle('on', x === b));
      render();
    }));
    $('#foto').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => { photo = img; render(); };
      img.src = URL.createObjectURL(f);
    });
    $('#baixar').addEventListener('click', () => save($('#cv'), `${CFG.tipo}-${format}.png`));
    $('#baixarMoldura').addEventListener('click', () => save($('#mv'), 'foto-de-perfil.png'));
    render();
  });
})();
