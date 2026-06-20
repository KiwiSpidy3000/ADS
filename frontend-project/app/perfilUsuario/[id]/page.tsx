"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PerfilUsuario() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // ── Fetch usuario por ID ──────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const obtenerUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:8000/usuarios/${id}`);
        if (!response.ok) throw new Error("Usuario no encontrado");
        const data = await response.json();
        setUsuario(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, [id]);

  // ── Acciones ──────────────────────────────────────────────
  const eliminarUsuario = async () => {
    const confirmar = confirm("¿Está seguro que desea eliminar este usuario?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar");
      alert("Usuario eliminado correctamente");
      router.push("/listaUsuarios");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al eliminar");
    }
  };

  const revocarAcceso = async () => {
    const confirmar = confirm("¿Está seguro que desea revocar el acceso de este usuario?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}/revocar`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error al revocar");
      const data = await response.json();
      setUsuario(data);
      alert("Acceso revocado correctamente");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al revocar el acceso");
    }
  };

  const reactivarAcceso = async () => {
    const confirmar = confirm("¿Está seguro que desea reactivar el acceso de este usuario?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}/reactivar`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error al reactivar");
      const data = await response.json();
      setUsuario(data);
      alert("Usuario reactivado correctamente");
    } catch (error) {
      console.error(error);
      alert("Hubo un error al reactivar");
    }
  };

  // ── Estados de carga ──────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <p className="text-gray-500 text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center flex-col gap-4">
        <p className="text-red-500 text-lg">No se encontró el usuario.</p>
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-6 py-2 rounded-xl hover:bg-gray-700 transition"
        >
          Volver
        </button>
      </div>
    );
  }

  // ── Helpers de presentación ───────────────────────────────
  const nombreCompleto = [usuario.nombre, usuario.primer_apellido, usuario.segundo_apellido]
    .filter(Boolean)
    .join(" ");

  const fechaRegistro = usuario.fecha_registro
    ? format(new Date(usuario.fecha_registro), "dd/MM/yyyy HH:mm", { locale: es })
    : "No disponible";

  const fechaNacimiento = usuario.fecha_nacimiento
    ? format(new Date(usuario.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
    : "No disponible";

  // Dirección — viene anidada en usuario.direccion
  const dir = usuario.direccion;
  const colonia = dir?.colonia;
  const tipoVivienda = dir?.tipo_vivienda;

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        <span>Bienvenido, Administrador</span>
      </nav>

      {/* CONTENIDO */}
      <div className="flex justify-center items-start py-16 px-6">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-6xl p-12">

          <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
            Perfil de Usuario
          </h1>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-16">

            {/* FOTO */}
            <div className="flex flex-col items-center shrink-0">
              <Image
                src="/resources/foto.jpg"
                alt="Foto de perfil"
                width={256}
                height={256}
                className="rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
              <p className="mt-4 text-gray-500 text-sm">Imagen de perfil</p>

              {/* Badge de estado debajo de la foto */}
              <span
                className={`mt-4 px-4 py-1 rounded-full text-sm font-semibold ${
                  usuario.activo
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {usuario.activo ? "● Activo" : "● Inactivo"}
              </span>
            </div>

            {/* DATOS */}
            <div className="flex-1 space-y-10">

              {/* NOMBRE Y CORREO */}
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">{nombreCompleto}</h2>
                <p className="text-xl text-gray-500 mt-2">{usuario.correo}</p>
              </div>

              {/* INFORMACIÓN PERSONAL */}
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                  <p><span className="font-semibold">Fecha de nacimiento:</span> {fechaNacimiento}</p>
                  <p><span className="font-semibold">CURP:</span> {usuario.curp}</p>
                  <p><span className="font-semibold">RFC:</span> {usuario.rfc}</p>
                  <p>
                    <span className="font-semibold">Sexo:</span>{" "}
                    {usuario.sexo}
                  </p>
                </div>
              </div>

              {/* DIRECCIÓN — usa usuario.direccion anidado */}
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Dirección</h3>

                {dir ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                    <p><span className="font-semibold">Calle:</span> {dir.calle || "N/A"}</p>
                    <p><span className="font-semibold">No. Exterior:</span> {dir.num_exterior || "N/A"}</p>
                    <p><span className="font-semibold">No. Interior:</span> {dir.num_interior || "N/A"}</p>
                    <p>
                      <span className="font-semibold">Colonia:</span>{" "}
                      {colonia?.nombre || "No especificado"}
                    </p>
                    <p>
                      <span className="font-semibold">Código Postal:</span>{" "}
                      {colonia?.codigo_postal || "No especificado"}
                    </p>
                    <p>
                      <span className="font-semibold">Tipo de vivienda:</span>{" "}
                      {tipoVivienda?.descripcion || "No especificado"}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">Sin dirección registrada</p>
                )}
              </div>

              {/* INFORMACIÓN DEL SISTEMA */}
              <div className="border-t pt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                  <p>
                    <span className="font-semibold">Rol:</span>{" "}
                    {usuario.rol?.nombre_rol || "No asignado"}
                  </p>
                  <p>
                    <span className="font-semibold">Tipo de personal:</span>{" "}
                    {usuario.tipo_personal ? "Voluntario" : "Empleado"}
                  </p>
                  <p>
                    <span className="font-semibold">Fecha de Registro:</span> {fechaRegistro}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">

            <Link href={`/modificarUsuario/${usuario.id}`}>
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700 transition">
                Modificar
              </button>
            </Link>

            {/* Revocar / Reactivar según estado */}
            {usuario.activo ? (
              <button
                onClick={revocarAcceso}
                className="bg-orange-500 text-white px-8 py-3 rounded-xl text-lg hover:bg-orange-600 transition"
              >
                Revocar acceso
              </button>
            ) : (
              <button
                onClick={reactivarAcceso}
                className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-green-700 transition"
              >
                Reactivar acceso
              </button>
            )}

            <button
              onClick={eliminarUsuario}
              className="bg-red-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-red-700 transition"
            >
              Eliminar
            </button>

            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-8 py-3 rounded-xl text-lg hover:bg-gray-600 transition"
            >
              Volver
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
