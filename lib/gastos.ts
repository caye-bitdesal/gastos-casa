import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { type CrearGastoInput } from "@/lib/gastos.schema";

export { crearGastoSchema, type CrearGastoInput } from "@/lib/gastos.schema";

/**
 * Crea un nuevo gasto en Firestore bajo hogares/{hogarId}/gastos.
 * Si la categoría no estaba en la lista, la añade con arrayUnion.
 * Si el pagador no estaba en miembros, lo añade con arrayUnion.
 */
export async function crearGasto(
  hogarId: string,
  data: CrearGastoInput,
  categoriasExistentes: string[],
  miembrosExistentes: string[]
): Promise<string> {
  const hogarRef = doc(db, "hogares", hogarId);
  const gastosRef = collection(db, "hogares", hogarId, "gastos");

  const categoriaNueva = !categoriasExistentes.includes(data.categoria.trim());
  const pagadorNuevo = !miembrosExistentes.includes(data.pagadoPor.trim());

  const updates: Record<string, unknown> = {};
  if (categoriaNueva) {
    updates["categorias"] = arrayUnion(data.categoria.trim());
  }
  if (pagadorNuevo) {
    updates["miembros"] = arrayUnion(data.pagadoPor.trim());
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(hogarRef, updates);
  }

  const gastoDoc = await addDoc(gastosRef, {
    importe: data.importe,
    descripcion: data.descripcion ?? "",
    categoria: data.categoria.trim(),
    fecha: data.fecha,
    pagadoPor: data.pagadoPor.trim(),
    creadoEn: serverTimestamp(),
  });

  return gastoDoc.id;
}
