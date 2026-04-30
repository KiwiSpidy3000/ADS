"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Catalogo   { id: number; nombre: string; }
interface TipoActor  { id: number; nombre: string; }
interface RedSocial  { id: number; nombre: string; }

interface ContactoForm {
  id?: number;
  tel_principal: string; tel_secundario: string; correo: string;
  pagina_web: string; red_social_id: string; red_social_usuario: string;
  es_principal: boolean; observaciones: string;
}
interface ProgramaForm {
  id_programa?: number;
  nom_programa: string; descripcion: string;
  fecha_inicio: string; fecha_fin: string; activo_programa: boolean;
}
interface EnlaceForm {
  id_enlace?: number;
  nom_enlace: string; cargo_enlace: string;
  es_principal_contacto: boolean; notas_enlace: string;
}

const emptyContacto = (): ContactoForm => ({
  tel_principal: "", tel_secundario: "", correo: "", pagina_web: "",
  red_social_id: "", red_social_usuario: "", es_principal: false, observaciones: "",
});
const emptyPrograma = (): ProgramaForm => ({
  nom_programa: "", descripcion: "", fecha_inicio: "", fecha_fin: "", activo_programa: true,
});
const emptyEnlace = (): EnlaceForm => ({
  nom_enlace: "", cargo_enlace: "", es_principal_contacto: false, notas_enlace: "",
});

const toStr = (v: any): string => (v === null || v === undefined ? "" : String(v));
const toDateStr = (v: any): string => {
  if (!v) return "";
  try { return new Date(v).toISOString().split("T")[0]; } catch { return ""; }
};

