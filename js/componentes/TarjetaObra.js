class TarjetaObra extends HTMLElement {
  cargarObra(obra) {
    const wrap = document.createElement('div'); wrap.className = 't-img-wrap';
    if (obra.primaryImageSmall) {
      const img = document.createElement('img');
      img.className = 't-img'; img.src = obra.primaryImageSmall; img.alt = obra.title || '';
      img.addEventListener('error', () => { wrap.innerHTML = ''; wrap.appendChild(this._placeholder()); });
      wrap.appendChild(img);
    } else { wrap.appendChild(this._placeholder()); }

    // Info
    const info = document.createElement('div'); info.className = 't-info';
    const tit  = document.createElement('p');   tit.className  = 't-titulo'; tit.textContent = obra.title || 'Sin título';
    const art  = document.createElement('p');   art.className  = 't-artista'; art.textContent = obra.artistDisplayName || 'Artista desconocido';
    const meta = document.createElement('p');   meta.className = 't-meta';
    meta.textContent = [obra.objectDate, obra.department].filter(Boolean).join(' · ') || '—';

    info.appendChild(tit); info.appendChild(art); info.appendChild(meta);
    this.appendChild(wrap); this.appendChild(info);
    this.addEventListener('click', () => { window.location.hash = `#detail/${obra.objectID}`; });
  }

  _placeholder() {
    const d = document.createElement('div'); d.className = 't-sin-img';
    const ico = document.createElement('span'); ico.textContent = '🖼';
    const txt = document.createElement('span'); txt.textContent = 'Sin imagen';
    d.appendChild(ico); d.appendChild(txt); return d;
  }
}
customElements.define('tarjeta-obra', TarjetaObra);
