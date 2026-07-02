class BarraNav extends HTMLElement {
  connectedCallback() {
    if (this._construido) return;
    this._construido = true;

    const i = document.createElement('div');
    i.className = 'nav-int';


    const logo = document.createElement('a');
    logo.className = 'nav-logo';
    logo.href = '#home';
    logo.innerHTML = 'Met<span>Hub</span>';

    const ul = document.createElement('ul');
    ul.className = 'nav-links';
    [['#explore','Explorar'],['#departments','Departamentos'],['#compare','Comparar']].forEach(([href, txt]) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'nav-a'; a.href = href; a.textContent = txt;
      li.appendChild(a); ul.appendChild(li);
    });

    i.appendChild(logo); i.appendChild(ul);
    this.appendChild(i);
    window.addEventListener('hashchange', () => this._marcarActivo());
    this._marcarActivo();
  }

  _marcarActivo() {
    const ruta = window.location.hash.split('/')[0];
    this.querySelectorAll('.nav-a').forEach(a => a.classList.toggle('activo', a.getAttribute('href') === ruta));
  }
}
customElements.define('barra-nav', BarraNav);

class PiePagina extends HTMLElement {
  connectedCallback() {
    if (this._construido) return;
    this._construido = true;
    const d = document.createElement('div');
    d.className = 'pie-int';
    d.innerHTML = `<p>Desarrollado por <strong>Juan Chaustre</strong> y <strong>Nestor Rincon</strong> · ${new Date().getFullYear()}</p><p>Datos provistos por la Open Access API del Metropolitan Museum of Art. Esta aplicación no está afiliada al museo.</p>`;
    this.appendChild(d);
  }
}
customElements.define('pie-pagina', PiePagina);

/* --- Estado de carga --- */
class EstadoCarga extends HTMLElement {
  connectedCallback() {
    if (this._construido) return;
    this._construido = true;
    const spin = document.createElement('div'); spin.className = 'spinner';
    const txt  = document.createElement('p');   txt.className = 'carga-txt';
    txt.textContent = this.getAttribute('mensaje') || 'Cargando…';
    this.appendChild(spin); this.appendChild(txt);
  }
}
customElements.define('estado-carga', EstadoCarga);

class EstadoError extends HTMLElement {
  constructor() { super(); }

  configurar(msg, onReintento = null) {
    this.innerHTML = '';
    const ico = document.createElement('span'); ico.className = 'err-ico'; ico.textContent = '⚠️';
    const tit = document.createElement('p');   tit.className = 'err-tit'; tit.textContent = 'Algo salió mal';
    const desc = document.createElement('p');  desc.className = 'err-msg'; desc.textContent = msg || 'No se pudo cargar.';
    this.appendChild(ico); this.appendChild(tit); this.appendChild(desc);
    if (typeof onReintento === 'function') {
      const btn = document.createElement('button');
      btn.className = 'btn btn-prim'; btn.textContent = '↩ Reintentar';
      btn.addEventListener('click', onReintento);
      this.appendChild(btn);
    }
  }
}
customElements.define('estado-error', EstadoError);

const TRADUCCION_DEPTOS = {
  'American Decorative Arts': 'Artes Decorativas Americanas',
  'Ancient West Asian Art': 'Arte del Cercano Oriente Antiguo',
  'Arms and Armor': 'Armas y Armaduras',
  'Arts of Africa, Oceania, and the Americas': 'Arte de África, Oceanía y América',
  'Asian Art': 'Arte Asiático',
  'The Cloisters': 'Los Claustros',
  'The Costume Institute': 'Instituto del Vestido',
  'Drawings and Prints': 'Dibujos y Grabados',
  'Egyptian Art': 'Arte Egipcio',
  'European Paintings': 'Pintura Europea',
  'European Sculpture and Decorative Arts': 'Escultura Europea y Artes Decorativas',
  'Greek and Roman Art': 'Arte Griego y Romano',
  'Islamic Art': 'Arte Islámico',
  'The Robert Lehman Collection': 'Colección Robert Lehman',
  'The Libraries': 'Bibliotecas',
  'Medieval Art': 'Arte Medieval',
  'Modern and Contemporary Art': 'Arte Moderno y Contemporáneo',
  'Musical Instruments': 'Instrumentos Musicales',
  'Photographs': 'Fotografías',
  'The American Wing': 'Ala Americana'
};
function traducirDepto(nombre) {
  return TRADUCCION_DEPTOS[nombre] || nombre;
}
