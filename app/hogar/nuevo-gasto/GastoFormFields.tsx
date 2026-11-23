"use client";

type CampoError = Partial<Record<string, string>>;

type GastoFormFieldsProps = {
  importe: string;
  setImporte: (v: string) => void;
  descripcion: string;
  setDescripcion: (v: string) => void;
  categoria: string;
  setCategoria: (v: string) => void;
  nuevaCategoria: string;
  setNuevaCategoria: (v: string) => void;
  fecha: string;
  setFecha: (v: string) => void;
  pagadoPor: string;
  setPagadoPor: (v: string) => void;
  categorias: string[];
  miembros: string[];
  errores: CampoError;
  guardando: boolean;
  modoEdicion?: boolean;
  onCancel: () => void;
};

export function GastoFormFields({
  importe, setImporte,
  descripcion, setDescripcion,
  categoria, setCategoria,
  nuevaCategoria, setNuevaCategoria,
  fecha, setFecha,
  pagadoPor, setPagadoPor,
  categorias,
  miembros,
  errores,
  guardando,
  modoEdicion = false,
  onCancel,
}: GastoFormFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="importe" className="block text-sm font-medium text-neutral-700">
          Importe (€) <span aria-hidden="true">*</span>
        </label>
        <input
          id="importe"
          type="number"
          step="0.01"
          min="0.01"
          value={importe}
          onChange={(e) => setImporte(e.target.value)}
          required
          aria-required="true"
          aria-describedby={errores["importe"] ? "importe-error" : undefined}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errores["importe"] && (
          <p id="importe-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores["importe"]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-neutral-700">
          Descripción
        </label>
        <input
          id="descripcion"
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="categoria" className="block text-sm font-medium text-neutral-700">
          Categoría <span aria-hidden="true">*</span>
        </label>
        <select
          id="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          aria-required="true"
          aria-describedby={errores["categoria"] ? "categoria-error" : undefined}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="__nueva__">Nueva categoría…</option>
        </select>
        {errores["categoria"] && (
          <p id="categoria-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores["categoria"]}
          </p>
        )}
      </div>

      {categoria === "__nueva__" && (
        <div>
          <label htmlFor="nuevaCategoria" className="block text-sm font-medium text-neutral-700">
            Nombre de la nueva categoría <span aria-hidden="true">*</span>
          </label>
          <input
            id="nuevaCategoria"
            type="text"
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            required
            aria-required="true"
            className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-neutral-700">
          Fecha <span aria-hidden="true">*</span>
        </label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
          aria-required="true"
          aria-describedby={errores["fecha"] ? "fecha-error" : undefined}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errores["fecha"] && (
          <p id="fecha-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores["fecha"]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pagadoPor" className="block text-sm font-medium text-neutral-700">
          Quién pagó <span aria-hidden="true">*</span>
        </label>
        <input
          id="pagadoPor"
          type="text"
          list="miembros-list"
          value={pagadoPor}
          onChange={(e) => setPagadoPor(e.target.value)}
          required
          aria-required="true"
          aria-describedby={errores["pagadoPor"] ? "pagadoPor-error" : undefined}
          className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {miembros.length > 0 && (
          <datalist id="miembros-list">
            {miembros.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        )}
        {errores["pagadoPor"] && (
          <p id="pagadoPor-error" className="mt-1 text-sm text-red-600" role="alert">
            {errores["pagadoPor"]}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {guardando ? "Guardando…" : modoEdicion ? "Actualizar gasto" : "Guardar gasto"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          Cancelar
        </button>
      </div>
    </>
  );
}
