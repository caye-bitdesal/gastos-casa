import "server-only"; // rompe el build si algún Client Component intenta importar esto
// Admin SDK — SOLO se importa desde Server Actions o Route Handlers.
// La clave de cuenta de servicio vive en variables de entorno del servidor
// (nunca con prefijo NEXT_PUBLIC_). Ver docs/DIRECTRICES.md D-04 y D-11.
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function buildAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan credenciales de Firebase Admin. Revisa .env.example — nunca " +
        "subas la clave real al repo (ver docs/DIRECTRICES.md D-04)."
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const adminApp = buildAdminApp();
export const adminDb = getFirestore(adminApp);
