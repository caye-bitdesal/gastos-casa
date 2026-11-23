import GastosLista from "@/app/hogar/gastos/GastosLista";

export default function GastosPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Gastos del hogar</h1>
      <GastosLista />
    </main>
  );
}
