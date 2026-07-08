
class VistaComparador {
  constructor(c) { this.c=c; this.obras={a:null,b:null}; this.panelA=null; this.panelB=null; this.tablaEl=null; }

  renderizar(obraPre=null) {
    this.obras={a:obraPre,b:null}; this.c.innerHTML='';
    const w=document.createElement('div'); w.className='v-comp'; this.c.appendChild(w);
    const h=document.createElement('h1'); h.className='sec-tit'; h.textContent='⚖ Comparador de obras'; w.appendChild(h);
    const s=document.createElement('p'); s.className='sec-sub'; s.textContent='Selecciona dos obras para compararlas lado a lado.'; w.appendChild(s);
    const paneles=document.createElement('div'); paneles.className='comp-paneles'; w.appendChild(paneles);
    this.tablaEl=document.createElement('div'); w.appendChild(this.tablaEl);
    this.panelA=this._crearPanel('a',obraPre); paneles.appendChild(this.panelA.el);
    this.panelB=this._crearPanel('b',null);    paneles.appendChild(this.panelB.el);
    this._checkTabla();
  }

  _crearPanel(letra, obraInicial) {
    const el=document.createElement('div'); el.className=`panel-comp p-${letra}`;
    const lbl=document.createElement('p'); lbl.className='panel-letra'; lbl.textContent=`Obra ${letra.toUpperCase()}`; el.appendChild(lbl);
    const zona=document.createElement('div'); el.appendChild(zona);
    const panel={el,zona,obra:obraInicial};
    obraInicial ? this._mostrarObra(panel,letra,obraInicial) : this._mostrarBuscador(panel,letra);
    return panel;
  }

  _mostrarBuscador(panel,letra) {
    panel.zona.innerHTML=''; panel.obra=null; this.obras[letra]=null;
    const busq=document.createElement('div'); busq.className='mini-busq';
    const lupa=document.createElement('span'); lupa.className='lupa'; lupa.textContent='🔍';
    const inp=document.createElement('input'); inp.type='text'; inp.placeholder='Busca una obra…';
    busq.appendChild(lupa); busq.appendChild(inp); panel.zona.appendChild(busq);
    const res=document.createElement('div'); res.className='mini-res'; panel.zona.appendChild(res);
    const hint=document.createElement('p'); hint.style.cssText='color:var(--gris-clr);font-size:.82rem;text-align:center;padding:1.25rem 0;'; hint.textContent='Escribe para buscar obras.'; res.appendChild(hint);
    let t;
    inp.addEventListener('input',()=>{
      clearTimeout(t);
      if(inp.value.trim().length<2){res.innerHTML='';res.appendChild(hint);return;}
      t=setTimeout(()=>this._buscarEnPanel(inp.value.trim(),letra,res,panel),400);
    });
  }

  async _buscarEnPanel(q,letra,res,panel) {
    res.innerHTML='';
    const sp=document.createElement('span'); sp.className='mini-spin'; res.appendChild(sp);
    try {
      const {ids}=await API.buscar(q,{soloConImagen:true}); sp.remove();
      if(!ids.length){const p=document.createElement('p');p.style.cssText='color:var(--gris-clr);font-size:.82rem;text-align:center;padding:1rem 0;';p.textContent='Sin resultados.';res.appendChild(p);return;}
      const {obras}=await API.resolverIds(ids.slice(0,6));
      obras.forEach(o=>{res.appendChild(this._miniCard(o,letra,panel));});
    } catch(e) {
      sp.remove();
      const p=document.createElement('p');p.style.cssText='color:var(--terracota);font-size:.8rem;text-align:center;padding:.75rem';p.textContent=`Error: ${e.message}`;res.appendChild(p);
      const bR=document.createElement('button');bR.className='btn btn-ghost';bR.style='display:block;margin:.5rem auto';bR.textContent='↩ Reintentar';bR.addEventListener('click',()=>this._buscarEnPanel(q,letra,res,panel));res.appendChild(bR);
    }
  }

