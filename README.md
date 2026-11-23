# Gastos de casa — prueba técnica

App de gastos compartidos del hogar, construida por un equipo de 4 agentes de
Claude Code: un Orquestador y tres subagentes (`develop`, `testing`,
`security`, `performance`). El objetivo de la prueba es el propio equipo de
agentes, no la app en sí — esta es deliberadamente sencilla para que el
proceso se vea claro.

## Arquitectura de agentes

```
         ┌──────────────┐
         │ Orquestador  │  CLAUDE.md
         │ (reparte y   │
         │  decide)     │
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │   develop    │  .claude/agents/develop.md
         │ (programa)   │
         └──────┬───────┘
                │ entrega
                ▼
         ┌──────────────┐
         │   testing    │  .claude/agents/testing.md
         │ (funcional)  │  — bloqueante: si falla, no sigue
         └──────┬───────┘
                │ aprueba
        ┌───────┴────────┐
        ▼                ▼
 ┌─────────────┐  ┌──────────────┐
 │  security   │  │ performance  │   en PARALELO (independientes)
 │ (secretos,  │  │  (ligero:    │
 │  Firestore  │  │  bundle vs   │
 │  rules)     │  │  baseline)   │
 └──────┬──────┘  └──────┬───────┘
        └────────┬───────┘
                  ▼
      ¿los 3 aprueban en la misma iteración?
        no → junta todos los fallos → develop (vuelve a testing)
        sí → tarea hecha, commit, actualiza docs/metricas/
```

`performance` en modo **completo** (Lighthouse real contra `next start`) no
se ejecuta en cada iteración — es caro. Solo se dispara en los hitos
marcados en `docs/PLAN.md` (p. ej. al cerrar un bloque de tareas o antes de
desplegar), y su resultado se guarda como el nuevo
`docs/metricas/baseline-performance.json`.

Documentación completa del flujo: [`CLAUDE.md`](./CLAUDE.md). Reglas que
`develop` debe cumplir y que los revisores comprueban:
[`docs/DIRECTRICES.md`](./docs/DIRECTRICES.md).

## Métricas

Cada vuelta del bucle (testing → security/performance → develop si falla)
genera un fichero en `docs/metricas/tareas/<tarea>/iteracion-N.json`
(esquema en [`docs/metricas/schema.json`](./docs/metricas/schema.json)).

Al cerrar una tarea, el Orquestador ejecuta:

```bash
npm run metricas
```

Esto regenera tres ficheros a partir de todos los JSON de iteración:

- [`docs/metricas/resumen.md`](./docs/metricas/resumen.md) — tabla legible
  en el repo (iteraciones por tarea, quién rechazó más, líneas cambiadas).
- [`docs/metricas/resumen.html`](./docs/metricas/resumen.html) — lo mismo
  con un gráfico de barras, para verlo de un vistazo sin abrir nada más.
- `docs/metricas/resumen.json` — los mismos datos en crudo, por si se quiere
  procesar con otra herramienta.

El indicador clave es la **media de iteraciones hasta aprobar**: si sube con
el tiempo, las DIRECTRICES no están siendo suficientemente claras para
`develop`; si baja, el equipo converge mejor en primera pasada.

Ya hay una tarea de ejemplo (`00-ejemplo`) con dos iteraciones para que
`npm run metricas` tenga algo que mostrar desde el primer commit.

## Stack

Next.js 15 (App Router, TypeScript estricto) · Tailwind · Firebase
(Auth + Firestore) · Vitest · Vercel.

## Poner en marcha

```bash
npm install
cp .env.example .env.local   # rellenar con las credenciales del proyecto de Firebase
npm run dev
```

Las variables `NEXT_PUBLIC_FIREBASE_*` son públicas por diseño en Firebase
(no controlan el acceso a datos, eso lo hace `firestore.rules`). Las que
empiezan por `FIREBASE_` a secas (cuenta de servicio del Admin SDK) son
secretas de verdad: solo en el entorno del servidor, nunca en el repo.

### Desplegar las reglas de Firestore

```bash
npx firebase deploy --only firestore:rules
```

### Desplegar en Vercel

1. Conecta el repo en [vercel.com](https://vercel.com/new).
2. Añade las variables de `.env.example` en Project Settings → Environment
   Variables (marca las que no son `NEXT_PUBLIC_*` como "Sensitive").
3. Si el proyecto de Firebase es del plan gratuito y tarda en recibir tráfico
   real, ten en cuenta que Firestore no se "pausa" como otros backends
   gratuitos, pero igualmente conviene revisar cuotas del plan Spark antes
   de la entrega.

## Estado actual

Esqueleto verificado: `npm run lint`, `npm run typecheck`, `npm test` y
`npm run build` pasan sin errores sobre el código base (ver
`lib/reparto.ts` + `lib/reparto.test.ts` como ejemplo de la lógica que
`testing` espera ver testeada). Las pantallas reales (alta de hogar, alta de
gasto, listado, reparto, resumen mensual) están listadas en
[`docs/PLAN.md`](./docs/PLAN.md) pendientes de que el equipo de agentes las
construya tarea a tarea.
