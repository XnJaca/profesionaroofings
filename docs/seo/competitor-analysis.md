# Análisis SEO de competidores — Maryland Roofing

> Investigación realizada el 2026-07-10. Base para la estrategia SEO de Professional Construction LLC (pcdmv.com, sede en Lanham, MD).

## Competidor #1: marylandroofingco.com (posición 1)

**Perfil:** Maryland Roofing Company, Severna Park/Pasadena MD. WordPress + Yoast SEO + WP Rocket. Dominio activo desde 2015. Licencia MHIC #103979, 40+ años, certificaciones GAF / Atlas / Owens Corning / CertainTeed.

**Title de portada:** `Roofers Severna Park, MD | Maryland Roofing Company` (servicio + ciudad).

**Por qué posiciona:**

1. **~46 páginas con arquitectura "servicio × ciudad"**: `roof-repair-annapolis-md`, `roofing-bowie-md`, `storm-damage-roof-services-pasadena-md`, `roofing-laurel-md`, `roofing-greenbelt-md`, etc. + hub `/service-areas/` (Severna Park, Pasadena, Annapolis, Millersville). Cada búsqueda local tiene página exacta.
2. **98 posts de blog**, temas estacionales locales (ice dams, tormentas de primavera), publicando de forma continua (último: oct 2025).
3. **Reseñas:** Google Business Profile 5.0★ con 34 reseñas; HomeAdvisor 5.0; presencia en Angi, BBB, findtrustedroofers → citaciones NAP consistentes.
4. **Schema JSON-LD** completo vía Yoast (WebPage, BreadcrumbList, Organization).
5. **Señales de confianza** en cada página: licencia MHIC, años, marcas certificadas, testimonios, horario.
6. **Antigüedad**: 11 años de dominio con nombre de concordancia exacta.

## Competidor #2: roofworksinc.com (posición 2)

**Perfil:** ROOFWORKS Inc., **sede en 9336 Annapolis Rd, Lanham, MD** — competidor local directo (misma ciudad que nosotros). WordPress + Divi + Yoast. Dominio desde 2015, portada modificada jun-2026 (mantenimiento activo). Familiar, 25+ años operando, "50+ años de experiencia". Servicios: roofing, siding, gutters, windows.

**Title de portada:** `Roofing Company Maryland | ROOFWORKS` — apunta a la keyword estatal "roofing company Maryland" en vez de una ciudad.

**Por qué posiciona:**

1. **39 páginas, con 16 páginas de zona por CONDADO** (`/service-area/montgomery-county/`, `prince-georges-county`, `anne-arundel-county`, `howard-county`, `baltimore-md`, `washington-dc`, `fairfax-county`…). Cubren todo el estado con menos páginas que el competidor #1 (condado > ciudad = más volumen de búsqueda por página).
2. **287 posts de blog** — volumen masivo acumulado durante años ("4 signs you need a house roof repair", "3 benefits of seamless gutters"...). Autoridad temática enorme.
3. **Reputación multiplataforma:** ~4.8★ con ~269 reseñas en Google; BBB A+ acreditado; Yelp (22 reseñas); Angi 4.7; **ganador "2025 Neighborhood Fave" de Nextdoor**; Washington Consumers' Checkbook.
4. **Maquinaria de conversión** (mejora CTR y engagement, señales indirectas): specials con fecha de caducidad, programa de referidos pagado, financiación, descuentos senior, Shingle Visualizer (Atlas), vídeo de demostración, formulario de presupuesto en portada.
5. **Teléfonos por región** (MD/DC/VA/toll-free) — refuerza cobertura multi-estado.
6. **Schema JSON-LD** (WebPage, WebSite con SearchAction, Organization, BreadcrumbList).

## Comparativa de estrategias

| Factor | marylandroofingco (#1) | roofworksinc (#2) | Nosotros (pcdmv.com) |
|---|---|---|---|
| Páginas de zona | ~25 por ciudad | 16 por condado | 0 |
| Posts de blog | 98 | 287 | 0 |
| Reseñas Google | 5.0★ / 34 | ~4.8★ / ~269 | (verificar GBP) |
| Schema JSON-LD | Sí (Yoast) | Sí (Yoast) | No |
| Sitemap XML | Sí | Sí | Roto (apunta a onrender.com, sin integración) |
| Title con keyword local | Ciudad | Estado | No (marca + "DMV") |
| Antigüedad dominio | 2015 | 2015 | reciente |
| Financiación/ofertas | Specials | Specials + referidos + financiación | No |

## Estado técnico de nuestra web (auditoría rápida)

- `public/robots.txt` apunta a `https://professional-roofing.onrender.com/sitemap-index.xml` pero el site es `pcdmv.com` y **no existe integración `@astrojs/sitemap`** → sitemap roto.
- `Layout.astro` sin **JSON-LD** (falta schema `RoofingContractor`/`LocalBusiness` con NAP, horario, licencias DC #410526000160 / MD #152249, área de servicio).
- OG image referencia `/og.jpg` que **no existe** en `public/`.
- Titles sin ciudad/keyword local.
- Sin páginas por ciudad/condado, sin blog, sin página de reseñas ni FAQ.

## Plan de acción recomendado

1. **Técnico (inmediato):** instalar `@astrojs/sitemap`, corregir robots.txt, añadir JSON-LD LocalBusiness, crear og.jpg, titles con keyword+zona.
2. **Páginas de zona (mes 1):** empezar por condados donde trabajamos — Prince George's (Lanham es nuestra sede), Montgomery, Anne Arundel, Howard + Washington DC + Fairfax VA. Contenido único por página (proyectos reales, fotos, testimonios de la zona). Patrón sugerido: `src/pages/areas/[slug].astro` + `src/data/areas.ts`.
3. **Google Business Profile + reseñas (paralelo):** optimizar ficha, pedir reseña a cada cliente (QR en factura → ya tenemos dependencia `qrcode` en el proyecto). Objetivo: 30–50 reseñas en 6–12 meses.
4. **Citaciones:** HomeAdvisor, Angi, BBB, Yelp, Nextdoor, Houzz, Chamber of Commerce, findtrustedroofers — NAP idéntico en todas.
5. **Blog (mes 2+):** 2–4 posts/mes, temas estacionales de Maryland/DMV.
6. **Conversión:** página de financiación/ofertas y FAQ (copiar el patrón de Roofworks).

**Ventaja nuestra:** Astro estático es mucho más rápido que sus WordPress con Divi/LayerSlider (Core Web Vitals a nuestro favor). **Desventaja:** ellos llevan 10+ años acumulando contenido, enlaces y reseñas — la constancia es lo que compensa esto.
