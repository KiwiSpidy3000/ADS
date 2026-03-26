"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistrarTutor() {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    curp: "",
    nacionalidad: "Mexicana",
    parentesco: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const registrarTutor = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/tutores/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Error al registrar");
      }

      alert("Tutor registrado correctamente");

      router.push("/admin"); // o donde quieras redirigir

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* NAV */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <Link href="/admin">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </Link>
        <span>Administrador</span>
      </nav>

      {/* FORM */}
      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6">
          Registrar Tutor
        </h2>

        <form onSubmit={registrarTutor} className="space-y-4">

          <input
            name="nombre"
            placeholder="Nombre"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="primer_apellido"
            placeholder="Primer apellido"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            name="segundo_apellido"
            placeholder="Segundo apellido"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="date"
            name="fecha_nacimiento"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <select
            name="sexo"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Selecciona sexo</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>

          <input
            name="curp"
            placeholder="CURP"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="parentesco"
            placeholder="Parentesco (Ej. Padre, Madre)"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="nacionalidad"
            value={form.nacionalidad}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
          >
            {loading ? "Registrando..." : "Registrar Tutor"}
          </button>
        </form>
      </div>
    </div>
  );
}