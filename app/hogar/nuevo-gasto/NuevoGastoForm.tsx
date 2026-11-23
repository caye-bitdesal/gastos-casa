"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearGasto, actualizarGasto, obtenerGasto, crearGastoSchema } from "@/lib/gastos";
import { useHogarData } from "@/lib/hooks/useHogarData";
import { GastoFormFields } from "./GastoFormFields";

type CampoError = Partial<Record<string, string>>;

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = { gastoId?: string };

export default function NuevoGastoForm({ gastoId }: Props) {
  const router = useRouter();
  const { hogarId, categorias, miembros, cargandoHogar, errorHogar, setCategorias, setMiembros } =
    useHogarData();

  const [importe, setImporte] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("__nueva__");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [fecha, setFecha] = useState(hoy());
  const [pagadoPor, setPagadoPor] = useState("");

  const [errores, setErrores] = useState<CampoError>({});
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [cargandoGasto, setCargandoGasto] = useState(!!gastoId);

  useEffect(() => {
    if (categorias.length > 0 && !gastoId) {
      setCategoria(categorias[0] ?? "__nueva__");
    }
  }, [categorias, gastoId]);

  useEffect(() => {
    if (!gastoId || !hogarId) return;
    setCargandoGasto(true);
    obtenerGasto(hogarId, gastoId)
      .then((g) => {
        if (!g) {
          setErrores({ general: "No se encontró el gasto a editar." });
          return;
        }
        setImporte(String(g.importe));
        setDescripcion(g.descripcion);
        setCategoria(g.categoria);
        setFecha(g.fecha);
        setPagadoPor(g.pagadoPor);
      })
      .catch(() => setErrores({ general: "Error al cargar el gasto." }))
      .finally(() => setCargandoGasto(false));
  }, [gastoId, hogarId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrores({});
    setExito(false);

    const categoriaFinal =
      categoria === "__nueva__" ? nuevaCategoria.trim() : categoria;

    const parsed = crearGastoSchema.safeParse({
      importe: parseFloat(importe),
      descripcion: descripcion || undefined,
      categoria: categoriaFinal,
      fecha,
      pagadoPor: pagadoPor.trim(),
    });

    if (!parsed.success) {
      const mapa: CampoError = {};
      for (const issue of parsed.error.issues) {
        const campo = String(issue.path[0] ?? "general");
        mapa[campo] = issue.message;
      }
      setErrores(mapa);
      return;
    }

    setGuardando(true);
    try {
      if (gastoId) {
        await actualizarGasto(hogarId, gastoId, parsed.data, categorias, miembros);
      } else {
        await crearGasto(hogarId, parsed.data, categorias, miembros);
      }

      if (!categorias.includes(categoriaFinal)) {
        setCategorias((prev) => [...prev, categoriaFinal]);
      }
      if (!miembros.includes(parsed.data.pagadoPor)) {
        setMiembros((prev) => [...prev, parsed.data.pagadoPor]);
      }

      if (gastoId) {
        router.push("/hogar/gastos");
      } else {
        setImporte("");
        setDescripcion("");
        setCategoria(categorias.length > 0 ? (categorias[0] ?? "__nueva__") : "__nueva__");
        setNuevaCategoria("");
        setFecha(hoy());
        setPagadoPor("");
        setExito(true);
      }
    } catch {
      setErrores({ general: "Error al guardar el gasto. Inténtalo de nuevo." });
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoHogar || cargandoGasto) {
    return (
      <p className="text-neutral-500" role="status" aria-live="polite">
        {cargandoGasto ? "Cargando gasto…" : "Cargando datos del hogar…"}
      </p>
    );
  }

  if (errorHogar) {
    return (
      <p className="text-red-600" role="alert">
        {errorHogar}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {exito && (
        <p className="rounded bg-green-50 p-3 text-green-700" role="status" aria-live="polite">
          Gasto guardado correctamente.
        </p>
      )}
      {errores["general"] && (
        <p className="rounded bg-red-50 p-3 text-red-600" role="alert">
          {errores["general"]}
        </p>
      )}
      <GastoFormFields
        importe={importe}
        setImporte={setImporte}
        descripcion={descripcion}
        setDescripcion={setDescripcion}
        categoria={categoria}
        setCategoria={setCategoria}
        nuevaCategoria={nuevaCategoria}
        setNuevaCategoria={setNuevaCategoria}
        fecha={fecha}
        setFecha={setFecha}
        pagadoPor={pagadoPor}
        setPagadoPor={setPagadoPor}
        categorias={categorias}
        miembros={miembros}
        errores={errores}
        guardando={guardando}
        modoEdicion={!!gastoId}
        onCancel={() => router.push(gastoId ? "/hogar/gastos" : "/hogar")}
      />
    </form>
  );
}
