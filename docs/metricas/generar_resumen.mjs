#!/usr/bin/env node
// Agrega docs/metricas/tareas/**/iteracion-*.json en:
//   - docs/metricas/resumen.json  (datos crudos agregados, por si otro script los usa)
//   - docs/metricas/resumen.md    (tabla legible en el repo)
//   - docs/metricas/resumen.html  (gráfico de iteraciones-por-tarea, autocontenido)
//
// Sin dependencias: solo Node. Lo ejecuta el Orquestador tras cerrar cada tarea:
//   node docs/metricas/generar_resumen.mjs

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const METRICAS_DIR = dirname(fileURLToPath(import.meta.url));
const TAREAS_DIR = join(METRICAS_DIR, "tareas");

function listarTareas() {
  try {
    return readdirSync(TAREAS_DIR).filter((n) =>
      statSync(join(TAREAS_DIR, n)).isDirectory()
    );
  } catch {
    return [];
  }
}

function cargarIteraciones(tarea) {
  const dir = join(TAREAS_DIR, tarea);
  const ficheros = readdirSync(dir)
    .filter((f) => /^iteracion-\d+\.json$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });
  return ficheros.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

function agenteQueMasRechaza(iteraciones) {
  const conteo = { testing: 0, security: 0, performance: 0 };
  for (const it of iteraciones) {
    for (const agente of Object.keys(conteo)) {
      if (it[agente]?.veredicto === "RECHAZADO") conteo[agente]++;
    }
  }
  const entries = Object.entries(conteo).filter(([, n]) => n > 0);
  if (entries.length === 0) return "-";
  entries.sort((a, b) => b[1] - a[1]);
  return entries.map(([k, n]) => `${k} (${n})`).join(", ");
}

const tareas = listarTareas();
const resumen = tareas.map((tarea) => {
  const iteraciones = cargarIteraciones(tarea);
  const aprobada = iteraciones.at(-1)?.veredicto_global === "APROBADO";
  const bundleInicial = iteraciones.find((i) => i.performance)?.performance?.bundle_kb ?? null;
  const bundleFinal = [...iteraciones].reverse().find((i) => i.performance)?.performance?.bundle_kb ?? null;
  return {
    tarea,
    iteraciones_total: iteraciones.length,
    aprobada,
    agente_que_mas_rechaza: agenteQueMasRechaza(iteraciones),
    lineas_cambiadas_total: iteraciones.reduce((s, i) => s + (i.lineas_cambiadas || 0), 0),
    bundle_kb_inicial: bundleInicial,
    bundle_kb_final: bundleFinal,
  };
});

// --- resumen.json ---
writeFileSync(
  join(METRICAS_DIR, "resumen.json"),
  JSON.stringify({ generado: new Date().toISOString(), tareas: resumen }, null, 2)
);

// --- resumen.md ---
const mediaIteraciones = resumen.length
  ? (resumen.reduce((s, r) => s + r.iteraciones_total, 0) / resumen.length).toFixed(1)
  : "-";
const filas = resumen
  .map(
    (r) =>
      `| ${r.tarea} | ${r.iteraciones_total} | ${r.aprobada ? "✅" : "⏳"} | ${r.agente_que_mas_rechaza} | ${r.lineas_cambiadas_total} |`
  )
  .join("\n");
const md = `# Resumen de métricas

Generado: ${new Date().toISOString()}

Media de iteraciones hasta aprobar: **${mediaIteraciones}**
(si esta cifra sube con el tiempo, las DIRECTRICES no están claras para
\`develop\`; si baja, el equipo está convergiendo mejor en primera pasada)

| Tarea | Iteraciones | Aprobada | Agente que más rechazó | Líneas cambiadas |
|-------|-------------|----------|-------------------------|-------------------|
${filas}

Ver también [resumen.html](./resumen.html) para el gráfico, y
[resumen.json](./resumen.json) para los datos crudos.
`;
writeFileSync(join(METRICAS_DIR, "resumen.md"), md);

// --- resumen.html (gráfico de barras SVG inline, sin dependencias) ---
const maxIter = Math.max(1, ...resumen.map((r) => r.iteraciones_total));
const barWidth = 48;
const gap = 24;
const chartHeight = 220;
const svgWidth = Math.max(400, resumen.length * (barWidth + gap) + gap);
const barras = resumen
  .map((r, i) => {
    const h = (r.iteraciones_total / maxIter) * (chartHeight - 40);
    const x = gap + i * (barWidth + gap);
    const y = chartHeight - h - 20;
    const color = r.aprobada ? "#2e7d32" : "#f9a825";
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="${color}" rx="4"></rect>
      <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="13" fill="#222">${r.iteraciones_total}</text>
      <text x="${x + barWidth / 2}" y="${chartHeight - 4}" text-anchor="middle" font-size="11" fill="#555">${r.tarea}</text>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Métricas del equipo de agentes</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #1a1a1a; background: #fafafa; }
  h1 { font-size: 1.4rem; }
  .kpi { font-size: 2rem; font-weight: 700; }
  .kpi-label { color: #666; font-size: 0.9rem; }
  table { border-collapse: collapse; margin-top: 1.5rem; width: 100%; max-width: 760px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; font-size: 0.9rem; }
  th { background: #f0f0f0; }
  .leyenda span { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: middle; }
</style>
</head>
<body>
  <h1>Métricas del equipo de agentes</h1>
  <p class="kpi-label">Media de iteraciones hasta aprobar</p>
  <p class="kpi">${mediaIteraciones}</p>

  <h2>Iteraciones por tarea</h2>
  <p class="leyenda">
    <span style="background:#2e7d32"></span>aprobada
    <span style="background:#f9a825"></span>pendiente/en curso
  </p>
  <svg width="${svgWidth}" height="${chartHeight}" viewBox="0 0 ${svgWidth} ${chartHeight}">
    <line x1="0" y1="${chartHeight - 20}" x2="${svgWidth}" y2="${chartHeight - 20}" stroke="#ccc"></line>
    ${barras}
  </svg>

  <h2>Detalle</h2>
  <table>
    <thead>
      <tr><th>Tarea</th><th>Iteraciones</th><th>Aprobada</th><th>Agente que más rechazó</th><th>Líneas cambiadas</th><th>Bundle inicial → final (KB)</th></tr>
    </thead>
    <tbody>
      ${resumen
        .map(
          (r) => `<tr>
        <td>${r.tarea}</td>
        <td>${r.iteraciones_total}</td>
        <td>${r.aprobada ? "✅" : "⏳"}</td>
        <td>${r.agente_que_mas_rechaza}</td>
        <td>${r.lineas_cambiadas_total}</td>
        <td>${r.bundle_kb_inicial ?? "-"} → ${r.bundle_kb_final ?? "-"}</td>
      </tr>`
        )
        .join("\n      ")}
    </tbody>
  </table>
  <p style="color:#999; font-size: 0.8rem;">Generado: ${new Date().toISOString()}</p>
</body>
</html>
`;
writeFileSync(join(METRICAS_DIR, "resumen.html"), html);

console.log(`Procesadas ${resumen.length} tarea(s). resumen.md, resumen.json y resumen.html actualizados.`);
