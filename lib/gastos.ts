import {
  collection,
  doc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { type CrearGastoInput } from "@/lib/gastos.schema";

export { crearGastoSchema, type CrearGastoInput } from "@/lib/gastos.schema";

export type GastoDoc = {
  id: string;
  importe: number;
  descripcion: string;
  categoria: string;
  fecha: string;
  pagadoPor: string;
  creadoEn: Timestamp | null;
};

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

/**
 * Obtiene un gasto por su ID.
 */
export async function obtenerGasto(
  hogarId: string,
  gastoId: string
): Promise<GastoDoc | null> {
  const gastoRef = doc(db, "hogares", hogarId, "gastos", gastoId);
  const snap = await getDoc(gastoRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    importe: data["importe"] as number,
    descripcion: (data["descripcion"] as string) ?? "",
    categoria: data["categoria"] as string,
    fecha: data["fecha"] as string,
    pagadoPor: data["pagadoPor"] as string,
    creadoEn: (data["creadoEn"] as Timestamp) ?? null,
  };
}

/**
 * Obtiene todos los gastos de un hogar, ordenados por fecha descendente.
 */
export async function obtenerGastos(hogarId: string): Promise<GastoDoc[]> {
  const gastosRef = collection(db, "hogares", hogarId, "gastos");
  const q = query(gastosRef, orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      importe: data["importe"] as number,
      descripcion: (data["descripcion"] as string) ?? "",
      categoria: data["categoria"] as string,
      fecha: data["fecha"] as string,
      pagadoPor: data["pagadoPor"] as string,
      creadoEn: (data["creadoEn"] as Timestamp) ?? null,
    };
  });
}

/**
 * Actualiza un gasto existente en Firestore.
 */
export async function actualizarGasto(
  hogarId: string,
  gastoId: string,
  data: CrearGastoInput,
  categoriasExistentes: string[],
  miembrosExistentes: string[]
): Promise<void> {
  const hogarRef = doc(db, "hogares", hogarId);
  const gastoRef = doc(db, "hogares", hogarId, "gastos", gastoId);

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

  await updateDoc(gastoRef, {
    importe: data.importe,
    descripcion: data.descripcion ?? "",
    categoria: data.categoria.trim(),
    fecha: data.fecha,
    pagadoPor: data.pagadoPor.trim(),
  });
}

/**
 * Elimina un gasto de Firestore.
 */
export async function eliminarGasto(
  hogarId: string,
  gastoId: string
): Promise<void> {
  const gastoRef = doc(db, "hogares", hogarId, "gastos", gastoId);
  await deleteDoc(gastoRef);
}
