# Plan de tareas

El Orquestador añade aquí una fila por tarea antes de lanzar `develop`.

| # | Tarea | Estado | Iteraciones | Hito |
|---|-------|--------|-------------|------|
| 01 | Alta de hogar + datos en Firestore | ✅ hecha | 1 | - |
| 02 | Alta de gasto con categoría y quién pagó | ✅ hecha | 2 | - |
| 03 | Listado de gastos del hogar | ✅ hecha | 1 | pendiente |
| 04 | Cálculo de reparto de deuda entre miembros | pendiente | - | - |
| 05 | Resumen mensual por hogar | pendiente | - | - |

"Hito" se marca cuando al cerrar esa tarea se dispara `performance` en modo
completo (p. ej. tras la 03 y tras la 05, antes de desplegar).

---

## Decisiones de arquitectura

- **Sin Firebase Auth.** Los usuarios no se registran ni hacen login.
- **Firestore como base de datos.** Acceso abierto por `hogarId` (UUID aleatorio).
  La "protección" es la aleatoriedad del ID — prueba de concepto.
- **Solo Client Components para Firestore.** Se usa el SDK de Firebase en el
  navegador. Sin Server Actions ni Admin SDK.
- **Validación con Zod en cliente** antes de cada escritura en Firestore.

## Modelo de datos Firestore

```
hogares/{hogarId}
  nombre:      string
  miembros:    string[]   // nombres libres, se acumulan al añadir gastos
  categorias:  string[]   // creadas por el usuario desde el formulario de gasto
  creadoEn:    timestamp

hogares/{hogarId}/gastos/{gastoId}
  importe:     number
  descripcion: string     // opcional
  categoria:   string
  fecha:       string     // ISO date "YYYY-MM-DD"
  pagadoPor:   string     // nombre libre
  creadoEn:    timestamp
```

El `hogarId` se genera en el cliente (UUID v4) al crear el hogar y se guarda
en `localStorage` solo como referencia local (no como fuente de verdad).

---

## Criterios de aceptación por tarea

### Tarea 01 — Alta de hogar

**Comportamiento:**
- Si existe un `hogarId` en `localStorage`, la app redirige directamente a
  la vista principal (nunca muestra la pantalla de creación).
- Si no hay hogar, muestra un formulario con un único campo: **nombre del hogar**.
- Al enviar, genera un UUID, crea el documento en Firestore
  (`hogares/{hogarId}` con nombre, miembros vacío, categorias vacío,
  creadoEn) y guarda el `hogarId` en `localStorage`.
- Redirige a la vista principal del hogar.
- Estados de carga y error visibles.
- Validación con Zod en cliente: nombre no vacío.

**Directrices:** D-01, D-02, D-03, D-07, D-08, D-09, D-10, D-12.

---

### Tarea 02 — Alta de gasto

**Comportamiento:**
- Formulario con los campos:
  - **Importe** (número positivo, obligatorio)
  - **Descripción** (texto libre, opcional)
  - **Categoría** (selector de categorías existentes + opción "Nueva
    categoría…" que permite escribir una nueva; al guardar el gasto, la
    nueva categoría se añade al array `categorias` del hogar)
  - **Fecha** (defecto: hoy, editable)
  - **Quién pagó** (texto libre, obligatorio; si es un nombre nuevo, se
    añade al array `miembros` del hogar)
- Escribe el gasto en `hogares/{hogarId}/gastos/{gastoId}`.
- Validación con Zod en cliente: importe positivo, pagador no vacío, fecha válida.
- Estados de carga y error visibles.

**Directrices:** D-01, D-02, D-03, D-07, D-08, D-09, D-10, D-12.

---

### Tarea 03 — Listado de gastos

**Comportamiento:**
- Lista todos los gastos de `hogares/{hogarId}/gastos`, ordenados por fecha
  descendente.
- Filtros: por **categoría** (selector) y por **mes/año** (selector).
  Se pueden combinar.
- Cada fila muestra: fecha, descripción, categoría, importe, quién pagó.
- Desde la lista se puede **editar** un gasto (abre el formulario de la tarea
  02 precargado) y **borrar** (con confirmación).
- Si no hay gastos (o no hay resultados con los filtros activos), estado vacío
  descriptivo.

**Directrices:** D-01, D-02, D-03, D-07, D-08, D-09, D-10, D-12.
**Hito al cerrar esta tarea** → lanzar `performance` en modo completo.

---

### Tarea 04 — Reparto de deuda

**Comportamiento:**
- Pantalla de reparto que lee todos los gastos de `hogares/{hogarId}/gastos`.
- Calcula las **transferencias mínimas** para saldar todas las deudas
  (extiende `lib/reparto.ts`, que ya tiene el balance por persona).
- Muestra la lista: "X le debe Y € a Z".
- Si el balance está a cero, mensaje de "todo saldado".
- La lógica de cálculo de transferencias mínimas tiene tests unitarios.

**Directrices:** D-01, D-02, D-03, D-07, D-08, D-09, D-10, D-12.

---

### Tarea 05 — Resumen mensual

**Comportamiento:**
- Pantalla con navegación mes a mes (← →), arrancando en el mes actual.
- Para el mes seleccionado muestra:
  - **Total gastado** ese mes.
  - **Desglose por categoría** (tabla/lista con importe y % del total).
  - **Reparto del mes**: cuánto ha puesto cada miembro.
  - **Comparativa** con el mes anterior (diferencia en € y en %).
- Si no hay gastos ese mes, estado vacío claro.

**Directrices:** D-01, D-02, D-03, D-07, D-08, D-09, D-10, D-12.
**Hito al cerrar esta tarea** → lanzar `performance` en modo completo.
