"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
export default function PerfilUsuario() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  const eliminarUsuario = async (id: number) => {
  const confirmar = confirm("¿Está seguro que desea eliminar este usuario?");

  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar");
    }

    alert("Usuario eliminado correctamente");


    window.location.href = "/listaUsuarios";


  } catch (error) {
    console.error(error);
    alert("Hubo un error al eliminar");
  }
};


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
         <div className="flex-1 space-y-10">
            {/* NOMBRE GRANDE */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                {usuario.nombre} {usuario.primer_apellido} {usuario.segundo_apellido}
              </h2>
              <p className="text-xl text-gray-600 mt-2">
                {usuario.correo}
              </p>
            </div>

            {/* INFORMACIÓN PERSONAL */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <p><span className="font-semibold">Fecha de nacimiento:</span> {usuario.fecha_nacimiento}</p>
                <p><span className="font-semibold">CURP:</span> {usuario.curp}</p>
                <p><span className="font-semibold">RFC:</span> {usuario.rfc}</p>
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Dirección
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <p><span className="font-semibold">Calle:</span> {usuario.calle}</p>
                <p><span className="font-semibold">No. Exterior:</span> {usuario.num_exterior}</p>
                <p><span className="font-semibold">No. Interior:</span> {usuario.num_interior || "N/A"}</p>
                <p><span className="font-semibold">Colonia:</span> {usuario.colonia}</p>
                <p><span className="font-semibold">Código Postal:</span> {usuario.codigo_postal}</p>
                <p><span className="font-semibold">Municipio / Alcaldía:</span> {usuario.municipio_alcaldia}</p>
                <p><span className="font-semibold">Estado:</span> {usuario.estado?.nombre}</p>
                <p><span className="font-semibold">Tipo de vivienda:</span> {usuario.tipo_vivienda?.nombre}</p>
              </div>
            </div>

            {/* INFORMACIÓN DEL SISTEMA */}
            <div className="border-t pt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Información del Sistema
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <p><span className="font-semibold">Rol:</span> {usuario.rol?.nombre}</p>
                <p>
                  <span className="font-semibold">Estado de cuenta:</span>{" "}
                  <span className={usuario.activo ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
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
                <button className="bg-orange-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-red-700 transition">
                  Revocar
                </button>
              </Link>
            ) : (
              <button className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700 transition">
                Activar
              </button>
            )}

            <button
              onClick={() => eliminarUsuario(usuario.id)}
               className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700 transition">
              Eliminar
              </button>
          
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