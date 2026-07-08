(function () {
  const c = document.getElementById('app');
  const V = {
    home:    new VistaPrincipal(c),
    explore: new VistaExplorar(c),
    detail:  new VistaDetalle(c),
    deptos:  new VistaDepartamentos(c),
    artista: new VistaArtista(c),
    compare: new VistaComparador(c)
  };

  function enrutar() {
    const hash = window.location.hash || '#home';
    const [ruta, param] = hash.split('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (ruta) {
      case '#home':
      case '':
        V.home.renderizar(); break;

      case '#explore': {
        const f = sessionStorage.getItem('filtro-depto');
        if (f) { sessionStorage.removeItem('filtro-depto'); V.explore.renderizar(JSON.parse(f)); }
        else V.explore.renderizar();
        break;
      }
      case '#detail':
        param ? V.detail.renderizar(Number(param)) : (window.location.hash = '#home');
        break;

      case '#departments':
        V.deptos.renderizar(); break;

      case '#artist':
        param ? V.artista.renderizar(param) : (window.location.hash = '#home');
        break;

      case '#compare': {
        const o = sessionStorage.getItem('obra-comp-a');
        if (o) { sessionStorage.removeItem('obra-comp-a'); V.compare.renderizar(JSON.parse(o)); }
        else V.compare.renderizar();
        break;
      }
      default: window.location.hash = '#home';
    }
  }

  window.addEventListener('hashchange', enrutar);
  enrutar();
})();
