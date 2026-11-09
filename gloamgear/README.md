# GLOAMGEAR · edición de navegador

Esta ruta publica el juego de combate en `/gloamgear/`; la raíz del repositorio conserva Dominion.
Se parte de `build/final_part1.html` a `final_part4.html`, con correcciones de combate, equipo,
talentos, maestrías, misiones, prestige, persistencia local, teclado y móvil.

El jugador abre la URL publicada y juega. No necesita instalar Node, descargar el proyecto ni
instalar la PWA. Todos los archivos de juego y arte se sirven desde el mismo alojamiento.

## Límites explícitos

Esta edición guarda en el navegador y tiene copia local de recuperación. El tiempo offline es
una estimación del reloj del dispositivo. No proporciona autenticación, cloud save autoritativo,
compras reales, puntuaciones online ni recompensas competitivas. No sustituye el backend del
monorepo anterior, actualmente inaccesible porque el executor de este chat no se puede adjuntar.
No se afirma que sea la entrega canónica completa solicitada originalmente.

Los documentos MASTER_PRODUCTION_DOCUMENT.docx, VISUAL_PRODUCTION_BIBLE.pdf y
VISUAL_ASSET_SPEC.md siguen sin estar en los paths canónicos de `main` al auditar esta entrega.
Los nombres de mundos, enemigos y objetos proceden del código ya existente del repositorio.
Las fórmulas y nuevos efectos son provisionales; deben reconciliarse con esas fuentes cuando existan.

El build valida las imágenes codificadas de `assets/runtime/`. Usa los archivos completos que
encuentre, sin recortar concept sheets. Si están incompletos, genera SVG provisionales explícitos;
`asset-provenance.json` registra su procedencia. No se describen como assets finales canónicos.

## Verificación y publicación

GitHub Actions prepara los assets y ejecuta pruebas headless del core y Chromium: combate real,
botín, equipo, nivel, talentos, jefe, prestige único, recarga, recuperación y cinco viewports.
La publicación requiere esas verificaciones, conserva Dominion e imprime la URL de juego
al terminar `Deploy Gloamgear and Dominion to GitHub Pages`.

Los paquetes de Playwright se instalan en el runner de CI, no en el ordenador del jugador.