  _miniCard(obra,letra,panel) {
    const otraLetra=letra==='a'?'b':'a';
    const enOtro=this.obras[otraLetra]?.objectID===obra.objectID;
    const card=document.createElement('div'); card.className='mini-card'+(enOtro?' disabled':'');
    const img=document.createElement('img'); img.className='mini-card-img'; img.src=obra.primaryImageSmall||''; img.alt='';
    const info=document.createElement('div');
    const tit=document.createElement('p'); tit.className='mini-card-tit'; tit.textContent=obra.title||'Sin título';
    const art=document.createElement('p'); art.className='mini-card-art'; art.textContent=obra.artistDisplayName||'—';
    info.appendChild(tit); info.appendChild(art);
    if(enOtro){const a=document.createElement('p');a.className='mini-card-aviso';a.textContent='Ya en el otro panel';info.appendChild(a);}
    else{card.addEventListener('click',()=>{this.obras[letra]=obra;panel.obra=obra;this._mostrarObra(panel,letra,obra);this._checkTabla();});}
    card.appendChild(img); card.appendChild(info); return card;
  }

  _mostrarObra(panel,letra,obra) {
    panel.zona.innerHTML='';
    const d=document.createElement('div'); d.className='obra-sel';
    const img=document.createElement('img'); img.src=obra.primaryImageSmall||obra.primaryImage||''; img.alt=obra.title||'';
    const tit=document.createElement('p'); tit.className='obra-sel-tit'; tit.textContent=obra.title||'Sin título';
    const art=document.createElement('p'); art.className='obra-sel-art'; art.textContent=obra.artistDisplayName||'—';
    const btn=document.createElement('button'); btn.className='btn btn-ghost'; btn.textContent='↩ Cambiar';
    btn.addEventListener('click',()=>{this.obras[letra]=null;this._mostrarBuscador(panel,letra);this._checkTabla();});
    d.appendChild(img); d.appendChild(tit); d.appendChild(art); d.appendChild(btn); panel.zona.appendChild(d);
  }

  _checkTabla() {
    this.tablaEl.innerHTML='';
    if(this.obras.a && this.obras.b) this._construirTabla();
  }

  _construirTabla() {
    const t=document.createElement('div'); t.className='tabla-comp';
    const h=document.createElement('div'); h.className='tabla-head';
    ['Campo','Obra A','Obra B'].forEach(txt=>{const s=document.createElement('span');s.textContent=txt;h.appendChild(s);});
    t.appendChild(h);
    const oA=this.obras.a, oB=this.obras.b;
    const campos=[['Artista',oA.artistDisplayName,oB.artistDisplayName],['Año',oA.objectEndDate||oA.objectBeginDate,oB.objectEndDate||oB.objectBeginDate],['Departamento',oA.department,oB.department],['Técnica',oA.medium,oB.medium],['Clasificación',oA.classification,oB.classification],['Cultura',oA.culture,oB.culture],['¿Destacada?',oA.isHighlight?'Sí':'No',oB.isHighlight?'Sí':'No'],['¿Dom. público?',oA.isPublicDomain?'Sí':'No',oB.isPublicDomain?'Sí':'No']];
    campos.forEach(([lbl,vA,vB])=>{
      const tA=vA||'—', tB=vB||'—', diff=tA!==tB&&tA!=='—'&&tB!=='—';
      const f=document.createElement('div'); f.className='tabla-fila'+(diff?' diff':'');
      const l=document.createElement('span');l.className='f-lbl';l.textContent=lbl;
      const a=document.createElement('span');a.className='f-val';a.textContent=tA;
      const b=document.createElement('span');b.className='f-val';b.textContent=tB;
      f.appendChild(l);f.appendChild(a);f.appendChild(b);t.appendChild(f);
    });
 
    const aA=oA.objectEndDate||oA.objectBeginDate, aB=oB.objectEndDate||oB.objectBeginDate;
    if(aA&&aB){
      const d=document.createElement('div');d.className='diff-anios';
      d.appendChild(document.createTextNode('Diferencia entre obras: '));
      const s=document.createElement('strong');s.textContent=`${Math.abs(aA-aB).toLocaleString('es-ES')} años`;
      d.appendChild(s); t.appendChild(d);
    }
    this.tablaEl.appendChild(t);
    this.tablaEl.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}
