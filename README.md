# 🏛 MetHub — Explorador del Met Museum

Aplicación web que consume la **Open Access API** del Metropolitan Museum of Art para explorar, filtrar, comparar y ver en detalle más de 470,000 obras de la colección.

## Integrantes
| Integrante | Responsabilidades |
|---|---|
| **Juan Chaustre** | api.js, globales.js, vistaexplorador.js, vistacomparador.js, vistaDetalle.js|
| **Nestor Rincon** |tarjetadeobra.js,vistaprincipal.js,vistaDepartamentos.js,app.js|
| **Ambos** | estilos.css, README.md |

## Ejecutar
⚠️ **No abrir `index.html` con doble clic.** El API del museo bloquea peticiones hechas desde el origen `file://`. Hay que servir el proyecto con un servidor local:
- **VS Code:** extensión "Live Server" → clic derecho en `index.html` → *Open with Live Server*.

Sin dependencias ni instalación adicional (no usa `npm`, no hay build).
## Estructura de carpetas
```
index.html
css/
  estilos.css
js/
  servicios/
    api.js              → toda la comunicación con el API del Met
  componentes/
    Globales.js          → BarraNav, PiePagina, EstadoCarga, EstadoError, traducción de departamentos
    TarjetaObra.js        → <tarjeta-obra>, tarjeta reutilizable de una obra
  vistas/
    VistaPrincipal.js     
    VistaExplorar.js     
    VistaDetalle.js        
    VistaDepartamentos.js 
    VistaArtista.js        
    VistaComparador.js    
  app.js                  →
```

## Componentes
| Componente | Descripción |
|---|---|
| `<barra-nav>` | Barra fija con logo y navegación. Marca el enlace activo según el hash. |
| `<pie-pagina>` | Créditos y aviso de fuente de datos. |
| `<estado-carga>` | Spinner animado con mensaje personalizable (atributo `mensaje`). |
| `<estado-error>` | Mensaje de error con botón de reintento opcional (`configurar(msg, onReintento)`). |
| `<tarjeta-obra>` | Tarjeta de obra: imagen, título, artista, fecha. Navega a `#detail/:id` al hacer clic. |

## Decisiones técnicas
- **Hash routing** sin recarga de página ni librerías externas.
- **`Promise.allSettled`** en toda resolución masiva de IDs, para que una obra fallida no tumbe el resto.
- **`AbortController`** con timeout de 20s por petición individual.
- **Lotes pequeños + pausa** al resolver varios IDs a la vez (`resolverIds`), para no disparar el límite de peticiones del API del museo.
- **Cortacircuitos ante 403:** si el museo bloquea por exceso de peticiones, la app deja de insistir por 2 minutos y muestra un mensaje claro en vez de seguir fallando en silencio.
- **Sistema de "token"** en `VistaExplorar` para descartar resultados de búsquedas viejas si el usuario cambia de filtro antes de que termine la anterior.
- **`createElement`/`textContent`** para insertar datos externos (sin `innerHTML`), salvo en textos fijos propios de la app.
- Los **custom elements construyen su contenido en `connectedCallback()`**, no en el `constructor()` — es un requisito real del estándar de Web Components (el constructor no puede agregarse hijos a sí mismo).
- **Traducción de departamentos:** el API del Met solo entrega nombres en inglés; se traducen con un diccionario local (`TRADUCCION_DEPTOS` en `Globales.js`) porque son solo 19 valores fijos.
- **`sessionStorage`** para pasar datos entre vistas (filtro de departamento → Explorar, obra seleccionada → Comparar).
- Sin módulos ES: los scripts se cargan en orden directo en `index.html`.

## Notas sobre el API
- Es pública y gratuita, sin API key, pero **tiene un límite de peticiones**: si la app manda muchas en poco tiempo, el museo puede responder 403 durante un par de minutos. Es normal y se resuelve solo.
- No todas las obras tienen imagen, ni todos los IDs que entrega `/search` siguen existiendo (algunos dan 404 con el tiempo). La app maneja ambos casos mostrando un placeholder o descartando la obra.

