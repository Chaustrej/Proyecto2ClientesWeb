class VistaDetalle {
  constructor(c) { this.c = c; }

  async renderizar(id) {
    this.c.innerHTML = '';
    const w=document.createElement('div'); w.className='v-detalle'; this.c.appendChild(w);
    const spin=document.createElement('estado-carga'); spin.setAttribute('mensaje','Cargando obra…'); w.appendChild(spin);
    try {
      const obra=await API.obtenerObra(id);
      spin.remove(); this._mostrar(w,obra);
    } catch(e) {
      spin.remove();
      const err=document.createElement('estado-error');
      err.configurar(e.codigo===404?'La obra solicitada no existe.':e.message, e.codigo!==404?()=>this.renderizar(id):null);
      w.appendChild(err);
    }
  }

  _mostrar(w, obra) {
    const top=document.createElement('div'); top.className='det-top';
    const bV=document.createElement('button'); bV.className='btn btn-ghost'; bV.textContent='← Volver'; bV.addEventListener('click',()=>history.back());
    top.appendChild(bV); w.appendChild(top);

    const body=document.createElement('div'); body.className='det-body'; w.appendChild(body);

    const colImg=document.createElement('div');
    const urlImg=obra.primaryImage||obra.primaryImageSmall||'';
    if(urlImg){
      const img=document.createElement('img'); img.className='det-img'; img.src=urlImg; img.alt=obra.title||'';
      img.addEventListener('error',()=>{if(obra.primaryImageSmall&&img.src!==obra.primaryImageSmall)img.src=obra.primaryImageSmall;});
      colImg.appendChild(img);
    } else {
      const d=document.createElement('div'); d.className='det-sin-img';
      const i=document.createElement('span'); i.textContent='🖼'; i.style.fontSize='3.5rem'; i.style.opacity='.3';
      const t=document.createElement('span'); t.textContent='Sin imagen'; d.appendChild(i); d.appendChild(t); colImg.appendChild(d);
    }
    if(obra.additionalImages?.length){
      const gal=document.createElement('div'); gal.className='galeria-mini';
      obra.additionalImages.slice(0,8).forEach(url=>{
        const m=document.createElement('img'); m.className='mini-img'; m.src=url; m.alt='';
        m.addEventListener('click',()=>{ if(urlImg){const img=colImg.querySelector('.det-img');if(img){img.src=url;gal.querySelectorAll('.mini-img').forEach(x=>x.classList.remove('activa'));m.classList.add('activa');}} });
        gal.appendChild(m);
      });
      colImg.appendChild(gal);
    }

    // --- Columna info ---
    const colInfo=document.createElement('div');
    const tit=document.createElement('h1'); tit.className='det-tit'; tit.textContent=obra.title||'Sin título';
    const artNom=obra.artistDisplayName||'Artista desconocido';
    const art=document.createElement('p'); art.className='det-artista'; art.textContent=artNom;
    if(obra.artistDisplayName) art.addEventListener('click',()=>{window.location.hash=`#artist/${encodeURIComponent(obra.artistDisplayName)}`;});
    const bio=document.createElement('p'); bio.className='det-bio'; bio.textContent=obra.artistDisplayBio||''; bio.style.display=obra.artistDisplayBio?'block':'none';

    const ficha=document.createElement('div'); ficha.className='ficha';
    [['Fecha',obra.objectDate],['Técnica',obra.medium],['Dimensiones',obra.dimensions],['Departamento',obra.department],['Cultura',obra.culture],['Periodo',obra.period],['Clasificación',obra.classification],['Adquisición',obra.creditLine]].forEach(([lbl,val])=>{
      const f=document.createElement('div'); f.className='ficha-fila';
      const l=document.createElement('span'); l.className='ficha-lbl'; l.textContent=lbl;
      const v=document.createElement('span'); v.className='ficha-val'; v.textContent=val||'—';
      f.appendChild(l); f.appendChild(v); ficha.appendChild(f);
    });

    let tagsEl=null;
    if(obra.tags?.length){
      tagsEl=document.createElement('div'); tagsEl.className='tags-wrap';
      obra.tags.slice(0,12).forEach(t=>{ const e=document.createElement('span'); e.className='etiqueta'; e.textContent=t.term; tagsEl.appendChild(e); });
    }

    const btns=document.createElement('div'); btns.className='det-btns';
    if(obra.artistDisplayName){const b=document.createElement('button');b.className='btn btn-sec';b.textContent=`🎨 Más de ${obra.artistDisplayName}`;b.addEventListener('click',()=>{window.location.hash=`#artist/${encodeURIComponent(obra.artistDisplayName)}`;});btns.appendChild(b);}
    const bComp=document.createElement('button'); bComp.className='btn btn-prim'; bComp.textContent='⚖ Comparar';
    bComp.addEventListener('click',()=>{sessionStorage.setItem('obra-comp-a',JSON.stringify(obra));window.location.hash='#compare';});
    btns.appendChild(bComp);
    if(obra.objectURL){const a=document.createElement('a');a.className='btn btn-ghost';a.href=obra.objectURL;a.target='_blank';a.rel='noopener noreferrer';a.textContent='↗ Ver en el Met';btns.appendChild(a);}

    colInfo.appendChild(tit); colInfo.appendChild(art); colInfo.appendChild(bio); colInfo.appendChild(ficha);
    if(tagsEl) colInfo.appendChild(tagsEl);
    colInfo.appendChild(btns);

    body.appendChild(colImg); body.appendChild(colInfo);
  }
}
