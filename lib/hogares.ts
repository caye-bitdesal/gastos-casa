import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export { crearHogarSchema, type CrearHogarInput } from "@/lib/hogares.schema";

export interface HogarDoc {
  nombre: string;
  miembros: string[];
  categorias: string[];
  creadoEn: unknown;
}

/**
 * Crea un nuevo hogar en Firestore y devuelve el hogarId generado.
 * El hogarId es un UUID v4 generado en cliente; actúa como secreto compartido (D-05).
 */
export async function crearHogar(nombre: string): Promise<string> {
  const hogarId = crypto.randomUUID();
  const docRef = doc(db, "hogares", hogarId);
  await setDoc(docRef, {
    nombre: nombre.trim(),
    miembros: [],
    categorias: [],
    creadoEn: serverTimestamp(),
  });
  return hogarId;
}

/**
 * Obtiene los datos de un hogar por su ID desde Firestore.
 * Devuelve null si el documento no existe.
 */
export async function obtenerHogar(hogarId: string): Promise<HogarDoc | null> {
  const docRef = doc(db, "hogares", hogarId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return snap.data() as HogarDoc;
}
