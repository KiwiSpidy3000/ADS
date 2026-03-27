"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RegistrarEquipo() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [enviando, setEnviando] = useState(false);


  const toggleUsuario = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    await fetch("http://localhost:8000/equipos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_equipo: nombreEquipo,
        usuario_ids: seleccionados,
      }),
    });

    setEnviando(false);
    window.location.href = "/listaEquipos";
  };

  return (
    <body className="bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin"
            className=" text-white px-4 py-2 rounded hover:bg-blue-600">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
          </a>
        <span>Bienvenido, Administrador</span>

      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Registrar equipo</h2>
          <Link
            href="/listaEquipos"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Nombre del equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del equipo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Equipo Norte"
              value={nombreEquipo}
              onChange={e => setNombreEquipo(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>


          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enviando}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {enviando ? "Guardando..." : "Guardar equipo"}
            </button>
          </div>

        </form>
      </div>
    </body>
  );
}
