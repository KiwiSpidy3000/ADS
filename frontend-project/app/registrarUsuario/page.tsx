"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function NuevoRegistro() {
  const [roles, setRoles] = useState([]);
  const [tiposVivienda, setTiposVivienda] = useState([]);

  // Datos que llegan del endpoint de código postal
  const [colonias, setColonias] = useState<{ id: number; nombre: string }[]>([]);
  const [cpBuscado, setCpBuscado] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");

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
    colonia_id: "",
    codigo_postal: "",
    municipio_id: "",
    municipio_nombre: "",
    estado_id: "",
    estado_nombre: "",
    rol_id: "",
    tipo_vivienda_id: "",
  });

  useEffect(() => {
    const cargarCatalogos = async () => {
      const [rolesRes, viviendaRes] = await Promise.all([
        fetch("http://localhost:8000/catalogos/roles"),
        fetch("http://localhost:8000/catalogos/tipos-vivienda"),
      ]);
      setRoles(await rolesRes.json());
      setTiposVivienda(await viviendaRes.json());
    };
    cargarCatalogos();
  }, []);

  // Buscar datos por código postal
  const buscarPorCodigoPostal = async () => {
    if (!cpBuscado.trim()) {
      setCpError("Ingresa un código postal");
      return;
    }
    setCpLoading(true);
    setCpError("");
    setColonias([]);

    try {
      const res = await fetch(
        `http://localhost:8000/catalogos/por-codigo-postal/${cpBuscado.trim()}`
      );

      if (!res.ok) {
        setCpError("No se encontraron datos para ese código postal");
        setFormData((prev) => ({
          ...prev,
          codigo_postal: "",
          municipio_id: "",
          municipio_nombre: "",
          estado_id: "",
          estado_nombre: "",
          colonia_id: "",
        }));
        return;
      }

      const data = await res.json();
      // data = { codigo_postal, estado: {id, nombre}, municipio: {id, nombre}, colonias: [{id, nombre}] }

      setColonias(data.colonias);
      setFormData((prev) => ({
        ...prev,
        codigo_postal: data.codigo_postal,
        municipio_id: String(data.municipio.id),
        municipio_nombre: data.municipio.nombre,
        estado_id: String(data.estado.id),
        estado_nombre: data.estado.nombre,
        colonia_id: "", // reset para que el usuario elija
      }));
    } catch {
      setCpError("Error al conectar con el servidor");
    } finally {
      setCpLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("http://localhost:8000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: formData.nombre,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido,
        curp: formData.curp,
        rfc: formData.rfc,
        fecha_nacimiento: formData.fecha_nacimiento,
        correo: formData.correo,
        password: formData.password,
        sexo: formData.sexo,
        calle: formData.calle,
        num_exterior: formData.num_exterior,
        num_interior: formData.num_interior,
        colonia_id: Number(formData.colonia_id),
        codigo_postal: formData.codigo_postal,
        municipio_id: Number(formData.municipio_id),
        estado_id: Number(formData.estado_id),
        rol_id: Number(formData.rol_id),
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
            <select name="sexo" className="w-full border p-2 rounded" onChange={handleChange}>
              <option value="">Seleccionar Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="bg-gray-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-gray-700">Dirección</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="calle" placeholder="Calle" className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="num_exterior" placeholder="Número Exterior" className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="num_interior" placeholder="Número Interior" className="w-full border p-2 rounded" onChange={handleChange} />
            </div>

            {/* Búsqueda por Código Postal */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Código Postal
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. 06600"
                  value={cpBuscado}
                  onChange={(e) => setCpBuscado(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscarPorCodigoPostal())}
                  className="flex-1 border p-2 rounded"
                  maxLength={5}
                />
                <button
                  type="button"
                  onClick={buscarPorCodigoPostal}
                  disabled={cpLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {cpLoading ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {cpError && (
                <p className="text-red-500 text-sm mt-1">{cpError}</p>
              )}
            </div>

            {/* Campos autocompletados por CP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado — solo lectura */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.estado_nombre}
                  readOnly
                  placeholder="Se autocompleta con el CP"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Municipio — solo lectura */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Municipio / Alcaldía</label>
                <input
                  type="text"
                  value={formData.municipio_nombre}
                  readOnly
                  placeholder="Se autocompleta con el CP"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Colonia — select dinámico según CP */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
                <select
                  name="colonia_id"
                  className="w-full border p-2 rounded"
                  onChange={handleChange}
                  value={formData.colonia_id}
                  disabled={colonias.length === 0}
                >
                  <option value="">
                    {colonias.length === 0
                      ? "Busca un código postal primero"
                      : "Seleccionar Colonia"}
                  </option>
                  {colonias.map((colonia) => (
                    <option key={colonia.id} value={colonia.id}>
                      {colonia.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de vivienda */}
              <div className="md:col-span-2">
                <select name="tipo_vivienda_id" className="w-full border p-2 rounded" onChange={handleChange}>
                  <option value="">Tipo de Vivienda</option>
                  {tiposVivienda.map((tipo: any) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
