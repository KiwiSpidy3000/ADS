"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
export default function PerfilUsuario() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:8000/usuarios/por_id/${id}`);
        const data = await response.json();
        setUsuario(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) obtenerUsuario();
  }, [id]);

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-gray-500 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <body className="bg-gray-100 min-h-screen">

      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        <span>Bienvenido, Administrador</span>
      </nav>

      {/* CONTENIDO */}
      <div className="flex justify-center items-center py-16 px-6">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-6xl p-12">

          <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Perfil de Usuario
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-16">

            {/* FOTO GRANDE */}
            <div className="flex flex-col items-center">
            <Image
                src="/resources/foto.jpg"
                alt="Foto de perfil"
                width={256}
                height={256}
                className="rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
            <p className="mt-6 text-gray-500 text-sm">
                Imagen de perfil
            </p>
            </div>

            {/* DATOS GRANDES */}
            <div className="flex-1 space-y-8">

              <div>
                <h2 className="text-3xl font-semibold text-gray-900">
                  {usuario.nombre}
                </h2>
                <p className="text-xl text-gray-600 mt-2">
                  {usuario.correo}
                </p>
              </div>

              <div className="border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">

                <div>
                  <span className="font-semibold text-gray-700">Rol:</span>
                  <p className="mt-1 text-gray-800">
                    {usuario.rol?.nombre_rol}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Estado:</span>
                  <p className="mt-1 text-gray-800">
                    {usuario.estado?.nombre}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">
                    Tipo de vivienda:
                  </span>
                  <p className="mt-1 text-gray-800">
                    {usuario.tipo_vivienda?.descripcion}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">
                    Estado de cuenta:
                  </span>
                  <p
                    className={`mt-1 font-semibold ${
                      usuario.activo ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-16 flex justify-center gap-10">

            <Link href={`/modificarUsuario/${usuario.id}`}>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
                Modificar
              </button>
            </Link>

            {usuario.activo ? (
              <Link href={`/revocarAcceso/${usuario.id}`}>
                <button className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-red-700 transition">
                  Revocar
                </button>
              </Link>
            ) : (
              <button className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700 transition">
                Activar
              </button>
            )}

            <button
              onClick={() => router.back()}
              className="bg-gray-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-700 transition"
            >
              Volver
            </button>

          </div>

        </div>
      </div>
    </body>
  );
}