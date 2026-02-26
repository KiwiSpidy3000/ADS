"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NuevoRegistro() {
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tiposVivienda, setTiposVivienda] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    curp: "",
    rfc: "",
    fecha_nacimiento: "",
    correo: "",
    password: "",
    calle: "",
    num_exterior: "",
    num_interior: "",
    colonia: "",
    codigo_postal: "",
    municipio_alcaldia: "",
    rol_id: "",
    estado_id: "",
    tipo_vivienda_id: "",
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      const [rolesRes, estadosRes, viviendaRes] = await Promise.all([
        fetch("http://localhost:8000/catalogos/roles"),
        fetch("http://localhost:8000/catalogos/estados"),
        fetch("http://localhost:8000/catalogos/tipos-vivienda"),
      ]);

      setRoles(await rolesRes.json());
      setEstados(await estadosRes.json());
      setTiposVivienda(await viviendaRes.json());
    };

    cargarCatalogos();
  }, []);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch("http://localhost:8000/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    window.location.href = "/listausuarios";
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-2">
          Nuevo Registro de Personal
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Datos personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="nombre" placeholder="Nombre(s)" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="primer_apellido" placeholder="Apellido Paterno" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="segundo_apellido" placeholder="Apellido Materno" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="curp" placeholder="CURP" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="rfc" placeholder="RFC" className="w-full border p-2 rounded" onChange={handleChange} />
            <input type="date" name="fecha_nacimiento" className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <input name="calle" placeholder="Calle" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="num_exterior" placeholder="Número Exterior" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="num_interior" placeholder="Número Interior" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="colonia" placeholder="Colonia" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="codigo_postal" placeholder="Código Postal" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="municipio_alcaldia" placeholder="Municipio / Alcaldía" className="w-full border p-2 rounded" onChange={handleChange} />

            <select name="estado_id" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Estado</option>
              {estados.map((estado: any) => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))}
            </select>

            <select name="tipo_vivienda_id" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Tipo de Vivienda</option>
              {tiposVivienda.map((tipo: any) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.descripcion}
                </option>
              ))}
            </select>
          </div>

          {/* Rol */}
          <div className="bg-blue-50 p-4 rounded">
            <select name="rol_id" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Rol</option>
              {roles.map((rol: any) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre_rol}
                </option>
              ))}
            </select>
          </div>

          {/* Acceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="email" name="correo" placeholder="Correo" className="w-full border p-2 rounded" onChange={handleChange} />
            <input type="password" name="password" placeholder="Contraseña Provisional" className="w-full border p-2 rounded" onChange={handleChange} />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link href="/listaUsuarios" className="bg-gray-400 text-white px-6 py-2 rounded">
              Cancelar
            </Link>

            <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}