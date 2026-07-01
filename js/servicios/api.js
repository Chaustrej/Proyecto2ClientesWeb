const API = (() => {
  const BASE = 'https://collectionapi.metmuseum.org/public/collection/v1';
  const TIMEOUT = 20_000;
  const PAUSA_TRAS_BLOQUEO = 2 * 60_000; 
  let bloqueadoHasta = 0;
  async function obtener(ruta) {
    if (Date.now() < bloqueadoHasta) {
      const restante = Math.ceil((bloqueadoHasta - Date.now()) / 1000);
      const e = new Error(`El servidor del museo está limitando las peticiones por exceso de solicitudes. Espera ~${restante}s e inténtalo de nuevo.`);
      e.codigo = 403;
      throw e;
    }
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), TIMEOUT);
    try {
      const res = await fetch(`${BASE}${ruta}`, { signal: ctrl.signal });
      clearTimeout(id);
      if (res.status === 403) {
        bloqueadoHasta = Date.now() + PAUSA_TRAS_BLOQUEO;
        const e = new Error('El servidor del museo bloqueó temporalmente las peticiones por exceso de solicitudes. Espera unos minutos e inténtalo de nuevo.');
        e.codigo = 403;
        throw e;
      }
      if (!res.ok) { const e = new Error(`HTTP ${res.status}`); e.codigo = res.status; throw e; }
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado.');
      throw e;
    }
  }

  async function obtenerDepartamentos() {
    const d = await obtener('/departments');
    return d.departments;
  }


  async function buscar(q, f = {}) {
    const p = new URLSearchParams({ q: q || '*' });
    if (f.departamentoId)  p.set('departmentId', f.departamentoId);
    if (f.soloDestacadas)  p.set('isHighlight', 'true');
    if (f.soloConImagen)   p.set('hasImages', 'true');
    if (f.artistaOCultura) p.set('artistOrCulture', 'true');
    if (f.anioInicio)      p.set('dateBegin', f.anioInicio);
    if (f.anioFin)         p.set('dateEnd', f.anioFin);
    const d = await obtener(`/search?${p}`);
    return { total: d.total || 0, ids: d.objectIDs || [] };
  }


  async function obtenerObra(id) { return obtener(`/objects/${id}`); }

  async function resolverIds(ids, tamLote = 3, esperaMs = 350) {
    const obras = [];
    let fallidas = 0;
    for (let i = 0; i < ids.length; i += tamLote) {
      const lote = ids.slice(i, i + tamLote);
      const res = await Promise.allSettled(lote.map(id => obtenerObra(id)));
      let bloqueado = false;
      res.forEach(r => {
        if (r.status === 'fulfilled') obras.push(r.value);
        else { fallidas++; if (r.reason && r.reason.codigo === 403) bloqueado = true; }
      });
      if (bloqueado) break; 
      if (i + tamLote < ids.length) await new Promise(r => setTimeout(r, esperaMs));
    }
    return { obras, fallidas };
  }

  return { obtenerDepartamentos, buscar, obtenerObra, resolverIds };
})();
