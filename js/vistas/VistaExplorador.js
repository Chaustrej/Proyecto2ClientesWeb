class VistaExplorar {
  constructor(c) {
    this.c = c;
    this.est = { q:'*', deptoId:'', anioIni:-5000, anioFin:new Date().getFullYear(), destac:false, imagen:false, pag:1, tam:12, ids:[], total:0 };
    this.deptos = [];
    this._token = 0; 
  }

  async renderizar(filtros = {}) {
    this._token++;
    Object.assign(this.est, filtros);
    this.c.innerHTML = '';
    const w = document.createElement('div'); w.className = 'v-explorar'; this.c.appendChild(w);
    const enc = document.createElement('div'); enc.className = 'sec-tit'; enc.textContent = 'Explorar colección'; w.appendChild(enc);
    const sub = document.createElement('p'); sub.className = 'sec-sub'; sub.textContent = 'Filtra y descubre obras de todas las épocas y culturas.'; w.appendChild(sub);
    const body = document.createElement('div'); body.className = 'explorar-body'; w.appendChild(body);
    const lateral = document.createElement('div');
    const filtrosEl = await this._construirFiltros();
    lateral.appendChild(filtrosEl);
    this.elAgg = document.createElement('div'); this.elAgg.className = 'panel-agg'; lateral.appendChild(this.elAgg);
    this.zonaRes = document.createElement('div'); this.zonaRes.className = 'zona-res';
    body.appendChild(lateral); body.appendChild(this.zonaRes);
    await this._buscar();
  }

  async _construirFiltros() {
    const p = document.createElement('div'); p.className = 'panel-filtros';
    const h = document.createElement('h3'); h.textContent = '⚙ Filtros'; p.appendChild(h);

    const gB = this._grupo('Buscar');
    const inp = document.createElement('input'); inp.type='text'; inp.placeholder='Ej: Monet, Egyptian, vase…'; inp.value = this.est.q==='*'?'':this.est.q;
    let tB; inp.addEventListener('input', () => { clearTimeout(tB); tB=setTimeout(()=>{ this.est.q=inp.value.trim()||'*'; this.est.pag=1; this._buscar(); },450); });
    gB.querySelector('label').after(inp); p.appendChild(gB);

    try { this.deptos = await API.obtenerDepartamentos(); } catch { this.deptos=[]; }
    const gD = this._grupo('Departamento');
    const sel = document.createElement('select');
    const optT = document.createElement('option'); optT.value=''; optT.textContent='Todos'; sel.appendChild(optT);
    this.deptos.forEach(d => { const o=document.createElement('option'); o.value=d.departmentId; o.textContent=traducirDepto(d.displayName); if(String(d.departmentId)===String(this.est.deptoId)) o.selected=true; sel.appendChild(o); });
    sel.addEventListener('change', ()=>{ this.est.deptoId=sel.value; this.est.pag=1; this._buscar(); });
    gD.querySelector('label').after(sel); p.appendChild(gD);

    const gA = this._grupo('Rango de años'); gA.querySelector('label').after(this._slider()); p.appendChild(gA);

    p.appendChild(this._check('Solo destacadas', this.est.destac, v=>{this.est.destac=v;this.est.pag=1;this._buscar();}));
    p.appendChild(this._check('Solo con imagen', this.est.imagen, v=>{this.est.imagen=v;this.est.pag=1;this._buscar();}));

    const btnL = document.createElement('button'); btnL.className='btn btn-ghost'; btnL.style='width:100%;margin-top:.75rem'; btnL.textContent='✕ Limpiar filtros';
    btnL.addEventListener('click', ()=>{ Object.assign(this.est,{q:'*',deptoId:'',anioIni:-5000,anioFin:new Date().getFullYear(),destac:false,imagen:false,pag:1}); this.renderizar(); });
    p.appendChild(btnL);
    return p;
  }

  _grupo(label) {
    const d=document.createElement('div'); d.className='f-grupo';
    const l=document.createElement('label'); l.textContent=label; d.appendChild(l); return d;
  }

  _check(txt, val, fn) {
    const lbl=document.createElement('label'); lbl.className='f-check';
    const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=val;
    const sp=document.createElement('span'); sp.textContent=txt;
    chk.addEventListener('change',()=>fn(chk.checked)); lbl.appendChild(chk); lbl.appendChild(sp); return lbl;
  }

  _slider() {
    const MIN=-5000, MAX=new Date().getFullYear();
    const w=document.createElement('div'); w.className='slider-wrap';
    const vals=document.createElement('div'); vals.className='slider-vals';
    const lMin=document.createElement('span'); const lMax=document.createElement('span');
    vals.appendChild(lMin); vals.appendChild(lMax);
    const pista=document.createElement('div'); pista.className='slider-pista';
    const fill=document.createElement('div'); fill.className='slider-fill'; pista.appendChild(fill);
    const iMin=document.createElement('input'); iMin.type='range'; iMin.min=MIN; iMin.max=MAX; iMin.value=this.est.anioIni; iMin.style.zIndex='2';
    const iMax=document.createElement('input'); iMax.type='range'; iMax.min=MIN; iMax.max=MAX; iMax.value=this.est.anioFin; iMax.style.zIndex='1';
    pista.appendChild(iMin); pista.appendChild(iMax);
    const _fmt = a => a<0?`${Math.abs(a)} a.C.`:String(a);
    const _upd = () => {
      const rng=MAX-MIN, iz=((iMin.value-MIN)/rng)*100, dr=((iMax.value-MIN)/rng)*100;
      fill.style.left=`${iz}%`; fill.style.width=`${dr-iz}%`;
      lMin.textContent=_fmt(+iMin.value); lMax.textContent=_fmt(+iMax.value);
    };
    let tS;
    [iMin,iMax].forEach(i=>i.addEventListener('input',()=>{
      if(+iMin.value>+iMax.value) iMin.value=iMax.value;
      _upd(); clearTimeout(tS); tS=setTimeout(()=>{this.est.anioIni=+iMin.value;this.est.anioFin=+iMax.value;this.est.pag=1;this._buscar();},600);
    }));
    _upd(); w.appendChild(vals); w.appendChild(pista); return w;
  }

  async _buscar() {
    const miToken = ++this._token;
    this.zonaRes.innerHTML = '';
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje','Buscando…'); this.zonaRes.appendChild(spin);
    try {
      const { total, ids } = await API.buscar(this.est.q, { departamentoId:this.est.deptoId, soloDestacadas:this.est.destac, soloConImagen:this.est.imagen, anioInicio:this.est.anioIni!==-5000?this.est.anioIni:undefined, anioFin:this.est.anioFin!==new Date().getFullYear()?this.est.anioFin:undefined });
      if (miToken !== this._token) return; // ya hay una búsqueda más nueva en curso
      this.est.total=total; this.est.ids=ids;
      spin.remove();
      if (!ids.length) { this._actualizarAgg([]); this._sinRes(); return; }
      await this._renderPagina(miToken);
    } catch(e) {
      if (miToken !== this._token) return;
      spin.remove();
      const err=document.createElement('estado-error'); err.configurar(e.message,()=>this._buscar()); this.zonaRes.appendChild(err);
    }
  }

  async _renderPagina(miToken = this._token) {
    this.zonaRes.innerHTML = '';
    const {pag,tam,ids,total}=this.est, totPags=Math.ceil(ids.length/tam);
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje',`Página ${pag}…`); this.zonaRes.appendChild(spin);
    try {
      const {obras,fallidas}=await API.resolverIds(ids.slice((pag-1)*tam,pag*tam));
      if (miToken !== this._token) return;
      spin.remove();
      this._actualizarAgg(obras);

      const cab=document.createElement('div'); cab.className='res-cab';
      const inf=document.createElement('p'); inf.className='res-total'; inf.textContent=`${total.toLocaleString('es-ES')} resultados · pág. ${pag}/${totPags}`;
      cab.appendChild(inf); this.zonaRes.appendChild(cab);

      const grid=document.createElement('div'); grid.className='grid-obras';
      obras.forEach(o=>{const t=document.createElement('tarjeta-obra');t.cargarObra(o);grid.appendChild(t);});
      this.zonaRes.appendChild(grid);
      if(fallidas){const p=document.createElement('p');p.style.cssText='color:var(--gris-clr);font-size:.75rem;margin-top:.65rem;text-align:center';p.textContent=`${fallidas} obra(s) omitidas.`;this.zonaRes.appendChild(p);}
      if(totPags>1) this.zonaRes.appendChild(this._paginacion(pag,totPags));
    } catch(e) {
      if (miToken !== this._token) return;
      spin.remove();
      const err=document.createElement('estado-error'); err.configurar(e.message,()=>this._renderPagina(miToken)); this.zonaRes.appendChild(err);
    }
  }

  _paginacion(pag,tot) {
    const d=document.createElement('div'); d.className='paginacion';
    const bA=document.createElement('button'); bA.className='btn btn-ghost'; bA.textContent='← Ant.'; bA.disabled=pag===1;
    bA.addEventListener('click',()=>{this.est.pag--;this._renderPagina();this.c.scrollIntoView({behavior:'smooth'});});
    const inf=document.createElement('span'); inf.className='pag-info'; inf.textContent=`${pag} / ${tot}`;
    const bS=document.createElement('button'); bS.className='btn btn-ghost'; bS.textContent='Sig. →'; bS.disabled=pag===tot;
    bS.addEventListener('click',()=>{this.est.pag++;this._renderPagina();this.c.scrollIntoView({behavior:'smooth'});});
    d.appendChild(bA); d.appendChild(inf); d.appendChild(bS); return d;
  }

  _sinRes() {
    const d=document.createElement('div'); d.className='sin-res';
    const i=document.createElement('div'); i.className='ico'; i.textContent='🔍';
    const p=document.createElement('p'); p.textContent='Sin resultados con estos filtros.';
    d.appendChild(i); d.appendChild(p); this.zonaRes.appendChild(d);
  }

  _actualizarAgg(obras) {
    const el=this.elAgg; el.innerHTML='';
    const h=document.createElement('h3'); h.textContent='📊 Agregados'; el.appendChild(h);
    const _moda=arr=>{if(!arr.length)return'—';const f={};let mx=0,r=arr[0];for(const v of arr){f[v]=(f[v]||0)+1;if(f[v]>mx){mx=f[v];r=v;}}return r||'—';};
    const deptoDom   = _moda(obras.map(o=>o.department).filter(Boolean));
    const siglo      = _moda(obras.map(o=>o.objectBeginDate).filter(v=>v!=null).map(a=>{const s=Math.ceil(Math.abs(a)/100);return a<0?`s.${s} a.C.`:`s.${s}`;}));
    const cultura    = _moda(obras.map(o=>o.culture).filter(Boolean));
    const filas = [['Total resultados',this.est.total.toLocaleString('es-ES')],['Cargadas (pág.)',obras.length],['Depto. dominante',deptoDom],['Siglo frecuente',siglo],['Cultura frecuente',cultura]];
    filas.forEach(([lbl,val])=>{
      const f=document.createElement('div'); f.className='agg-fila';
      const l=document.createElement('span'); l.className='agg-lbl'; l.textContent=lbl;
      const v=document.createElement('span'); v.className='agg-val'; v.textContent=val;
      f.appendChild(l); f.appendChild(v); el.appendChild(f);
    });
    const n=document.createElement('p'); n.className='agg-nota'; n.textContent='* Calculados sobre los visibles. Total es el resultado completo de búsqueda.'; el.appendChild(n);
  }
}
