class VistaDepartamentos {
  constructor(c) { this.c = c; }

  _estilo(nombre) {
    const estilos=['#C4603A','#4A6741','#2D3A6B','#8B5E3C','#6B4A8B','#3A6B5E','#8B3A3A','#5E6B3A','#3A4A6B','#6B3A5E','#3A8B6B','#6B5E3A','#4A3A6B','#8B6B3A','#3A6B4A','#5E3A6B','#6B3A4A','#3A5E6B'];
    const iconos=['🏺','⚱️','🗿','⚔️','🎎','🖼️','🏛️','🎨','📸','👗','🎸','🗡️','📜','💎','🏹','🌙','🎭','📚'];
    const i=nombre.charCodeAt(0)%iconos.length;
    return { color:estilos[i], icono:iconos[i] };
  }

  async renderizar() {
    this.c.innerHTML = '';
    const w=document.createElement('div'); w.className='v-deptos'; this.c.appendChild(w);
    const h=document.createElement('h1'); h.className='sec-tit'; h.textContent='Departamentos'; w.appendChild(h);
    const s=document.createElement('p');  s.className='sec-sub'; s.textContent='Las 19 áreas curatoriales del museo. Haz clic en una para explorar sus obras.'; w.appendChild(s);
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje','Cargando departamentos…'); w.appendChild(spin);
    try {
      const deptos=await API.obtenerDepartamentos(); spin.remove();
      const grid=document.createElement('div'); grid.className='grid-deptos';
      deptos.forEach(d=>{
        const {color,icono}=this._estilo(d.displayName);
        const card=document.createElement('div'); card.className='card-depto'; card.style.setProperty('--color-d',color);
        const i=document.createElement('span'); i.className='depto-ico'; i.textContent=icono;
        const n=document.createElement('p');   n.className='depto-nom'; n.textContent=traducirDepto(d.displayName);
        card.appendChild(i); card.appendChild(n);
        card.addEventListener('click',()=>{sessionStorage.setItem('filtro-depto',JSON.stringify({departamentoId:d.departmentId}));window.location.hash='#explore';});
        grid.appendChild(card);
      });
      w.appendChild(grid);
    } catch(e) {
      spin.remove();
      const err=document.createElement('estado-error'); err.configurar(e.message,()=>this.renderizar()); w.appendChild(err);
    }
  }
}


class VistaArtista {
  constructor(c) { this.c=c; this.est={nombre:'',ids:[],pag:1,tam:12}; }

  async renderizar(nombreCod) {
    const nombre=decodeURIComponent(nombreCod);
    this.est.nombre=nombre; this.est.pag=1;
    this.c.innerHTML='';
    const w=document.createElement('div'); w.className='v-artista'; this.c.appendChild(w);
    const bV=document.createElement('button'); bV.className='btn btn-ghost'; bV.style.marginBottom='1.75rem'; bV.textContent='← Volver'; bV.addEventListener('click',()=>history.back()); w.appendChild(bV);
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje',`Cargando obras de ${nombre}…`); w.appendChild(spin);
    try {
      const {total,ids}=await API.buscar(nombre,{artistaOCultura:true}); spin.remove();
      const cab=document.createElement('div'); cab.className='artista-cab';
      const av=document.createElement('div'); av.className='artista-avatar'; av.textContent=nombre.charAt(0).toUpperCase();
      const info=document.createElement('div');
      const nom=document.createElement('h1'); nom.className='artista-nom'; nom.textContent=nombre;
      this.elBio=document.createElement('p'); this.elBio.className='artista-bio'; this.elBio.style.display='none';
      const tot=document.createElement('p'); tot.className='artista-total'; tot.textContent=`${total.toLocaleString('es-ES')} obra(s) en la colección`;
      info.appendChild(nom); info.appendChild(this.elBio); info.appendChild(tot);
      cab.appendChild(av); cab.appendChild(info); w.appendChild(cab);

      if(!ids.length){const d=document.createElement('div');d.className='sin-res';const p=document.createElement('p');p.textContent='No hay obras de este artista en la colección.';d.appendChild(p);w.appendChild(d);return;}
      this.est.ids=ids;
      this.zonaGal=document.createElement('div'); w.appendChild(this.zonaGal);
      await this._renderPagina();
    } catch(e) {
      spin.remove(); const err=document.createElement('estado-error'); err.configurar(e.message,()=>this.renderizar(nombreCod)); w.appendChild(err);
    }
  }

  async _renderPagina() {
    this.zonaGal.innerHTML='';
    const {pag,tam,ids}=this.est, tot=Math.ceil(ids.length/tam);
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje',`Página ${pag}…`); this.zonaGal.appendChild(spin);
    const {obras}=await API.resolverIds(ids.slice((pag-1)*tam,pag*tam)); spin.remove();
    if(obras.length && obras[0].artistDisplayBio && this.elBio.style.display==='none'){this.elBio.textContent=obras[0].artistDisplayBio;this.elBio.style.display='block';}
    const grid=document.createElement('div'); grid.className='grid-obras';
    obras.forEach(o=>{const t=document.createElement('tarjeta-obra');t.cargarObra(o);grid.appendChild(t);});
    this.zonaGal.appendChild(grid);
    if(tot>1){
      const pag2=document.createElement('div'); pag2.className='paginacion';
      const bA=document.createElement('button'); bA.className='btn btn-ghost'; bA.textContent='← Ant.'; bA.disabled=pag===1; bA.addEventListener('click',()=>{this.est.pag--;this._renderPagina();});
      const inf=document.createElement('span'); inf.className='pag-info'; inf.textContent=`${pag}/${tot}`;
      const bS=document.createElement('button'); bS.className='btn btn-ghost'; bS.textContent='Sig. →'; bS.disabled=pag===tot; bS.addEventListener('click',()=>{this.est.pag++;this._renderPagina();});
      pag2.appendChild(bA); pag2.appendChild(inf); pag2.appendChild(bS); this.zonaGal.appendChild(pag2);
    }
  }
}
