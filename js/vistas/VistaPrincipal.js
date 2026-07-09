class VistaPrincipal {
  constructor(c) { this.c = c; }

  async renderizar() {
    this.c.innerHTML = '';
    this._hero();
    const statsEl = this._statsEsqueleto();
    this.c.appendChild(statsEl);
    const div = document.createElement('div'); div.className = 'sep'; this.c.appendChild(div);
    const gal = document.createElement('div'); gal.className = 'sec-galeria'; this.c.appendChild(gal);
    const h2 = document.createElement('h2'); h2.className = 'sec-tit'; h2.textContent = 'Obras destacadas';
    const sub = document.createElement('p'); sub.className = 'sec-sub'; sub.textContent = 'Una selección de piezas representativas de la colección.';
    const spin = document.createElement('estado-carga'); spin.setAttribute('mensaje','Cargando destacadas…');
    gal.appendChild(h2); gal.appendChild(sub); gal.appendChild(spin);

    await Promise.all([this._cargarStats(statsEl), this._cargarGaleria(gal, spin)]);
  }

  _hero() {
    const hero = document.createElement('section'); hero.className = 'hero';
    const int  = document.createElement('div');     int.className  = 'hero-int';
    const badge = document.createElement('span');   badge.className = 'hero-badge'; badge.textContent = '✦ Colección abierta · +470,000 obras';
    const tit  = document.createElement('h1');      tit.className  = 'hero-tit';
    tit.appendChild(document.createTextNode('Explora la colección del '));
    const em = document.createElement('em'); em.textContent = 'Met Museum'; tit.appendChild(em);
    const desc = document.createElement('p'); desc.className = 'hero-desc';
    desc.textContent = 'Más de 470,000 obras de todas las épocas y culturas, disponibles a través de la Open Access API del Metropolitan Museum of Art.';
    const btns = document.createElement('div'); btns.className = 'hero-btns';
    const b1 = document.createElement('a'); b1.className = 'btn btn-prim'; b1.href = '#explore'; b1.textContent = '🔍 Explorar';
    const b2 = document.createElement('a'); b2.className = 'btn btn-ghost'; b2.href = '#departments'; b2.style.color = 'rgba(245,240,232,.7)'; b2.textContent = '🏛 Departamentos';
    btns.appendChild(b1); btns.appendChild(b2);
    int.appendChild(badge); int.appendChild(tit); int.appendChild(desc); int.appendChild(btns);
    hero.appendChild(int); this.c.appendChild(hero);
  }

  _statsEsqueleto() {
    const sec = document.createElement('section'); sec.className = 'stats';
    [['stat-deptos','Departamentos'],['stat-dest','Destacadas con imagen'],['stat-total','Obras en la colección']].forEach(([id,lbl]) => {
      const card = document.createElement('div'); card.className = 'stat-card';
      const n = document.createElement('div'); n.className = 'stat-n'; n.id = id; n.textContent = '…';
      const l = document.createElement('p');   l.className = 'stat-l';  l.textContent = lbl;
      card.appendChild(n); card.appendChild(l); sec.appendChild(card);
    });
    return sec;
  }

  async _cargarStats(sec) {
    try {
      const [deptos, dest] = await Promise.all([API.obtenerDepartamentos(), API.buscar('*',{soloDestacadas:true,soloConImagen:true})]);
      const d = document.getElementById('stat-deptos'); if(d) d.textContent = deptos.length;
      const s = document.getElementById('stat-dest');   if(s) s.textContent = dest.total.toLocaleString('es-ES');
      const t = document.getElementById('stat-total');  if(t) t.textContent = '470,000+';
    } catch {} 
  }

  async _cargarGaleria(sec, spin) {
    try {
      const { ids } = await API.buscar('*',{soloDestacadas:true,soloConImagen:true});
      const { obras, fallidas } = await API.resolverIds(ids.slice(0,12));
      spin.remove();
      if (!obras.length) { const e = document.createElement('estado-error'); e.configurar('No se pudieron cargar las obras.', () => this.renderizar()); sec.appendChild(e); return; }
      const grid = document.createElement('div'); grid.className = 'grid-obras';
      obras.forEach(o => { const t = document.createElement('tarjeta-obra'); t.cargarObra(o); grid.appendChild(t); });
      sec.appendChild(grid);
      if (fallidas) { const p = document.createElement('p'); p.style.cssText='color:var(--gris-clr);font-size:.75rem;margin-top:.75rem;text-align:center'; p.textContent=`${fallidas} obra(s) omitidas.`; sec.appendChild(p); }
    } catch(e) {
      spin.remove();
      const err = document.createElement('estado-error'); err.configurar(e.message, () => this.renderizar()); sec.appendChild(err);
    }
  }
}
