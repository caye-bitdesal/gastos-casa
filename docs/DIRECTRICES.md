# Directrices

Reglas que `develop` debe cumplir. Cada regla tiene un identificador estable
(no renumerar al editar: si se retira una, se marca "retirada", no se borra)
para que los informes de los revisores sean trazables entre iteraciones.

## Funcional (comprueba `testing`)

- D-01 `npm run build` sin errores.
- D-02 Lint y typecheck sin errores ni warnings nuevos.
- D-03 Toda lógica de negocio nueva tiene test y los tests pasan; el test
  falla si se revierte el cambio.
- D-06 Validación de formularios y Server Actions con `zod`, en servidor
  (no basta con validar en el cliente).
- D-07 Cada pantalla nueva tiene estado de carga, vacío y error.
- D-08 Accesibilidad básica: labels en formularios, `alt` en imágenes, foco
  visible.
- D-09 Sin `console.log` ni código comentado en el commit final.
- D-10 Componentes de menos de 200 líneas; si se pasa, se divide.

## Seguridad (comprueba `security`)

- D-04 La clave de cuenta de servicio del Admin SDK (JSON, o variables
  `FIREBASE_SERVICE_ACCOUNT_KEY` / `FIREBASE_ADMIN_PRIVATE_KEY`) nunca está
  en el repo ni en un archivo accesible desde un Client Component; solo en
  variables de entorno del servidor (Vercel → Environment Variables,
  marcadas "sensitive").
  - Nota: las variables `NEXT_PUBLIC_FIREBASE_*` (API key, authDomain,
    projectId...) SON públicas por diseño en Firebase y no son un fallo.
- D-05 `firestore.rules` deniega todo acceso por defecto; cada colección
  tiene una regla explícita de lectura/escritura acorde al dueño del dato.
  Ninguna regla usa `allow read, write: if true;` sin justificación
  comentada y aprobación humana explícita.
- D-05b `firestore.rules` tiene al menos un test con el Firebase Emulator
  Suite por cada colección con lógica de autorización no trivial (es decir,
  más allá de "el dueño puede leer lo suyo").
- D-11 Ninguna llamada a Firebase Admin SDK se hace desde un archivo con
  `"use client"` en la cabecera, ni desde algo que ese archivo importe.

## Rendimiento (comprueba `performance`)

- D-12 Ninguna ruta crece más de un 15% de tamaño de bundle respecto al
  baseline sin justificación documentada por `develop` en su entrega.
- D-13 En hitos (Lighthouse completo): el score de "Performance" no cae más
  de 10 puntos respecto al baseline, y ningún Core Web Vital empeora de
  categoría (de "bueno" a "necesita mejora", o de ahí a "pobre").

## Convergencia (la gestiona el Orquestador, no un revisor)

- Máximo 5 iteraciones por tarea. Al llegar a 5 sin aprobación completa, el
  Orquestador para y pregunta al humano — no se entrega código que no ha
  convergido.
- Una tarea solo se da por hecha cuando `testing`, `security` y
  `performance` (modo ligero) aprueban en la MISMA iteración. Si cualquiera
  de los tres rechaza, se reinicia la cadena completa desde `testing` tras
  la corrección, nunca se relanza solo el agente que rechazó.
