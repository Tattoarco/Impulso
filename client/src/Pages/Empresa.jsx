import SideBar from "../Components/Sidebar";
import { Button, Card } from "@heroui/react";

export default function Empresa() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <>
      <SideBar />

      <main className="ml-80 p-8 bg-gray-100 min-h-screen">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Hola, {user?.name} 👋
          </h1>
          <p className="text-gray-500">
            Gestiona tus proyectos y encuentra talento
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-sm">Proyectos activos</p>
            <h2 className="text-2xl font-bold">3</h2>
          </Card>

          <Card className="p-5 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-sm">Candidatos</p>
            <h2 className="text-2xl font-bold">12</h2>
          </Card>

          <Card className="p-5 rounded-2xl shadow-sm">
            <p className="text-gray-400 text-sm">Proyectos finalizados</p>
            <h2 className="text-2xl font-bold">5</h2>
          </Card>
        </div>

        {/* ACCIONES */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Acciones rápidas
          </h2>

          <div className="flex flex-wrap gap-4">
            <Button className="bg-blue-500 text-white">
              + Crear proyecto
            </Button>

            <Button variant="bordered">
              Ver candidatos
            </Button>

            <Button variant="bordered">
              Ver proyectos
            </Button>
          </div>
        </div>

        {/* LISTA */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">
            Tus últimos proyectos
          </h2>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">Proyecto #{item}</p>
                  <p className="text-sm text-gray-400">
                    Diseño / Desarrollo
                  </p>
                </div>

                <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
                  Activo
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}