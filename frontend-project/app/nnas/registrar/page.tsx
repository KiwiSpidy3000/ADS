"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RegistrarNNA() {
  const [estatusEscolar, setEstatusEscolar] = useState([]);
  const [equipos, setEquipos]               = useState([]);
  const [tutores, setTutores]               = useState([]);
  const [tiposVivienda, setTiposVivienda]   = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);

  const [cpInput, setCpInput]   = useState("");
  const [datosCP, setDatosCP]   = useState<any>(null);
  const [cpCargando, setCpCargando] = useState(false);
  const [cpError, setCpError]   = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    curp: "",
    nacionalidad_id: "1", // Por defecto Mexicana (ID 1)
    es_migrante: false,
    estatus_escolar_id: "",
    tutor_id: "",
    equipo_asignado_id: "",
    // Dirección
    calle: "",
    num_exterior: "",
    num_interior: "",
    colonia_id: "",
    pueblo_comunidad: "",
    vivienda_nna_id: "",
  });

  const [enviando, setEnviando] = useState(false);

  

  // ── Cargar catálogos ────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      const [escolarRes, equiposRes, tutoresRes, viviendaRes, nacRes] = await Promise.all([
        fetch("http://localhost:8000/catalogos/grado-escolar"),
        fetch("http://localhost:8000/equipos/"),
        fetch("http://localhost:8000/tutores/"),
        fetch("http://localhost:8000/catalogos/tipos-vivienda-nna"),
        fetch("http://localhost:8000/catalogos/nacionalidades"),
      ]);
      setEstatusEscolar(await escolarRes.json());
      setEquipos(await equiposRes.json());
      setTutores(await tutoresRes.json());
      setTiposVivienda(await viviendaRes.json());
      setNacionalidades(await nacRes.json());
    };
    cargar();
  }, []);

  // ── Buscar por código postal ────────────────────────────────
  const buscarCP = async () => {
    if (cpInput.length !== 5) {
      setCpError("El código postal debe tener 5 dígitos.");
      return;
    }
    setCpError("");
    setCpCargando(true);
    setDatosCP(null);
    setFormData(f => ({ ...f, colonia_id: "" }));

    try {
      const res = await fetch(
        `http://localhost:8000/catalogos/por-codigo-postal/${cpInput}`
      );
      if (!res.ok) {
        setCpError("No se encontró información para ese código postal.");
        return;
      }
      setDatosCP(await res.json());
    } catch {
      setCpError("Error al consultar el servidor.");
    } finally {
      setCpCargando(false);
    }
  };

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      ...formData,
      nacionalidad_id:    formData.nacionalidad_id    ? Number(formData.nacionalidad_id)    : null,
      grado_escolar_id:   formData.estatus_escolar_id ? Number(formData.estatus_escolar_id) : null,
      tutor_id:           formData.tutor_id           ? Number(formData.tutor_id)           : null,
      equipo_asignado_id: formData.equipo_asignado_id ? Number(formData.equipo_asignado_id) : null,
      colonia_id:         formData.colonia_id         ? Number(formData.colonia_id)         : null,
      vivienda_nna_id:    formData.vivienda_nna_id    ? Number(formData.vivienda_nna_id)    : null,
    };
    delete (payload as any).estatus_escolar_id;

    const res = await fetch("http://localhost:8000/nnas/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);
    if (res.ok) window.location.href = "/listaNnas";
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div>
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span>Bienvenido, Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Registrar NNA</h2>
          <Link
            href="/listaNnnas
            "
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancelar
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Datos personales */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">
              Datos personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="nombre" required placeholder="Nombre(s)"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="primer_apellido" required placeholder="Apellido paterno"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="segundo_apellido" required placeholder="Apellido materno"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <input type="date" name="fecha_nacimiento" required
                className="w-full border p-2 rounded" onChange={handleChange} />
              <select name="sexo" className="w-full border p-2 rounded" onChange={handleChange}>
                <option value="">Seleccionar sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              <input name="curp" maxLength={18} placeholder="CURP (opcional)"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <select name="nacionalidad_id" className="w-full border p-2 rounded" onChange={handleChange} value={formData.nacionalidad_id}>
                <option value="">Seleccionar nacionalidad</option>
                {nacionalidades.map((n: any) => (
                  <option key={n.id} value={n.id}>{n.nombre}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700 self-center">
                <input type="checkbox" name="es_migrante" onChange={handleChange}
                  className="w-4 h-4" />
                Es migrante
              </label>
            </div>
          </div>

          {/* Información escolar y asignación */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">
              Escolaridad y asignación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select name="estatus_escolar_id" className="w-full border p-2 rounded"
                onChange={handleChange}>
                <option value="">Grado escolar</option>
                {estatusEscolar.map((e: any) => (
                  <option key={e.id} value={e.id}>{e.descripcion}</option>
                ))}
              </select>
              <select name="tutor_id" className="w-full border p-2 rounded"
                onChange={handleChange}>
                <option value="">Seleccionar tutor</option>
                {tutores.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} {t.primer_apellido} {t.segundo_apellido}
                  </option>
                ))}
              </select>
              <select name="equipo_asignado_id" className="w-full border p-2 rounded"
                onChange={handleChange}>
                <option value="">Equipo asignado</option>
                {equipos.map((eq: any) => (
                  <option key={eq.id} value={eq.id}>{eq.nombre_equipo}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Domicilio */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">
              Domicilio
            </h3>

            {/* Código postal */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Código postal</label>
              <div className="flex gap-2">
                <input
                  type="text" maxLength={5} placeholder="Ej. 01000"
                  value={cpInput}
                  onChange={e => { setCpInput(e.target.value); setCpError(""); }}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), buscarCP())}
                  className="w-full border p-2 rounded"
                />
                <button type="button" onClick={buscarCP} disabled={cpCargando}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 whitespace-nowrap">
                  {cpCargando ? "Buscando..." : "Buscar"}
                </button>
              </div>
              {cpError && <p className="text-red-500 text-sm mt-1">{cpError}</p>}
            </div>

            {/* Datos autocompletados por CP */}
            {datosCP && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 border border-blue-100 rounded">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Estado</label>
                  <input readOnly value={datosCP.estado.nombre}
                    className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Municipio / Alcaldía</label>
                  <input readOnly value={datosCP.municipio.nombre}
                    className="w-full border p-2 rounded bg-gray-100 text-gray-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Colonia</label>
                  <select name="colonia_id" required className="w-full border p-2 rounded"
                    onChange={handleChange}>
                    <option value="">Seleccionar colonia</option>
                    {datosCP.colonias.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <input name="calle" placeholder="Calle"
                  className="w-full border p-2 rounded" onChange={handleChange} />
              </div>
              <input name="num_exterior" placeholder="Núm. exterior"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="num_interior" placeholder="Núm. interior"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <input name="pueblo_comunidad" placeholder="Pueblo / Comunidad"
                className="w-full border p-2 rounded" onChange={handleChange} />
              <select name="vivienda_nna_id" className="w-full border p-2 rounded"
                onChange={handleChange}>
                <option value="">Tipo de vivienda</option>
                {tiposVivienda.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.descripcion}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Link href="/listaNnas"
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
              Cancelar
            </Link>
            <button type="submit" disabled={enviando}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300">
              {enviando ? "Guardando..." : "Guardar registro"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