// ─── UI Helpers ───────────────────────────────────────────────────────────────
const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
    {children}{required && <span className="text-rose-400 ml-0.5">*</span>}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition placeholder-slate-300 disabled:bg-slate-50 disabled:text-slate-400
      ${props.className ?? ""}`} />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition text-slate-700 disabled:bg-slate-50 ${props.className ?? ""}`}>
    {children}
  </select>
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={2} {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition placeholder-slate-300 resize-none ${props.className ?? ""}`} />
);

const SectionCard = ({ title, icon, accent = "blue", children }: {
  title: string; icon: string; accent?: string; children: React.ReactNode;
}) => {
  const borders: Record<string, string> = {
    blue:   "border-l-blue-600 bg-blue-50/30",
    teal:   "border-l-teal-600 bg-teal-50/30",
    violet: "border-l-violet-600 bg-violet-50/30",
    amber:  "border-l-amber-500 bg-amber-50/30",
    rose:   "border-l-rose-500 bg-rose-50/30",
    slate:  "border-l-slate-400 bg-slate-50/50",
    green:  "border-l-green-500 bg-green-50/30",
  };
  return (
    <div className={`border-l-4 rounded-xl p-5 ${borders[accent] ?? borders.blue}`}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {children}
    </div>
  );
};

const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick}
    className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
    <span className="text-lg leading-none">＋</span>{label}
  </button>
);

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="text-xs text-rose-400 hover:text-rose-600 font-semibold transition">
    ✕ Eliminar
  </button>
);

const SkeletonCard = () => (
  <div className="animate-pulse space-y-3 bg-white rounded-xl p-5 border border-slate-100">
    {[80, 60, 90, 70].map((w, i) => (
      <div key={i} className="h-3 bg-slate-200 rounded" style={{ width: `${w}%` }} />
    ))}
  </div>
);

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = ["General", "Dirección", "Contactos", "Programas", "Enlaces"];

const StepBar = ({ current, onClick }: { current: number; onClick: (i: number) => void }) => (
  <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center shrink-0">
        <button type="button" onClick={() => onClick(i)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
            ${i < current  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
            : i === current ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
            ${i < current ? "bg-blue-500 text-white" : i === current ? "bg-white text-blue-600" : "bg-slate-300 text-slate-500"}`}>
            {i < current ? "✓" : i + 1}
          </span>
          <span className="hidden sm:inline">{s}</span>
        </button>
        {i < STEPS.length - 1 && (
          <div className={`w-5 h-0.5 mx-0.5 ${i < current ? "bg-blue-400" : "bg-slate-200"}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EditarActorDerechos() {
  const params = useParams();
  const id = params?.id;

  // Loading / errors
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState("");
  const [guardando, setGuardando]   = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [exitoso, setExitoso]       = useState(false);
  const [step, setStep]             = useState(0);

  // Catálogos
  const [tiposActor, setTiposActor]       = useState<TipoActor[]>([]);
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([]);
  const [colonias, setColonias]           = useState<Catalogo[]>([]);
  const [cpBuscado, setCpBuscado]         = useState("");
  const [cpLoading, setCpLoading]         = useState(false);
  const [cpError, setCpError]             = useState("");

  // Tipo discriminado
  const [tipoActor, setTipoActor] = useState<"persona_fisica" | "asociacion">("asociacion");

  // Datos base
  const [base, setBase] = useState({
    nombre: "", tipo_actor_id: "", tiene_registro_oficial: false,
    registro_oficial_num: "", horario_atencion: "",
    responsable_contacto: "", observaciones: "",
  });

  // Dirección
  const [dir, setDir] = useState({
    calle: "", no_exterior: "", no_interior: "", colonia_id: "",
    tipo_lugar_id: "", pueblo_comunidad: "", referencia_ubicacion: "",
    estado_nombre: "", municipio_nombre: "",
  });

  // Persona física
  const [pf, setPf] = useState({
    curp: "", rfc: "", fecha_nacimiento: "", sexo: "", municipio_id: "",
    escolaridad: "", ocupacion_oficio: "", descripcion_actividad: "",
    zona_geografica: "", disponibilidad: "",
    es_lider_comunitario: false, es_lider_religioso: false,
    pertenece_grupo: "", como_contactar: "",
  });

  // Listas
  const [contactos, setContactos] = useState<ContactoForm[]>([emptyContacto()]);
  const [programas, setProgramas] = useState<ProgramaForm[]>([]);
  const [enlaces, setEnlaces]     = useState<EnlaceForm[]>([]);

  // ── Cargar catálogos ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [taRes, rsRes] = await Promise.all([
          fetch("http://localhost:8000/catalogos/tipos-actor"),
          fetch("http://localhost:8000/catalogos/redes-sociales"),
        ]);
        if (taRes.ok) setTiposActor(await taRes.json());
        if (rsRes.ok) setRedesSociales(await rsRes.json());
      } catch { /* silencioso */ }
    };
    load();
  }, []);

  // ── Cargar actor existente ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const fetchActor = async () => {
      try {
        const res = await fetch(`http://localhost:8000/actores/${id}`);
        if (!res.ok) throw new Error("No se encontró el actor");
        const data = await res.json();

        setTipoActor(data.tipo ?? "asociacion");

        setBase({
          nombre:                toStr(data.nombre),
          tipo_actor_id:         toStr(data.tipo_actor_id),
          tiene_registro_oficial: !!data.tiene_registro_oficial,
          registro_oficial_num:  toStr(data.registro_oficial_num),
          horario_atencion:      toStr(data.horario_atencion),
          responsable_contacto:  toStr(data.responsable_contacto),
          observaciones:         toStr(data.observaciones),
        });

        if (data.direccion) {
          setDir({
            calle:                toStr(data.direccion.calle),
            no_exterior:          toStr(data.direccion.no_exterior),
            no_interior:          toStr(data.direccion.no_interior),
            colonia_id:           toStr(data.direccion.colonia_id),
            tipo_lugar_id:        toStr(data.direccion.tipo_lugar_id),
            pueblo_comunidad:     toStr(data.direccion.pueblo_comunidad),
            referencia_ubicacion: toStr(data.direccion.referencia_ubicacion),
            estado_nombre:        toStr(data.direccion.estado),
            municipio_nombre:     toStr(data.direccion.municipio),
          });
          // Si hay colonia_id ya cargada, añadirla al select
          if (data.direccion.colonia_id && data.direccion.colonia) {
            setColonias([{ id: data.direccion.colonia_id, nombre: data.direccion.colonia }]);
          }
        }

        if (data.persona_fisica) {
          setPf({
            curp:                  toStr(data.persona_fisica.curp),
            rfc:                   toStr(data.persona_fisica.rfc),
            fecha_nacimiento:      toDateStr(data.persona_fisica.fecha_nacimiento),
            sexo:                  toStr(data.persona_fisica.sexo),
            municipio_id:          toStr(data.persona_fisica.municipio_id),
            escolaridad:           toStr(data.persona_fisica.escolaridad),
            ocupacion_oficio:      toStr(data.persona_fisica.ocupacion_oficio),
            descripcion_actividad: toStr(data.persona_fisica.descripcion_actividad),
            zona_geografica:       toStr(data.persona_fisica.zona_geografica),
            disponibilidad:        toStr(data.persona_fisica.disponibilidad),
            es_lider_comunitario:  !!data.persona_fisica.es_lider_comunitario,
            es_lider_religioso:    !!data.persona_fisica.es_lider_religioso,
            pertenece_grupo:       toStr(data.persona_fisica.pertenece_grupo),
            como_contactar:        toStr(data.persona_fisica.como_contactar),
          });
        }

        if (data.contactos?.length) {
          setContactos(data.contactos.map((c: any) => ({
            id:                c.id,
            tel_principal:     toStr(c.tel_principal),
            tel_secundario:    toStr(c.tel_secundario),
            correo:            toStr(c.correo),
            pagina_web:        toStr(c.pagina_web),
            red_social_id:     toStr(c.red_social_id),
            red_social_usuario:toStr(c.red_social_usuario),
            es_principal:      !!c.es_principal,
            observaciones:     toStr(c.observaciones),
          })));
        }

        if (data.programas?.length) {
          setProgramas(data.programas.map((p: any) => ({
            id_programa:     p.id_programa,
            nom_programa:    toStr(p.nom_programa),
            descripcion:     toStr(p.descripcion),
            fecha_inicio:    toDateStr(p.fecha_inicio),
            fecha_fin:       toDateStr(p.fecha_fin),
            activo_programa: !!p.activo_programa,
          })));
        }

        if (data.enlaces?.length) {
          setEnlaces(data.enlaces.map((e: any) => ({
            id_enlace:            e.id_enlace,
            nom_enlace:           toStr(e.nom_enlace),
            cargo_enlace:         toStr(e.cargo_enlace),
            es_principal_contacto:!!e.es_principal_contacto,
            notas_enlace:         toStr(e.notas_enlace),
          })));
        }

      } catch (e: any) {
        setLoadError(e.message ?? "Error al cargar el actor");
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [id]);

  // ── Búsqueda CP ─────────────────────────────────────────────────────────────
  const buscarCP = async () => {
    if (!cpBuscado.trim()) { setCpError("Ingresa un código postal"); return; }
    setCpLoading(true); setCpError(""); setColonias([]);
    try {
      const res = await fetch(`http://localhost:8000/catalogos/por-codigo-postal/${cpBuscado.trim()}`);
      if (!res.ok) { setCpError("No se encontraron datos para ese CP"); return; }
      const data = await res.json();
      setColonias(data.colonias);
      setDir(p => ({ ...p, municipio_nombre: data.municipio.nombre, estado_nombre: data.estado.nombre, colonia_id: "" }));
    } catch { setCpError("Error al conectar con el servidor"); }
    finally  { setCpLoading(false); }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const chBase = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setBase(p => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };
  const chDir = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDir(p => ({ ...p, [e.target.name]: e.target.value }));
  const chPf = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setPf(p => ({ ...p, [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value }));
  };
  const updateList = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, key: keyof T, val: T[keyof T]) =>
    setter(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  // ── Submit PUT ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(""); setGuardando(true);

    const payload: Record<string, unknown> = {
      tipo: tipoActor,
      nombre: base.nombre,
      tipo_actor_id: Number(base.tipo_actor_id),
      tiene_registro_oficial: base.tiene_registro_oficial,
      registro_oficial_num: base.registro_oficial_num || null,
      horario_atencion: base.horario_atencion || null,
      responsable_contacto: base.responsable_contacto || null,
      observaciones: base.observaciones || null,
      direccion: {
        calle:                dir.calle || null,
        no_exterior:          dir.no_exterior || null,
        no_interior:          dir.no_interior || null,
        colonia_id:           dir.colonia_id ? Number(dir.colonia_id) : null,
        tipo_lugar_id:        dir.tipo_lugar_id ? Number(dir.tipo_lugar_id) : null,
        pueblo_comunidad:     dir.pueblo_comunidad || null,
        referencia_ubicacion: dir.referencia_ubicacion || null,
      },
      contactos: contactos.map(c => ({
        ...c,
        red_social_id:  c.red_social_id ? Number(c.red_social_id) : null,
        tel_secundario: c.tel_secundario || null,
        pagina_web:     c.pagina_web || null,
        correo:         c.correo || null,
        observaciones:  c.observaciones || null,
      })),
      programas: programas.map(p => ({ ...p, fecha_fin: p.fecha_fin || null })),
      enlaces: enlaces,
    };

    if (tipoActor === "persona_fisica") {
      payload.persona_fisica = {
        ...pf,
        municipio_id:     pf.municipio_id ? Number(pf.municipio_id) : null,
        fecha_nacimiento: pf.fecha_nacimiento || null,
        sexo:             pf.sexo || null,
      };
    }

    try {
      const res = await fetch(`http://localhost:8000/actores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.detail || "Error al actualizar el actor");
        return;
      }
      setExitoso(true);
    } catch {
      setSubmitError("Error al conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  // ── Éxito ────────────────────────────────────────────────────────────────────
  if (exitoso) return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="text-white px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span className="self-center">Bienvenido, Administrador</span>
      </nav>
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
          <h2 className="text-2xl font-black text-slate-800">¡Actor actualizado!</h2>
          <p className="text-slate-500 text-sm">Los cambios han sido guardados correctamente.</p>
          <div className="flex gap-3 justify-center pt-2">
            <Link href={`/actoresDerechos/${id}`}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
              Ver perfil
            </Link>
            <Link href="/actoresDerechos"
              className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
              Ver lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">

      {/* Nav */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="text-white px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span className="self-center">Bienvenido, Administrador</span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link href="/actoresDerechos" className="hover:text-blue-600 font-medium transition">Actores</Link>
          <span>/</span>
          <Link href={`/actores/${id}`} className="hover:text-blue-600 font-medium transition">Perfil</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Editar</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pb-14">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-800 leading-tight">Editar Actor</h1>
              <p className="text-slate-400 text-sm mt-1">
                {tipoActor === "persona_fisica" ? "👤 Persona Física" : "🏢 Asociación"}
                {base.nombre && <span className="text-slate-600 font-medium"> · {base.nombre}</span>}
              </p>
            </div>
            <Link href={`/actoresDerechos/${id}`}
              className="shrink-0 bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition mt-1">
              ← Cancelar
            </Link>
          </div>
        </div>

        {loadError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 text-sm mb-6">
            ⚠ {loadError}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            <StepBar current={step} onClick={setStep} />

            {/* ══ STEP 0 — General ══ */}
            {step === 0 && (
              <SectionCard title="Datos generales" icon="📋" accent="blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Tipo (no editable - solo visual) */}
                  <div className="md:col-span-2">
                    <Label>Tipo de actor</Label>
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border
                      ${tipoActor === "persona_fisica"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-teal-50 border-teal-200 text-teal-700"}`}>
                      {tipoActor === "persona_fisica" ? "👤 Persona Física" : "🏢 Asociación"}
                      <span className="text-xs font-normal text-slate-400 ml-1">(no modificable)</span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label required>Nombre / Razón social</Label>
                    <Input name="nombre" required value={base.nombre} onChange={chBase}
                      placeholder={tipoActor === "persona_fisica" ? "Carlos Mendoza Ríos" : "Asociación Civil A.C."} />
                  </div>
                  <div>
                    <Label required>Tipo de actor</Label>
                    <Select name="tipo_actor_id" required value={base.tipo_actor_id} onChange={chBase}>
                      <option value="">Seleccionar…</option>
                      {tiposActor.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                    </Select>
                  </div>
                  <div>
                    <Label>Horario de atención</Label>
                    <Input name="horario_atencion" value={base.horario_atencion} onChange={chBase}
                      placeholder="Lunes a Viernes 9:00 - 17:00" />
                  </div>
                  <div>
                    <Label>Responsable de contacto</Label>
                    <Input name="responsable_contacto" value={base.responsable_contacto} onChange={chBase}
                      placeholder="Nombre del responsable" />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <input type="checkbox" id="reg_oficial" name="tiene_registro_oficial"
                      checked={base.tiene_registro_oficial} onChange={chBase}
                      className="w-4 h-4 accent-blue-600" />
                    <label htmlFor="reg_oficial" className="text-sm text-slate-700 font-medium cursor-pointer">
                      Tiene registro oficial
                    </label>
                  </div>
                  {base.tiene_registro_oficial && (
                    <div>
                      <Label>Número de registro oficial</Label>
                      <Input name="registro_oficial_num" value={base.registro_oficial_num} onChange={chBase}
                        placeholder="AC-2018-0042-CDMX" />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <Label>Observaciones</Label>
                    <Textarea name="observaciones" value={base.observaciones} onChange={chBase}
                      placeholder="Información adicional…" />
                  </div>

                  {/* ── Persona física extra ── */}
                  {tipoActor === "persona_fisica" && (
                    <>
                      <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-1">
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">👤 Datos de persona física</p>
                      </div>
                      <div>
                        <Label>CURP</Label>
                        <Input name="curp" value={pf.curp} onChange={chPf}
                          maxLength={18} className="uppercase" placeholder="MERC850312HDFNRS01" />
                      </div>
                      <div>
                        <Label>RFC</Label>
                        <Input name="rfc" value={pf.rfc} onChange={chPf}
                          maxLength={13} className="uppercase" placeholder="MERC850312AB1" />
                      </div>
                      <div>
                        <Label>Fecha de nacimiento</Label>
                        <Input type="date" name="fecha_nacimiento" value={pf.fecha_nacimiento} onChange={chPf} />
                      </div>
                      <div>
                        <Label>Sexo</Label>
                        <Select name="sexo" value={pf.sexo} onChange={chPf}>
                          <option value="">Seleccionar…</option>
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="NB">No binario</option>
                          <option value="NE">Prefiero no especificar</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Escolaridad</Label>
                        <Select name="escolaridad" value={pf.escolaridad} onChange={chPf}>
                          <option value="">Seleccionar…</option>
                          {["Primaria","Secundaria","Preparatoria","Técnico","Licenciatura","Posgrado"].map(e =>
                            <option key={e} value={e}>{e}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Ocupación / Oficio</Label>
                        <Input name="ocupacion_oficio" value={pf.ocupacion_oficio} onChange={chPf}
                          placeholder="Promotor social" />
                      </div>
                      <div>
                        <Label>Zona geográfica</Label>
                        <Select name="zona_geografica" value={pf.zona_geografica} onChange={chPf}>
                          <option value="">Seleccionar…</option>
                          {["Norte","Sur","Este","Oeste","Centro","Rural","Urbana","Periurbana"].map(z =>
                            <option key={z} value={z}>{z}</option>)}
                        </Select>
                      </div>
                      <div>
                        <Label>Disponibilidad</Label>
                        <Input name="disponibilidad" value={pf.disponibilidad} onChange={chPf}
                          placeholder="Tiempo completo" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Descripción de actividad</Label>
                        <Textarea name="descripcion_actividad" value={pf.descripcion_actividad} onChange={chPf}
                          placeholder="Describe brevemente su labor…" />
                      </div>
                      <div>
                        <Label>Pertenece a grupo</Label>
                        <Input name="pertenece_grupo" value={pf.pertenece_grupo} onChange={chPf}
                          placeholder="Colectivo vecinal" />
                      </div>
                      <div>
                        <Label>¿Cómo contactar?</Label>
                        <Input name="como_contactar" value={pf.como_contactar} onChange={chPf}
                          placeholder="WhatsApp por las mañanas" />
                      </div>
                      <div className="flex gap-6 md:col-span-2">
                        {[
                          { key: "es_lider_comunitario", label: "Líder comunitario" },
                          { key: "es_lider_religioso",   label: "Líder religioso"   },
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                            <input type="checkbox" name={item.key}
                              checked={(pf as any)[item.key]} onChange={chPf}
                              className="w-4 h-4 accent-teal-600" />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </SectionCard>
            )}

            {/* ══ STEP 1 — Dirección ══ */}
            {step === 1 && (
              <SectionCard title="Dirección" icon="📍" accent="violet">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Buscar por Código Postal</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Ej. 06600" value={cpBuscado} maxLength={5}
                        onChange={e => setCpBuscado(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && (e.preventDefault(), buscarCP())} />
                      <button type="button" onClick={buscarCP} disabled={cpLoading}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold
                          hover:bg-blue-700 disabled:opacity-50 transition whitespace-nowrap">
                        {cpLoading ? "Buscando…" : "Buscar"}
                      </button>
                    </div>
                    {cpError && <p className="text-rose-500 text-xs mt-1">⚠ {cpError}</p>}
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input value={dir.estado_nombre} readOnly
                      className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      placeholder="Se autocompleta con el CP" />
                  </div>
                  <div>
                    <Label>Municipio / Alcaldía</Label>
                    <Input value={dir.municipio_nombre} readOnly
                      className="bg-slate-50 text-slate-500 cursor-not-allowed"
                      placeholder="Se autocompleta con el CP" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Colonia</Label>
                    <Select name="colonia_id" value={dir.colonia_id} onChange={chDir}
                      disabled={colonias.length === 0}>
                      <option value="">{colonias.length === 0 ? "Busca un CP para ver colonias" : "Seleccionar colonia…"}</option>
                      {colonias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Select>
                    {dir.colonia_id && colonias.length === 1 && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠ Busca un nuevo CP si deseas cambiar la colonia
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Calle</Label>
                    <Input name="calle" value={dir.calle} onChange={chDir} placeholder="Av. Insurgentes" />
                  </div>
                  <div>
                    <Label>No. exterior</Label>
                    <Input name="no_exterior" value={dir.no_exterior} onChange={chDir} placeholder="1234" />
                  </div>
                  <div>
                    <Label>No. interior</Label>
                    <Input name="no_interior" value={dir.no_interior} onChange={chDir} placeholder="Piso 3 (opcional)" />
                  </div>
                  <div>
                    <Label>Tipo de lugar</Label>
                    <Select name="tipo_lugar_id" value={dir.tipo_lugar_id} onChange={chDir}>
                      <option value="">Seleccionar…</option>
                      <option value="1">Urbano</option>
                      <option value="2">Semiurbano</option>
                      <option value="3">Rural</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Pueblo / Comunidad</Label>
                    <Input name="pueblo_comunidad" value={dir.pueblo_comunidad} onChange={chDir}
                      placeholder="Nombre del pueblo (si aplica)" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Referencia de ubicación</Label>
                    <Input name="referencia_ubicacion" value={dir.referencia_ubicacion} onChange={chDir}
                      placeholder="Frente al mercado municipal" />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ══ STEP 2 — Contactos ══ */}
            {step === 2 && (
              <SectionCard title="Contactos" icon="📞" accent="amber">
                {contactos.map((c, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {c.es_principal ? "⭐ Principal" : `Contacto ${i + 1}`}
                      </span>
                      {contactos.length > 1 && (
                        <RemoveBtn onClick={() => setContactos(p => p.filter((_, j) => j !== i))} />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Teléfono principal</Label>
                        <Input value={c.tel_principal} placeholder="5512345678"
                          onChange={e => updateList(setContactos, i, "tel_principal", e.target.value)} />
                      </div>
                      <div>
                        <Label>Teléfono secundario</Label>
                        <Input value={c.tel_secundario} placeholder="(opcional)"
                          onChange={e => updateList(setContactos, i, "tel_secundario", e.target.value)} />
                      </div>
                      <div>
                        <Label>Correo electrónico</Label>
                        <Input type="email" value={c.correo} placeholder="correo@ejemplo.org"
                          onChange={e => updateList(setContactos, i, "correo", e.target.value)} />
                      </div>
                      <div>
                        <Label>Página web</Label>
                        <Input value={c.pagina_web} placeholder="https://..."
                          onChange={e => updateList(setContactos, i, "pagina_web", e.target.value)} />
                      </div>
                      <div>
                        <Label>Red social</Label>
                        <Select value={c.red_social_id}
                          onChange={e => updateList(setContactos, i, "red_social_id", e.target.value)}>
                          <option value="">Ninguna</option>
                          {redesSociales.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                        </Select>
                      </div>
                      {c.red_social_id && (
                        <div>
                          <Label>Usuario en red social</Label>
                          <Input value={c.red_social_usuario} placeholder="@usuario"
                            onChange={e => updateList(setContactos, i, "red_social_usuario", e.target.value)} />
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <Label>Observaciones</Label>
                        <Textarea value={c.observaciones} placeholder="Notas adicionales…"
                          onChange={e => updateList(setContactos, i, "observaciones", e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`cp-${i}`} checked={c.es_principal}
                          onChange={e => setContactos(prev =>
                            prev.map((item, j) => ({ ...item, es_principal: j === i ? e.target.checked : false }))
                          )}
                          className="w-4 h-4 accent-amber-500" />
                        <label htmlFor={`cp-${i}`} className="text-sm text-slate-700 cursor-pointer">
                          Contacto principal
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <AddBtn onClick={() => setContactos(p => [...p, emptyContacto()])} label="Agregar contacto" />
              </SectionCard>
            )}

            {/* ══ STEP 3 — Programas ══ */}
            {step === 3 && (
              <SectionCard title="Programas" icon="📂" accent="rose">
                {programas.length === 0 && (
                  <p className="text-xs text-slate-400 italic mb-3">Sin programas. Puedes agregar uno.</p>
                )}
                {programas.map((p, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Programa {i + 1}</span>
                      <RemoveBtn onClick={() => setProgramas(prev => prev.filter((_, j) => j !== i))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label required>Nombre</Label>
                        <Input value={p.nom_programa} placeholder="Reintegración Familiar para NNA"
                          onChange={e => updateList(setProgramas, i, "nom_programa", e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Descripción</Label>
                        <Textarea value={p.descripcion} placeholder="Objetivo y alcance…"
                          onChange={e => updateList(setProgramas, i, "descripcion", e.target.value)} />
                      </div>
                      <div>
                        <Label>Fecha de inicio</Label>
                        <Input type="date" value={p.fecha_inicio}
                          onChange={e => updateList(setProgramas, i, "fecha_inicio", e.target.value)} />
                      </div>
                      <div>
                        <Label>Fecha de fin</Label>
                        <Input type="date" value={p.fecha_fin}
                          onChange={e => updateList(setProgramas, i, "fecha_fin", e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`ap-${i}`} checked={p.activo_programa}
                          onChange={e => updateList(setProgramas, i, "activo_programa", e.target.checked)}
                          className="w-4 h-4 accent-rose-500" />
                        <label htmlFor={`ap-${i}`} className="text-sm text-slate-700 cursor-pointer">Programa activo</label>
                      </div>
                    </div>
                  </div>
                ))}
                <AddBtn onClick={() => setProgramas(p => [...p, emptyPrograma()])} label="Agregar programa" />
              </SectionCard>
            )}

            {/* ══ STEP 4 — Enlaces ══ */}
            {step === 4 && (
              <SectionCard title="Enlaces / Representantes" icon="🤝" accent="slate">
                {enlaces.length === 0 && (
                  <p className="text-xs text-slate-400 italic mb-3">Sin enlaces registrados.</p>
                )}
                {enlaces.map((en, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {en.es_principal_contacto ? "⭐ Principal" : `Enlace ${i + 1}`}
                      </span>
                      <RemoveBtn onClick={() => setEnlaces(prev => prev.filter((_, j) => j !== i))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label required>Nombre del enlace</Label>
                        <Input value={en.nom_enlace} placeholder="Lic. María Gutiérrez"
                          onChange={e => updateList(setEnlaces, i, "nom_enlace", e.target.value)} />
                      </div>
                      <div>
                        <Label>Cargo</Label>
                        <Input value={en.cargo_enlace} placeholder="Directora Ejecutiva"
                          onChange={e => updateList(setEnlaces, i, "cargo_enlace", e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Notas</Label>
                        <Textarea value={en.notas_enlace} placeholder="Información adicional…"
                          onChange={e => updateList(setEnlaces, i, "notas_enlace", e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`ep-${i}`} checked={en.es_principal_contacto}
                          onChange={e => setEnlaces(prev =>
                            prev.map((item, j) => ({ ...item, es_principal_contacto: j === i ? e.target.checked : false }))
                          )}
                          className="w-4 h-4 accent-slate-500" />
                        <label htmlFor={`ep-${i}`} className="text-sm text-slate-700 cursor-pointer">Enlace principal</label>
                      </div>
                    </div>
                  </div>
                ))}
                <AddBtn onClick={() => setEnlaces(p => [...p, emptyEnlace()])} label="Agregar enlace" />
              </SectionCard>
            )}

            {/* Error global */}
            {submitError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                ⚠ {submitError}
              </div>
            )}

            {/* Navegación */}
            <div className="flex justify-between items-center pt-2">
              <div>
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                    ← Anterior
                  </button>
                ) : (
                  <Link href={`/actoresDerechos/${id}`}
                    className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                    Cancelar
                  </Link>
                )}
              </div>
              <div className="flex gap-3">
                {/* Guardar siempre visible desde step 0 */}
                <button type="submit" disabled={guardando}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold
                    hover:bg-green-700 disabled:opacity-50 transition shadow-sm shadow-green-200">
                  {guardando ? "Guardando…" : "💾 Guardar cambios"}
                </button>
                {step < STEPS.length - 1 && (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-200">
                    Siguiente →
                  </button>
                )}
              </div>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}
