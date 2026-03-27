"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AgregarIntegrante() {
  const { id } = useParams(); // equipo_id
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch("http://localhost:8000/equipos/usuarios-sin-equipo");
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const agregar = async (usuario_id: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/equipos/${id}/integrantes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_id,
            es_momentaneo: false,
            estatus_integrante: "Activo",
          }),
        }
      );

      if (!res.ok) throw new Error("Error");

      alert("Integrante agregado");

      router.push("/listaEquipos");

    } catch (error) {
      console.error(error);
      alert("Error al agregar");
    }
  };

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
          <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Agregar integrante al equipo {id}
      </h1>

      {cargando ? (
        <p>Cargando...</p>
      ) : usuarios.length === 0 ? (
        <p>No hay usuarios disponibles</p>
      ) : (
        <ul className="space-y-2">
          {usuarios.map((u) => (
            <li
              key={u.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <span>
                {u.nombre} {u.primer_apellido}
              </span>

              <button
                onClick={() => agregar(u.id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Añadir
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
     
    
    </div>

  );
}