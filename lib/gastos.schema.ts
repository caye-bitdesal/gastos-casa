import { z } from "zod";

// Esquema de validación para crear un gasto (validación en cliente, D-06 retirada).
export const crearGastoSchema = z.object({
  importe: z
    .number()
    .positive("El importe debe ser mayor que cero"),
  descripcion: z.string().optional(),
  categoria: z.string().trim().min(1, "La categoría no puede estar vacía"),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato YYYY-MM-DD"),
  pagadoPor: z.string().trim().min(1, "El campo 'quién pagó' no puede estar vacío"),
});

export type CrearGastoInput = z.infer<typeof crearGastoSchema>;
