"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditarNNA() {
  const { id } = useParams();
  const router = useRouter();

  const [estatusEscolar, setEstatusEscolar] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [tiposVivienda, setTiposVivienda] = useState([]);

  const [cpInput, setCpInput] = useState("");
  const [datosCP, setDatosCP] = useState<any>(null);

  const [formData, setFormData] = useState<any>({
    nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    fecha_nacimiento: "",
    sexo: "",
    curp: "",
    nacionalidad: "Mexicana",
    es_migrante: false,
    activo: true,
    estatus_escolar_id: "",
    tutor_id: "",
    equipo_asignado_id: "",
    calle: "",
    num_exterior: "",
    num_interior: "",
    colonia_id: "",
    pueblo_comunidad: "",
    vivienda_nna_id: "",
  });

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // ── CARGAR DATOS ─────────────────────────────
  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      try {
        const [
          nnaRes,
          escolarRes,
          equiposRes,
          tutoresRes,
          viviendaRes
        ] = await Promise.all([
          fetch(`http://localhost:8000/nnas/${id}`),
          fetch("http://localhost:8000/catalogos/estatus-escolar"),
          fetch("http://localhost:8000/equipos/"),
          fetch("http://localhost:8000/tutores/"),
          fetch("http://localhost:8000/catalogos/tipos-vivienda-nna"),
        ]);

        const nna = await nnaRes.json();

        setFormData({
          nombre: nna.nombre || "",
          primer_apellido: nna.primer_apellido || "",
          segundo_apellido: nna.segundo_apellido || "",
          fecha_nacimiento: nna.fecha_nacimiento?.split("T")[0] || "",
          sexo: nna.sexo || "",
          curp: nna.curp || "",
          nacionalidad: nna.nacionalidad || "Mexicana",
          es_migrante: nna.es_migrante || false,
          activo: nna.activo ?? true,
          estatus_escolar_id: nna.estatus_escolar?.id || "",
          tutor_id: nna.tutor?.id || "",
          equipo_asignado_id: nna.equipo?.id || "",
          calle: nna.direccion?.calle || "",
          num_exterior: nna.direccion?.num_exterior || "",
          num_interior: nna.direccion?.num_interior || "",
          colonia_id: nna.direccion?.colonia?.id || "",
          pueblo_comunidad: nna.direccion?.pueblo_comunidad || "",
          vivienda_nna_id: nna.direccion?.vivienda_nna?.id || "",
        });

        setEstatusEscolar(await escolarRes.json());
        setEquipos(await equiposRes.json());
        setTutores(await tutoresRes.json());
        setTiposVivienda(await viviendaRes.json());
        

      } catch (error) {
        console.error(error);
        alert("Error cargando datos");


      } finally {
        setLoading(false);

      }
    };

    cargar();
  }, [id]);

  // ── HANDLE INPUT ─────────────────────────────
  const handleChange = (e: any) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? e.target.checked : value,
    });
  };

  // ── BUSCAR CP ───────────────────────────────
  const buscarCP = async () => {
    if (cpInput.length !== 5) return;

    const res = await fetch(
      `http://localhost:8000/catalogos/por-codigo-postal/${cpInput}`
    );

    if (res.ok) {
      setDatosCP(await res.json());
    }
  };

  // ── SUBMIT ──────────────────────────────────
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setEnviando(true);

    const payload = {
      ...formData,
      estatus_escolar_id: Number(formData.estatus_escolar_id) || null,
      tutor_id: Number(formData.tutor_id) || null,
      equipo_asignado_id: Number(formData.equipo_asignado_id) || null,
      colonia_id: Number(formData.colonia_id) || null,
      vivienda_nna_id: Number(formData.vivienda_nna_id) || null,
    };

    try {
      const res = await fetch(`http://localhost:8000/nnas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      alert("NNA actualizado correctamente");
      window.location.href = "/listaNnas";

    } catch {
      alert("actualizar realiszado");
      window.location.href = "/listaNnas";
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <p className="p-10">Cargando...</p>;

  // ── UI ──────────────────────────────────────
  return (
    <div className="bg-gray-100 min-h-screen">

      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <Link href="/admin">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </Link>
        <span>Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">

        <h2 className="text-2xl font-semibold mb-6">
          Editar NNA
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

<div>
  <h3 className="text-lg font-medium mb-3 border-b pb-1">
    Datos personales
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div>
      <label className="text-sm text-gray-600">Nombre(s)</label>
      <input name="nombre" value={formData.nombre} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label className="text-sm text-gray-600">Apellido paterno</label>
      <input name="primer_apellido" value={formData.primer_apellido} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label className="text-sm text-gray-600">Apellido materno</label>
      <input name="segundo_apellido" value={formData.segundo_apellido} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label className="text-sm text-gray-600">Fecha de nacimiento</label>
      <input type="date" name="fecha_nacimiento"
        value={formData.fecha_nacimiento} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label className="text-sm text-gray-600">Sexo</label>
      <select name="sexo" value={formData.sexo} onChange={handleChange}
        className="w-full border p-2 rounded">
        <option value="">Seleccionar</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-600">CURP</label>
      <input name="curp" value={formData.curp} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label className="text-sm text-gray-600">Nacionalidad</label>
      <input name="nacionalidad" value={formData.nacionalidad} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div className="flex items-center gap-2 mt-6">
      <input type="checkbox" name="es_migrante"
        checked={formData.es_migrante} onChange={handleChange} />
      <label>Es migrante</label>
    </div>

    <div className="flex items-center gap-2 mt-6">
      <input type="checkbox" name="activo"
        checked={formData.activo} onChange={handleChange} />
      <label>Activo</label>
    </div>

  </div>
</div>

<div>
  <h3 className="text-lg font-medium mb-3 border-b pb-1">
    Escolaridad y asignación
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <div>
      <label className="text-sm text-gray-600">Estatus escolar</label>
      <select name="estatus_escolar_id"
        value={formData.estatus_escolar_id}
        onChange={handleChange}
        className="w-full border p-2 rounded">
        <option value="">Seleccionar</option>
        {estatusEscolar.map((e:any)=>(
          <option key={e.id} value={e.id}>{e.descripcion}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-600">Tutor</label>
      <select name="tutor_id"
        value={formData.tutor_id}
        onChange={handleChange}
        className="w-full border p-2 rounded">
        <option value="">Seleccionar</option>
        {tutores.map((t:any)=>(
          <option key={t.id} value={t.id}>
            {t.nombre} {t.primer_apellido}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-sm text-gray-600">Equipo</label>
      <select name="equipo_asignado_id"
        value={formData.equipo_asignado_id}
        onChange={handleChange}
        className="w-full border p-2 rounded">
        <option value="">Seleccionar</option>
        {equipos.map((e:any)=>(
          <option key={e.id} value={e.id}>{e.nombre_equipo}</option>
        ))}
      </select>
    </div>

  </div>
</div>
    <div>
  <h3 className="text-lg font-medium mb-3 border-b pb-1">
    Dirección
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <div className="md:col-span-3">
      <label>Calle</label>
      <input name="calle" value={formData.calle} onChange={handleChange}
        className="w-full border p-2 rounded" />
    </div>

    <div>
      <label>No. exterior</label>
      <input name="num_exterior" value={formData.num_exterior}
        onChange={handleChange} className="w-full border p-2 rounded" />
    </div>

    <div>
      <label>No. interior</label>
      <input name="num_interior" value={formData.num_interior}
        onChange={handleChange} className="w-full border p-2 rounded" />
    </div>

    <div>
      <label>Pueblo / Comunidad</label>
      <input name="pueblo_comunidad" value={formData.pueblo_comunidad}
        onChange={handleChange} className="w-full border p-2 rounded" />
    </div>

    <div>
      <label>Tipo de vivienda</label>
      <select name="vivienda_nna_id"
        value={formData.vivienda_nna_id}
        onChange={handleChange}
        className="w-full border p-2 rounded">
        <option value="">Seleccionar</option>
        {tiposVivienda.map((v:any)=>(
          <option key={v.id} value={v.id}>{v.descripcion}</option>
        ))}
      </select>
    </div>

  </div>
</div>

          <button className="bg-blue-600 text-white px-6 py-2 rounded">
            {enviando ? "Guardando..." : "Actualizar"}
          </button>

        </form>
      </div>
    </div>
  );
}