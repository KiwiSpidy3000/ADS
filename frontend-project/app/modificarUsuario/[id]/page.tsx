"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarUsuario() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [roles, setRoles] = useState<any[]>([]);
  const [tiposVivienda, setTiposVivienda] = useState<any[]>([]);

  // Colonias dinámicas por CP
  const [colonias, setColonias] = useState<{ id: number; nombre: string }[]>([]);
  const [cpBuscado, setCpBuscado] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpError, setCpError] = useState("");

  const [formData, setFormData] = useState<any>(null);

  // ── Carga inicial ──────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const cargarDatos = async () => {
      try {
        const [usuarioRes, rolesRes, viviendaRes] = await Promise.all([
          fetch(`http://localhost:8000/usuarios/${id}`),
          fetch("http://localhost:8000/catalogos/roles"),
          fetch("http://localhost:8000/catalogos/tipos-vivienda"),
        ]);

        if (!usuarioRes.ok) throw new Error("Usuario no encontrado");

        const usuario = await usuarioRes.json();
        const dir = usuario.direccion;

        // Si tiene colonia, precargamos las colonias del CP correspondiente
        if (dir?.colonia?.codigo_postal) {
          setCpBuscado(dir.colonia.codigo_postal);
          try {
            const cpRes = await fetch(
              `http://localhost:8000/catalogos/por-codigo-postal/${dir.colonia.codigo_postal}`
            );
            if (cpRes.ok) {
              const cpData = await cpRes.json();
              setColonias(cpData.colonias);
              // Autocompletar nombres de municipio y estado
              setFormData({
                nombre: usuario.nombre ?? "",
                primer_apellido: usuario.primer_apellido ?? "",
                segundo_apellido: usuario.segundo_apellido ?? "",
                curp: usuario.curp ?? "",
                rfc: usuario.rfc ?? "",
                fecha_nacimiento: usuario.fecha_nacimiento ?? "",
                correo: usuario.correo ?? "",
                sexo: usuario.sexo ?? "",
                activo: usuario.activo ?? true,
                tipo_personal: usuario.tipo_personal ?? false,
                rol_id: usuario.rol_id ?? "",
                // Dirección
                calle: dir?.calle ?? "",
                num_exterior: dir?.num_exterior ?? "",
                num_interior: dir?.num_interior ?? "",
                colonia_id: dir?.colonia_id ?? "",
                tipo_vivienda_id: dir?.tipo_vivienda_id ?? "",
                // Solo visualización
                estado_nombre: cpData.estado.nombre,
                municipio_nombre: cpData.municipio.nombre,
              });
            }
          } catch {
            // Si falla el CP, igual cargamos el form sin esos datos
          }
        }

        // Fallback si no había colonia o falló la búsqueda de CP
        if (!formData) {
          setFormData({
            nombre: usuario.nombre ?? "",
            primer_apellido: usuario.primer_apellido ?? "",
            segundo_apellido: usuario.segundo_apellido ?? "",
            curp: usuario.curp ?? "",
            rfc: usuario.rfc ?? "",
            fecha_nacimiento: usuario.fecha_nacimiento ?? "",
            correo: usuario.correo ?? "",
            sexo: usuario.sexo ?? "",
            activo: usuario.activo ?? true,
            tipo_personal: usuario.tipo_personal ?? false,
            rol_id: usuario.rol_id ?? "",
            calle: dir?.calle ?? "",
            num_exterior: dir?.num_exterior ?? "",
            num_interior: dir?.num_interior ?? "",
            colonia_id: dir?.colonia_id ?? "",
            tipo_vivienda_id: dir?.tipo_vivienda_id ?? "",
            estado_nombre: "",
            municipio_nombre: "",
          });
        }

        setRoles(await rolesRes.json());
        setTiposVivienda(await viviendaRes.json());
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  // ── Búsqueda por código postal ────────────────────────────
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
        setFormData((prev: any) => ({
          ...prev,
          estado_nombre: "",
          municipio_nombre: "",
          colonia_id: "",
        }));
        return;
      }
      const data = await res.json();
      setColonias(data.colonias);
      setFormData((prev: any) => ({
        ...prev,
        municipio_nombre: data.municipio.nombre,
        estado_nombre: data.estado.nombre,
        colonia_id: "",
      }));
    } catch {
      setCpError("Error al conectar con el servidor");
    } finally {
      setCpLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setSubmitError("");
    setGuardando(true);

    try {
      const response = await fetch(`http://localhost:8000/usuarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          primer_apellido: formData.primer_apellido,
          segundo_apellido: formData.segundo_apellido,
          curp: formData.curp,
          rfc: formData.rfc,
          fecha_nacimiento: formData.fecha_nacimiento,
          correo: formData.correo,
          sexo: formData.sexo || null,
          activo: formData.activo,
          tipo_personal: formData.tipo_personal,
          rol_id: formData.rol_id ? Number(formData.rol_id) : null,
          // Dirección
          calle: formData.calle || null,
          num_exterior: formData.num_exterior || null,
          num_interior: formData.num_interior || null,
          colonia_id: formData.colonia_id ? Number(formData.colonia_id) : null,
          tipo_vivienda_id: formData.tipo_vivienda_id ? Number(formData.tipo_vivienda_id) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        setSubmitError(error.detail || "Error al actualizar el usuario");
        return;
      }

      router.push("/listaUsuarios");
    } catch {
      setSubmitError("Error al conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  // ── Estado de carga ───────────────────────────────────────
  if (loading || !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
            {[
              { id: "nombre", label: "Nombre(s)" },
              { id: "primer_apellido", label: "Apellido Paterno" },
              { id: "segundo_apellido", label: "Apellido Materno" },
              { id: "curp", label: "CURP" },
              { id: "rfc", label: "RFC" },
            ].map(({ id: field, label }) => (
              <div key={field} className="flex items-center gap-4">
                <label htmlFor={field} className="w-44 text-sm font-medium text-gray-700">
                  {label}:
                </label>
                <input
                  id={field}
                  name={field}
                  value={formData[field] ?? ""}
                  onChange={handleChange}
                  className="flex-1 border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                />
              </div>
            ))}

            <div className="flex items-center gap-4">
              <label htmlFor="fecha_nacimiento" className="w-44 text-sm font-medium text-gray-700">
                Fecha de Nacimiento:
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento ?? ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="sexo" className="w-44 text-sm font-medium text-gray-700">Sexo:</label>
              <select
                id="sexo" name="sexo"
                value={formData.sexo ?? ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Sexo</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              </select>
            </div>
          </div>

          {/* Tipo de personal y estado de cuenta */}
          <div className="bg-yellow-50 p-4 rounded grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="tipo_personal" className="w-44 text-sm font-medium text-gray-700">
                Tipo de personal:
              </label>
              <select
                id="tipo_personal" name="tipo_personal"
                value={String(formData.tipo_personal)}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="false">Empleado</option>
                <option value="true">Voluntario</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="activo" className="w-44 text-sm font-medium text-gray-700">
                Estado de cuenta:
              </label>
              <select
                id="activo" name="activo"
                value={String(formData.activo)}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-gray-50 p-4 rounded space-y-4">
            <h3 className="font-semibold text-gray-700">Dirección</h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: "calle", label: "Calle" },
                { id: "num_exterior", label: "Número Exterior" },
                { id: "num_interior", label: "Número Interior" },
              ].map(({ id: field, label }) => (
                <div key={field} className="flex items-center gap-4">
                  <label htmlFor={field} className="w-44 text-sm font-medium text-gray-700">
                    {label}:
                  </label>
                  <input
                    id={field} name={field}
                    value={formData[field] ?? ""}
                    onChange={handleChange}
                    className="flex-1 border p-2 rounded"
                  />
                </div>
              ))}
            </div>

            {/* Búsqueda por CP */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Código Postal</label>
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
              {cpError && <p className="text-red-500 text-sm mt-1">{cpError}</p>}
            </div>

            {/* Campos autocompletados */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                <input
                  type="text" value={formData.estado_nombre ?? ""} readOnly
                  placeholder="Se autocompleta con el CP"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Municipio / Alcaldía</label>
                <input
                  type="text" value={formData.municipio_nombre ?? ""} readOnly
                  placeholder="Se autocompleta con el CP"
                  className="w-full border p-2 rounded bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Colonia</label>
                <select
                  name="colonia_id"
                  value={formData.colonia_id ?? ""}
                  onChange={handleChange}
                  disabled={colonias.length === 0}
                  className="w-full border p-2 rounded disabled:bg-gray-100"
                >
                  <option value="">
                    {colonias.length === 0 ? "Busca un código postal primero" : "Seleccionar Colonia"}
                  </option>
                  {colonias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Vivienda</label>
                <select
                  name="tipo_vivienda_id"
                  value={formData.tipo_vivienda_id ?? ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  <option value="">Seleccionar tipo de vivienda</option>
                  {tiposVivienda.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.descripcion}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Rol y correo */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="rol_id" className="w-44 text-sm font-medium text-gray-700">Rol:</label>
              <select
                id="rol_id" name="rol_id"
                value={formData.rol_id ?? ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              >
                <option value="">Seleccionar Rol</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>{rol.nombre_rol}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="correo" className="w-44 text-sm font-medium text-gray-700">Correo:</label>
              <input
                id="correo" type="email" name="correo"
                value={formData.correo ?? ""}
                onChange={handleChange}
                className="flex-1 border p-2 rounded"
              />
            </div>
          </div>

          {/* Error de submit */}
          {submitError && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
              ⚠ {submitError}
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Link href="/listaUsuarios" className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50 transition"
            >
              {guardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
