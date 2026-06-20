"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function PerfilNNA() {
  const { id } = useParams();
  const router = useRouter();
  const [nna, setNna] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // ── Fetch NNA ──────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const obtenerNNA = async () => {
      try {
        const res = await fetch(`http://localhost:8000/nnas/${id}`);
        if (!res.ok) throw new Error("NNA no encontrado");
        const data = await res.json();
        setNna(data);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    obtenerNNA();
  }, [id]);

  // ── Eliminar ───────────────────────────────────
  const eliminarNNA = async () => {
    const confirmar = confirm("¿Eliminar NNA definitivamente?");
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:8000/nnas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      alert("NNA eliminado");
      router.push("/nnas");

    } catch (error) {
      alert("Error al eliminar");
    }
  };

  // ── Estados ────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (!nna) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <p>No se encontró el NNA</p>
        <button onClick={() => router.back()} className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver
        </button>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────
  const nombreCompleto = `${nna.nombre} ${nna.primer_apellido} ${nna.segundo_apellido}`;

  const fechaNacimiento = nna.fecha_nacimiento
    ? format(new Date(nna.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
    : "No disponible";

  const tutor = nna.tutor;

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        <span>Administrador</span>
      </nav>

      {/* CONTENIDO */}
      <div className="flex justify-center py-16 px-6">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-6xl p-12">

          <h1 className="text-4xl font-bold text-center mb-12">
            Perfil del NNA
          </h1>

          <div className="flex flex-col md:flex-row gap-16">

            {/* FOTO */}
            <div className="flex flex-col items-center">
              <Image
                src="/resources/nna.png"
                alt="Foto NNA"
                width={200}
                height={200}
                className="rounded-full border-4 border-blue-500"
              />
            </div>

            {/* DATOS */}
            <div className="flex-1 space-y-10">

              {/* NOMBRE */}
              <div>
                <h2 className="text-3xl font-semibold">{nombreCompleto}</h2>
              </div>

              {/* INFO PERSONAL */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Información Personal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><b>Fecha de nacimiento:</b> {fechaNacimiento}</p>
                  <p><b>Sexo:</b> {nna.sexo}</p>
                  <p><b>CURP:</b> {nna.curp}</p>
                  <p><b>Nacionalidad:</b> {nna.nacionalidad?.nombre || "No especificada"}</p>
                </div>
              </div>

              {/* TUTOR */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Tutor</h3>

                {tutor ? (
                  <p>
                    {tutor.nombre} {tutor.primer_apellido} {tutor.segundo_apellido}
                  </p>
                ) : (
                  <p className="text-gray-400">Sin tutor asignado</p>
                )}
              </div>

              {/* EQUIPO */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Equipo</h3>

                <p>
                  {nna.equipo_asignado?.nombre_equipo || "No asignado"}
                </p>
              </div>

              {/* GRADO ESCOLAR */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Grado Escolar</h3>

                <p>
                  {nna.grado_escolar?.descripcion || "No definido"}
                </p>
              </div>
{/* DIRECCIÓN */}
<div className="border-t pt-6">
  <h3 className="text-xl font-bold mb-4">Dirección</h3>

  {nna.direccion ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <p><b>Calle:</b> {nna.direccion.calle || "N/A"}</p>

      <p><b>No. Exterior:</b> {nna.direccion.num_exterior || "N/A"}</p>

      <p><b>No. Interior:</b> {nna.direccion.num_interior || "N/A"}</p>

      <p>
        <b>Colonia:</b>{" "}
        {nna.direccion.colonia?.nombre || "No especificado"}
      </p>

      <p>
        <b>Código Postal:</b>{" "}
        {nna.direccion.colonia?.codigo_postal || "No especificado"}
      </p>

      <p>
        <b>Pueblo/Comunidad:</b>{" "}
        {nna.direccion.pueblo_comunidad || "No especificado"}
      </p>

      <p>
        <b>Tipo de vivienda:</b>{" "}
        {nna.direccion.vivienda_nna?.descripcion || "No especificado"}
      </p>

    </div>
  ) : (
    <p className="text-gray-400">Sin dirección registrada</p>
  )}
</div>

            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-12 flex justify-center gap-4 flex-wrap">

            <Link href={`/nnas/editar/${nna.id}`}>
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                Modificar
              </button>
            </Link>

            <button
              onClick={eliminarNNA}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Eliminar
            </button>

            <button
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Volver
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}