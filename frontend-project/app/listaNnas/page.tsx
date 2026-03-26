"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ConsultarNNAs() {
  const [nnas, setNnas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const res = await fetch("http://localhost:8000/nnas/");
      setNnas(await res.json());
      setCargando(false);
    };
    cargar();
  }, []);

  const eliminarNNA = async (id: number) => {
  const confirmar = confirm("¿Eliminar NNA definitivamente?");
  if (!confirmar) return;

  try {
    const res = await fetch(`http://localhost:8000/nnas/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error();

    alert("NNA eliminado");

    // 🔥 Recargar página
    window.location.reload();

  } catch (error) {
    alert("Error al eliminar");
  }
};

  return (
    <body className="bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span>Bienvenido, Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Niñas, Niños y Adolescentes
          </h2>
          <Link
            href="/nnas/registrar"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            + Registrar NNA
          </Link>
        </div>

        {cargando ? (
          <p className="text-gray-500">Cargando registros...</p>
        ) : nnas.length === 0 ? (
          <p className="text-gray-500">No hay NNAs registrados.</p>
        ) : (
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left border">Nombre</th>
                <th className="py-3 px-4 text-left border">CURP</th>
                <th className="py-3 px-4 text-left border">Fecha de nacimiento</th>
                <th className="py-3 px-4 text-left border">Sexo</th>
                <th className="py-3 px-4 text-left border">Estatus escolar</th>
                <th className="py-3 px-4 text-left border">Equipo asignado</th>
                <th className="py-3 px-4 text-left border">Estatus</th>
                <th className="py-3 px-4 text-center border">Acciones</th>
                <th className="py-3 px-4 text-center border">Gestión</th>

              </tr>
            </thead>
            <tbody>
              {nnas.map((nna: any) => (
                <tr key={nna.id}>
                  <td className="py-2 px-4 border">
                    <Link href={`/nnas/${nna.id}`}>
                      <span className="text-blue-600 cursor-pointer hover:underline">
                        {nna.nombre} {nna.primer_apellido} {nna.segundo_apellido}
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.curp || "—"}
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.fecha_nacimiento}
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.sexo || "—"}
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.estatus_escolar?.descripcion || "—"}
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.equipo_asignado?.nombre_equipo || "Sin equipo"}
                  </td>
                  <td className="py-2 px-4 border text-sm">
                    {nna.activo ? "Activo" : "Inactivo"}
                  </td>
                  <td className="py-2 px-4 border text-center">
                    <Link href={`/nnas/editar/${nna.id}`}>
                      <span className="text-blue-600 cursor-pointer hover:underline text-sm">
                        Editar
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                        onClick={() => eliminarNNA(nna.id)}
                        className="text-red-600 hover:underline"
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
    </body>
  );
}
