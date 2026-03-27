"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ConsultarEquipos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // ELIMINAR EQUIPO
  const eliminarEquipo = async (id: number) => {
    const confirmar = confirm("¿Está seguro que desea eliminar este equipo?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8000/equipos/${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar");
      }

      alert("Equipo eliminado correctamente");

      // Actualiza la tabla sin recargar
      setEquipos((prev) => prev.filter((e) => e.id !== id));

    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar");
    }
  };

  // CARGAR EQUIPOS
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("http://localhost:8000/equipos/");
        const data = await res.json();
        setEquipos(data);
      } catch (error) {
        console.error("Error al cargar equipos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span>Bienvenido, Administrador</span>
      </nav>

      {/* CONTENIDO */}
      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Equipos multidisciplinarios
          </h2>

          <Link
            href="/registrarEquipo"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Registrar equipo
          </Link>
        </div>

        {cargando ? (
          <p className="text-gray-500">Cargando equipos...</p>
        ) : equipos.length === 0 ? (
          <p className="text-gray-500">No hay equipos registrados.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left border">Nombre</th>
                <th className="py-3 px-4 text-left border">Estatus</th>
                <th className="py-3 px-4 text-left border">Integrantes</th>
                <th className="py-3 px-4 text-left border">Opciones</th>
              </tr>
            </thead>

            <tbody>
              {equipos.map((equipo) => (
                <tr key={equipo.id}>
                  {/* NOMBRE */}
                  <td className="py-2 px-4 border font-medium text-gray-800">
                    {equipo.nombre_equipo}
                  </td>

                  {/* ESTATUS */}
                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        equipo.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {equipo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* INTEGRANTES */}
                  <td className="py-2 px-4 border">
                    {equipo.integrantes?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {equipo.integrantes.map((i: any) => (
                          <li key={i.id}>
                            {i.usuario.nombre} {i.usuario.primer_apellido}{" "}
                            {i.usuario.segundo_apellido}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Sin integrantes
                      </span>
                    )}

                      {/* BOTÓN NUEVO */}
                    <Link
                        href={`/admin/equipos/${equipo.id}/agregar-integrante`}
                        className="block mt-2 text-blue-600 hover:underline text-sm font-semibold"
                    >
                        + Añadir integrante
                    </Link>
                  </td>

                  {/* BOTÓN ELIMINAR */}
                  <td className="py-2 px-4  border">
                    <button
                      onClick={() => eliminarEquipo(equipo.id)}
                      className="text-red-600 hover:text-red-800 font-semibold hover:underline"
                    >
                      Eliminar   
                    </button>
                      <Link
                        href={`/admin/equipos/${equipo.id}/editar`}
                         className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                        Modificar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}