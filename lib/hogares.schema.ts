import { z } from "zod";

// Esquema de validación para crear un hogar (validación en cliente, D-06 retirada).
export const crearHogarSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre del hogar no puede estar vacío"),
});

export type CrearHogarInput = z.infer<typeof crearHogarSchema>;
