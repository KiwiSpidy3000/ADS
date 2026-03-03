"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarUsuario() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [estados, setEstados] = useState<any[]>([]);
  const [tiposVivienda, setTiposVivienda] = useState<any[]>([]);
  const [colonias, setColonias] = useState<any[]>([]);
  const [codigosPostales, setCodigosPostales] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [usuarioRes, rolesRes, estadosRes, viviendaRes, coloniasRes, cpRes, municipiosRes] =
          await Promise.all([
            fetch(`http://localhost:8000/usuarios/por_id/${id}`),
            fetch("http://localhost:8000/catalogos/roles"),
            fetch("http://localhost:8000/catalogos/estados"),
            fetch("http://localhost:8000/catalogos/tipos-vivienda"),
            fetch("http://localhost:8000/catalogos/colonias"),
            fetch("http://localhost:8000/catalogos/codigos-postales"),
            fetch("http://localhost:8000/catalogos/municipios"),
          ]);

        const usuario = await usuarioRes.json();

        setFormData({
          ...usuario,
          rol_id: usuario.rol_id ?? "",
          estado_id: usuario.estado_id ?? "",
          tipo_vivienda_id: usuario.tipo_vivienda_id ?? "",
          colonia: usuario.colonia ?? "",
          codigo_postal: usuario.codigo_postal ?? "",
          municipio_alcaldia: usuario.municipio_alcaldia ?? "",
          sexo: usuario.sexo ?? "",
        });

        setRoles(await rolesRes.json());
        setEstados(await estadosRes.json());
        setTiposVivienda(await viviendaRes.json());
        setColonias(await coloniasRes.json());
        setCodigosPostales(await cpRes.json());
        setMunicipios(await municipiosRes.json());

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) cargarDatos();
  }, [id]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    await fetch(`http://localhost:8000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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

    router.push("/listaUsuarios");
  };

  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="text-gray-600 text-lg">Cargando usuario...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-8">

        <h2 className="text-2xl font-bold text-blue-800 mb-6 border-b pb-2">
          Editar Usuario #{id}
        </h2>

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* Datos personales */}
          <div className="grid md:grid-cols-2 gap-4">

            <div className="flex items-center gap-4">
              <label htmlFor="nombre" className="w-44 text-sm font-medium text-gray-700">
                Nombre(s):
              </label>
              <input
                id="nombre"
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="primer_apellido" className="w-44 text-sm font-medium text-gray-700">
                Apellido Paterno:
              </label>
              <input
                id="primer_apellido"
                name="primer_apellido"
                value={formData.primer_apellido || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="segundo_apellido" className="w-44 text-sm font-medium text-gray-700">
                Apellido Materno:
              </label>
              <input
                id="segundo_apellido"
                name="segundo_apellido"
                value={formData.segundo_apellido || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="curp" className="w-44 text-sm font-medium text-gray-700">
                CURP:
              </label>
              <input
                id="curp"
                name="curp"
                value={formData.curp || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="rfc" className="w-44 text-sm font-medium text-gray-700">
                RFC:
              </label>
              <input
                id="rfc"
                name="rfc"
                value={formData.rfc || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="fecha_nacimiento" className="w-44 text-sm font-medium text-gray-700">
                Fecha de Nacimiento:
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            {/* ✔ AGREGADO: Sexo */}
            <div className="flex items-center gap-4">
              <label htmlFor="sexo" className="w-44 text-sm font-medium text-gray-700">
                Sexo:
              </label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

          </div>

          {/* Dirección */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">

            <div className="flex items-center gap-4">
              <label htmlFor="calle" className="w-44 text-sm font-medium text-gray-700">
                Calle:
              </label>
              <input
                id="calle"
                name="calle"
                value={formData.calle || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="num_exterior" className="w-44 text-sm font-medium text-gray-700">
                Número Exterior:
              </label>
              <input
                id="num_exterior"
                name="num_exterior"
                value={formData.num_exterior || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="num_interior" className="w-44 text-sm font-medium text-gray-700">
                Número Interior:
              </label>
              <input
                id="num_interior"
                name="num_interior"
                value={formData.num_interior || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            {/* ✔ CORREGIDO: Colonia como select desde catálogo */}
            <div className="flex items-center gap-4">
              <label htmlFor="colonia" className="w-44 text-sm font-medium text-gray-700">
                Colonia:
              </label>
              <select
                id="colonia"
                name="colonia"
                value={formData.colonia}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Colonia</option>
                {colonias.map((colonia) => (
                  <option key={colonia.id} value={colonia.id}>
                    {colonia.nombre_colonia}
                  </option>
                ))}
              </select>
            </div>

            {/* ✔ CORREGIDO: Código Postal como select desde catálogo */}
            <div className="flex items-center gap-4">
              <label htmlFor="codigo_postal" className="w-44 text-sm font-medium text-gray-700">
                Código Postal:
              </label>
              <select
                id="codigo_postal"
                name="codigo_postal"
                value={formData.codigo_postal}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Código Postal</option>
                {codigosPostales.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.numero}
                  </option>
                ))}
              </select>
            </div>

            {/* ✔ CORREGIDO: Municipio como select desde catálogo */}
            <div className="flex items-center gap-4">
              <label htmlFor="municipio_alcaldia" className="w-44 text-sm font-medium text-gray-700">
                Municipio / Alcaldía:
              </label>
              <select
                id="municipio_alcaldia"
                name="municipio_alcaldia"
                value={formData.municipio_alcaldia}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Municipio / Alcaldía</option>
                {municipios.map((municipio) => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.nombre_municipio}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="estado_id" className="w-44 text-sm font-medium text-gray-700">
                Estado:
              </label>
              <select
                id="estado_id"
                name="estado_id"
                value={formData.estado_id}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="tipo_vivienda_id" className="w-44 text-sm font-medium text-gray-700">
                Tipo de Vivienda:
              </label>
              <select
                id="tipo_vivienda_id"
                name="tipo_vivienda_id"
                value={formData.tipo_vivienda_id}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Tipo</option>
                {tiposVivienda.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Rol y acceso */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">

            <div className="flex items-center gap-4">
              <label htmlFor="rol_id" className="w-44 text-sm font-medium text-gray-700">
                Rol:
              </label>
              <select
                id="rol_id"
                name="rol_id"
                value={formData.rol_id}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre_rol}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="correo" className="w-44 text-sm font-medium text-gray-700">
                Correo Electrónico:
              </label>
              <input
                id="correo"
                type="email"
                name="correo"
                value={formData.correo || ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Link
              href="/listaUsuarios"
              className="bg-gray-400 text-white px-6 py-2 rounded"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800"
            >
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}