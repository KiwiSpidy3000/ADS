"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NuevoRegistro() {
  const [roles, setRoles] = useState([]);
  const [estados, setEstados] = useState([]);
  const [tiposVivienda, setTiposVivienda] = useState([]);
  const [colonias, setColonias] = useState([]);
  const [codigosPostales, setCodigosPostales] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    curp: "",
    rfc: "",
    fecha_nacimiento: "",
    correo: "",
    password: "",
    sexo: "",
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
      const [rolesRes, estadosRes, viviendaRes, coloniasRes, cpRes, municipiosRes] =
        await Promise.all([
          fetch("http://localhost:8000/catalogos/roles"),
          fetch("http://localhost:8000/catalogos/estados"),
          fetch("http://localhost:8000/catalogos/tipos-vivienda"),
          fetch("http://localhost:8000/catalogos/colonias"),
          fetch("http://localhost:8000/catalogos/codigos-postales"),
          fetch("http://localhost:8000/catalogos/municipios"),
        ]);

      setRoles(await rolesRes.json());
      setEstados(await estadosRes.json());
      setTiposVivienda(await viviendaRes.json());
      setColonias(await coloniasRes.json());
      setCodigosPostales(await cpRes.json());
      setMunicipios(await municipiosRes.json());
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
      body: JSON.stringify({
        ...formData,
        colonia: Number(formData.colonia),
        codigo_postal: Number(formData.codigo_postal),
        municipio_alcaldia: Number(formData.municipio_alcaldia),
        rol_id: Number(formData.rol_id),
        estado_id: Number(formData.estado_id),
        tipo_vivienda_id: Number(formData.tipo_vivienda_id),
      }),
    });

    window.location.href = "/listaUsuarios";
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

            {/* ✔ AGREGADO: Sexo */}
            <select name="sexo" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <input name="calle" placeholder="Calle" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="num_exterior" placeholder="Número Exterior" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="num_interior" placeholder="Número Interior" className="w-full border p-2 rounded" onChange={handleChange} />

            {/* ✔ CORREGIDO: Colonia como select desde catálogo */}
            <select name="colonia" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Colonia</option>
              {colonias.map((colonia: any) => (
                <option key={colonia.id} value={colonia.id}>
                  {colonia.nombre_colonia}
                </option>
              ))}
            </select>

            {/* ✔ CORREGIDO: Código Postal como select desde catálogo */}
            <select name="codigo_postal" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Código Postal</option>
              {codigosPostales.map((cp: any) => (
                <option key={cp.id} value={cp.id}>
                  {cp.numero}
                </option>
              ))}
            </select>

            {/* ✔ CORREGIDO: Municipio como select desde catálogo */}
            <select name="municipio_alcaldia" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Municipio / Alcaldía</option>
              {municipios.map((municipio: any) => (
                <option key={municipio.id} value={municipio.id}>
                  {municipio.nombre_municipio}
                </option>
              ))}
            </select>

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