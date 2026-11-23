import NuevoGastoForm from "@/app/hogar/nuevo-gasto/NuevoGastoForm";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function NuevoGastoPage({ searchParams }: Props) {
  const { id } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">
        {id ? "Editar gasto" : "Añadir gasto"}
      </h1>
      <NuevoGastoForm gastoId={id} />
    </main>
  );
}
