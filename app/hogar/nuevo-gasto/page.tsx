import NuevoGastoForm from "@/app/hogar/nuevo-gasto/NuevoGastoForm";

export default function NuevoGastoPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Añadir gasto</h1>
      <NuevoGastoForm />
    </main>
  );
}
