"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarEquipo() {
  const { id } = useParams();
  const router = useRouter();

  const [equipo, setEquipo] = useState<any>(null);
  const [nombre, setNombre] = useState("");

  // ✅ Cargar equipo
  const cargarEquipo = async () => {
    const res = await fetch(`http://localhost:8000/equipos/${id}`);
    const data = await res.json();
    setEquipo(data);
    setNombre(data.nombre_equipo);
  };

  useEffect(() => {
    cargarEquipo();
  }, [id]);

  // ✅ ACTUALIZAR NOMBRE
  const actualizar = async () => {
    try {
      const res = await fetch(`http://localhost:8000/equipos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre_equipo: nombre }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setEquipo(data);

      alert("Equipo actualizado");

    } catch (error) {
      alert("Error al actualizar");
    }
  };

  //  ELIMINAR INTEGRANTE
const eliminarIntegrante = async (integrante_id: number) => {
  const confirmar = confirm("¿Eliminar integrante?");
  if (!confirmar) return;

  const motivo = prompt("Escribe el motivo de la baja:");

  if (!motivo) {
    alert("El motivo es obligatorio");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:8000/equipos/integrantes/${integrante_id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motivo_cambio: motivo,
        }),
      }
    );

    if (!res.ok) throw new Error();

    const data = await res.json();
    setEquipo(data);

  } catch (error) {
    alert("Error al eliminar integrante");
  }
};
  if (!equipo) return <p className="p-6">Cargando...</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <Link href="/admin" className="hover:underline">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </Link>
        <span>Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">
          Editar equipo #{id}
        </h2>

        {/* INPUT NOMBRE */}
        <div className="mb-6">
          <label className="block mb-2 font-medium">
            Nombre del equipo
          </label>

          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border p-2 w-full rounded"
          />

          <button
            onClick={actualizar}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </div>

        {/* INTEGRANTES */}
        <h3 className="text-xl font-semibold mb-3">
          Integrantes
        </h3>

        {equipo.integrantes?.length > 0 ? (
          <ul className="space-y-2">
            {equipo.integrantes.map((i: any) => (
              <li
                key={i.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <span>
                  {i.usuario.nombre} {i.usuario.primer_apellido}
                </span>

                <button
                  onClick={() => eliminarIntegrante(i.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Sin integrantes</p>
        )}
      </div>
    </div>
  );
}