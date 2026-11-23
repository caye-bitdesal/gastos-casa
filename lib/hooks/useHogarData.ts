"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerHogar } from "@/lib/hogares";

type UseHogarDataResult = {
  hogarId: string;
  categorias: string[];
  miembros: string[];
  cargandoHogar: boolean;
  errorHogar: string;
  setCategorias: React.Dispatch<React.SetStateAction<string[]>>;
  setMiembros: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useHogarData(): UseHogarDataResult {
  const router = useRouter();
  const [hogarId, setHogarId] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [miembros, setMiembros] = useState<string[]>([]);
  const [cargandoHogar, setCargandoHogar] = useState(true);
  const [errorHogar, setErrorHogar] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("hogarId");
    if (!id) {
      router.replace("/");
      return;
    }
    setHogarId(id);
    obtenerHogar(id)
      .then((data) => {
        if (!data) {
          router.replace("/");
        } else {
          setCategorias(data.categorias ?? []);
          setMiembros(data.miembros ?? []);
        }
      })
      .catch(() => setErrorHogar("No se pudieron cargar los datos del hogar."))
      .finally(() => setCargandoHogar(false));
  }, [router]);

  return {
    hogarId,
    categorias,
    miembros,
    cargandoHogar,
    errorHogar,
    setCategorias,
    setMiembros,
  };
}
