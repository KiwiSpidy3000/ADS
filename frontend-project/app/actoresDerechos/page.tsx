"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PersonaFisica {
  curp?: string;
  ocupacion_oficio?: string;
  zona_geografica?: string;
}

interface Actor {
  id: number;
  nombre: string;
  tipo: "persona_fisica" | "asociacion";
  tipo_actor?: { nom_tipo: string };
  tiene_registro_oficial: boolean;
  registro_oficial_num?: string;
  horario_atencion?: string;
  responsable_contacto?: string;
  activo: boolean;
  fecha_registro: string;
  persona_fisica?: PersonaFisica;
}

export default function ActoresPage() {
  const [actores, setActores] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "persona_fisica" | "asociacion">("todos");

useEffect(() => {
  const obtenerActores = async () => {
    try {
      const response = await fetch("http://localhost:8000/actores");
      const data = await response.json();
      // Acepta tanto array directo como objeto envuelto
      setActores(Array.isArray(data) ? data : data.items ?? data.actores ?? []);
    } catch (error) {
      console.error("Error al obtener actores:", error);
    } finally {
      setLoading(false);
    }
  };
  obtenerActores();
}, []);

  const eliminarActor = async (id: number) => {
    const confirmar = confirm("¿Está seguro que desea eliminar este actor?");
    if (!confirmar) return;
    try {
      const response = await fetch(`http://localhost:8000/actores/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar");
      alert("Actor eliminado correctamente");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar");
    }
  };

  const actoresFiltrados = actores.filter((a) =>
    filtro === "todos" ? true : a.tipo === filtro
  );

  return (
    <div className="bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="text-white px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span className="self-center">Bienvenido, Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        {/* Encabezado */}
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Actores en Materia de Derechos
          </h2>
          <a
            href="/actoresDerechos/registrar"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Registrar Actor
          </a>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(["todos", "persona_fisica", "asociacion"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-1 rounded-full text-sm font-medium border transition-colors ${
                filtro === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
            >
              {f === "todos"
                ? "Todos"
                : f === "persona_fisica"
                ? "Persona Física"
                : "Asociación"}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-gray-500">
            {actoresFiltrados.length} registro(s)
          </span>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className="text-center text-gray-500 py-10">Cargando actores...</p>
        ) : actoresFiltrados.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No hay actores registrados.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left border">Nombre</th>
                <th className="py-3 px-4 text-left border">Tipo</th>
                <th className="py-3 px-4 text-left border">Categoría</th>
                <th className="py-3 px-4 text-left border">Registro oficial</th>
                <th className="py-3 px-4 text-left border">Horario</th>
                <th className="py-3 px-4 text-center border">Estatus</th>
                <th className="py-3 px-4 text-center border">Acciones</th>
                <th className="py-3 px-4 text-center border">Administración</th>
              </tr>
            </thead>
            <tbody>
              {actoresFiltrados.map((actor) => (
                <tr key={actor.id} className="hover:bg-gray-50">
                  {/* Nombre */}
                  <td className="py-2 px-4 border">
                    <Link href={`/actoresDerechos/${actor.id}`}>
                      <span className="text-blue-600 cursor-pointer hover:underline font-medium">
                        {actor.nombre}
                      </span>
                    </Link>
                    {actor.responsable_contacto && (
                      <p className="text-xs text-gray-400">{actor.responsable_contacto}</p>
                    )}
                  </td>

                  {/* Tipo */}
                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        actor.tipo === "persona_fisica"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {actor.tipo === "persona_fisica" ? "Persona Física" : "Asociación"}
                    </span>
                  </td>

                  {/* Categoría / tipo_actor */}
                  <td className="py-2 px-4 border text-sm text-gray-600">
                    {actor.tipo_actor?.nom_tipo || "—"}
                  </td>

                  {/* Registro oficial */}
                  <td className="py-2 px-4 border text-sm">
                    {actor.tiene_registro_oficial ? (
                      <span className="text-gray-700">
                        {actor.registro_oficial_num || "Sí"}
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>

                  {/* Horario */}
                  <td className="py-2 px-4 border text-sm text-gray-600">
                    {actor.horario_atencion || "—"}
                  </td>

                  {/* Estatus */}
                  <td className="py-2 px-4 border text-center">
                    {actor.activo ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        Activo
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        Inactivo
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-2 px-4 border text-center">
                    <div className="flex justify-center items-center gap-4">
                      <Link href={`/actores/modificar/${actor.id}`}>
                        <span className="text-blue-600 cursor-pointer hover:underline text-sm">
                          Modificar
                        </span>
                      </Link>
                      {actor.activo ? (
                        <Link href={`/actores/revocar/${actor.id}`}>
                          <span className="text-red-600 cursor-pointer hover:underline text-sm">
                            Revocar
                          </span>
                        </Link>
                      ) : (
                        <span className="text-green-600 cursor-pointer hover:underline text-sm">
                          Activar
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Administración */}
                  <td className="py-2 px-4 border text-center">
                    <button
                      onClick={() => eliminarActor(actor.id)}
                      className="text-red-700 hover:underline cursor-pointer text-sm"
                    >
                      Eliminar
                    </button>
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
