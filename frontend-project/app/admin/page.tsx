"use client";

import Link from "next/link";

export default function DashboardAdmin() {
  return (
    <body className="bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        <span>Bienvenido, Administrador</span>
      </nav>
<div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-semibold text-gray-800 mb-6">
    Panel de administración
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <Link href="/listaUsuarios"
      className="bg-blue-600 text-white py-6 rounded-xl hover:bg-blue-700 text-center font-semibold text-lg shadow-md transition transform hover:scale-105">
      Consultar usuarios
    </Link>

    <Link href="/listaEquipos"
      className="bg-blue-600 text-white py-6 rounded-xl hover:bg-blue-700 text-center font-semibold text-lg shadow-md transition transform hover:scale-105">
      Consultar equipos
    </Link>

    <Link href="/listaNnas"
      className="bg-blue-600 text-white py-6 rounded-xl hover:bg-blue-700 text-center font-semibold text-lg shadow-md transition transform hover:scale-105">
      Consultar NNAs
    </Link>

    <Link href="/listActores"
      className="bg-blue-600 text-white py-6 rounded-xl hover:bg-blue-700 text-center font-semibold text-lg shadow-md transition transform hover:scale-105">
      Consultar actores en materia de derecho
    </Link>
  </div>
</div>
    </body>
  );
}
