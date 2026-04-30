"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Catalogo { id: number; nombre: string; }
interface TipoActor { id: number; nombre: string; }
interface RedSocial  { id: number; nombre: string; }

interface ContactoForm {
  tel_principal: string; tel_secundario: string; correo: string;
  pagina_web: string; red_social_id: string; red_social_usuario: string;
  es_principal: boolean; observaciones: string;
}

interface ProgramaForm {
  nom_programa: string; descripcion: string;
  fecha_inicio: string; fecha_fin: string; activo_programa: boolean;
}

interface EnlaceForm {
  nom_enlace: string; cargo_enlace: string;
  es_principal_contacto: boolean; notas_enlace: string;
}

// ─── Default empty objects ────────────────────────────────────────────────────
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

// ─── Small UI helpers ─────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
    {children}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition placeholder-slate-300 ${props.className ?? ""}`}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select
    {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition text-slate-700 ${props.className ?? ""}`}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={2}
    {...props}
    className={`w-full border border-slate-200 bg-white px-3 py-2 rounded-lg text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
      transition placeholder-slate-300 resize-none ${props.className ?? ""}`}
  />
);

const SectionCard = ({
  title, icon, accent = "blue", children,
}: {
  title: string; icon: string; accent?: string; children: React.ReactNode;
}) => {
  const accents: Record<string, string> = {
    blue:   "border-l-blue-600 bg-blue-50/40",
    teal:   "border-l-teal-600 bg-teal-50/40",
    violet: "border-l-violet-600 bg-violet-50/40",
    amber:  "border-l-amber-500 bg-amber-50/40",
    rose:   "border-l-rose-500 bg-rose-50/40",
    slate:  "border-l-slate-400 bg-slate-50/60",
  };
  return (
    <div className={`border-l-4 rounded-xl p-5 ${accents[accent] ?? accents.blue}`}>
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="text-base">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
};

const AddButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick}
    className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600
      hover:text-blue-800 transition">
    <span className="text-lg leading-none">＋</span> {label}
  </button>
);

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick}
    className="text-xs text-rose-400 hover:text-rose-600 font-semibold transition mt-1">
    ✕ Eliminar
  </button>
);

// ─── Steps indicator ──────────────────────────────────────────────────────────
const STEPS = ["Tipo", "Datos generales", "Dirección", "Contactos", "Programas", "Enlacesmento"];
const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center gap-0 mb-8 overflow-x-auto pb-1">
    {STEPS.map((s, i) => (
      <div key={i} className="flex items-center shrink-0">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
          ${i < current  ? "bg-blue-100 text-blue-600"
          : i === current ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "bg-slate-100 text-slate-400"}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
            ${i < current ? "bg-blue-500 text-white" : i === current ? "bg-white text-blue-600" : "bg-slate-300 text-slate-500"}`}>
            {i < current ? "✓" : i + 1}
          </span>
          <span className="hidden sm:inline">{s}</span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`w-6 h-0.5 mx-0.5 ${i < current ? "bg-blue-400" : "bg-slate-200"}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NuevoActorDerechos() {
  // Catálogos
  const [tiposActor, setTiposActor]   = useState<TipoActor[]>([]);
  const [redesSociales, setRedesSociales] = useState<RedSocial[]>([]);
  const [colonias, setColonias]       = useState<Catalogo[]>([]);
  const [cpBuscado, setCpBuscado]     = useState("");
  const [cpLoading, setCpLoading]     = useState(false);
  const [cpError, setCpError]         = useState("");
  const [submitError, setSubmitError] = useState("");
  const [guardando, setGuardando]     = useState(false);
  const [exitoso, setExitoso]         = useState(false);
  const [step, setStep]               = useState(0);

  // Tipo de actor
  const [tipoActor, setTipoActor]     = useState<"persona_fisica" | "asociacion">("persona_fisica");

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

  // Listas dinámicas
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

  // ── Búsqueda CP ─────────────────────────────────────────────────────────────
  const buscarCP = async () => {
    if (!cpBuscado.trim()) { setCpError("Ingresa un código postal"); return; }
    setCpLoading(true); setCpError(""); setColonias([]);
    try {
      const res = await fetch(`http://localhost:8000/catalogos/por-codigo-postal/${cpBuscado.trim()}`);
      if (!res.ok) {
        setCpError("No se encontraron datos para ese código postal");
        setDir(p => ({ ...p, estado_nombre: "", municipio_nombre: "", colonia_id: "" }));
        return;
      }
      const data = await res.json();
      setColonias(data.colonias);
      setDir(p => ({ ...p, municipio_nombre: data.municipio.nombre, estado_nombre: data.estado.nombre, colonia_id: "" }));
    } catch { setCpError("Error al conectar con el servidor"); }
    finally  { setCpLoading(false); }
  };

  // ── Handlers genéricos ──────────────────────────────────────────────────────
  const chBase = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setBase(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const chDir = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDir(p => ({ ...p, [name]: value }));
  };
  const chPf = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setPf(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const updateList = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, idx: number, key: keyof T, val: T[keyof T]) =>
    setter(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(""); setGuardando(true);

    const direccionPayload = {
      calle: dir.calle || null,
      no_exterior: dir.no_exterior || null,
      no_interior: dir.no_interior || null,
      colonia_id: dir.colonia_id ? Number(dir.colonia_id) : null,
      tipo_lugar_id: dir.tipo_lugar_id ? Number(dir.tipo_lugar_id) : null,
      pueblo_comunidad: dir.pueblo_comunidad || null,
      referencia_ubicacion: dir.referencia_ubicacion || null,
    };

    const payload: Record<string, unknown> = {
      tipo: tipoActor,
      nombre: base.nombre,
      tipo_actor_id: Number(base.tipo_actor_id),
      tiene_registro_oficial: base.tiene_registro_oficial,
      registro_oficial_num: base.registro_oficial_num || null,
      horario_atencion: base.horario_atencion || null,
      responsable_contacto: base.responsable_contacto || null,
      observaciones: base.observaciones || null,
      direccion: direccionPayload,
      contactos: contactos.map(c => ({
        ...c,
        red_social_id: c.red_social_id ? Number(c.red_social_id) : null,
        tel_secundario: c.tel_secundario || null,
        pagina_web: c.pagina_web || null,
        correo: c.correo || null,
        observaciones: c.observaciones || null,
      })),
      programas: programas.map(p => ({
        ...p,
        fecha_fin: p.fecha_fin || null,
      })),
      enlaces: enlaces.map(en => ({ ...en })),
    };

    if (tipoActor === "persona_fisica") {
      payload.persona_fisica = {
        ...pf,
        municipio_id: pf.municipio_id ? Number(pf.municipio_id) : null,
        fecha_nacimiento: pf.fecha_nacimiento || null,
        sexo: pf.sexo || null,
      };
    }

    try {
      const res = await fetch("http://localhost:8000/actores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.detail || "Error al registrar el actor");
        return;
      }
      setExitoso(true);
    } catch {
      setSubmitError("Error al conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  // ── Éxito ───────────────────────────────────────────────────────────────────
  if (exitoso) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✅</div>
        <h2 className="text-2xl font-bold text-slate-800">¡Actor registrado exitosamente!</h2>
        <p className="text-slate-500 text-sm">El actor ha sido dado de alta en el sistema de restitución de derechos NNA.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/actoresDerechos"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            Ver lista
          </Link>
          <button onClick={() => { setExitoso(false); setStep(0); }}
            className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
            Nuevo registro
          </button>
        </div>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link href="/actoresDerechos"
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold uppercase tracking-wider flex items-center gap-1 mb-3">
            ← Volver al listado
          </Link>
          <h1 className="text-3xl font-black text-slate-800 leading-tight">
            Registro de Actor
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Restitución de Derechos de Niñas, Niños y Adolescentes
          </p>
        </div>

        <StepBar current={step} />

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ══ STEP 0 — Tipo de actor ══════════════════════════════════════════ */}
          {step === 0 && (
            <SectionCard title="Tipo de actor" icon="🏷️" accent="blue">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { val: "persona_fisica", label: "Persona Física", desc: "Individuo, líder comunitario, promotor social.", icon: "👤" },
                  { val: "asociacion",     label: "Asociación",      desc: "AC, OSC, institución pública o privada.",       icon: "🏢" },
                ].map(opt => (
                  <button
                    key={opt.val} type="button"
                    onClick={() => setTipoActor(opt.val as any)}
                    className={`border-2 rounded-xl p-5 text-left transition-all
                      ${tipoActor === opt.val
                        ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-300"}`}>
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className="font-bold text-slate-800 text-sm">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ══ STEP 1 — Datos generales ════════════════════════════════════════ */}
          {step === 1 && (
            <SectionCard title="Datos generales" icon="📋" accent="teal">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nombre / Razón social *</Label>
                  <Input name="nombre" required placeholder={tipoActor === "persona_fisica" ? "Ej. Carlos Mendoza Ríos" : "Ej. Asociación Civil por los Derechos de la Niñez A.C."}
                    value={base.nombre} onChange={chBase} />
                </div>
                <div>
                  <Label>Tipo de actor *</Label>
                  <Select name="tipo_actor_id" required value={base.tipo_actor_id} onChange={chBase}>
                    <option value="">Seleccionar…</option>
                    {tiposActor.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Horario de atención</Label>
                  <Input name="horario_atencion" placeholder="Ej. Lunes a Viernes 9:00 - 17:00"
                    value={base.horario_atencion} onChange={chBase} />
                </div>
                <div>
                  <Label>Responsable de contacto</Label>
                  <Input name="responsable_contacto" placeholder="Nombre del responsable"
                    value={base.responsable_contacto} onChange={chBase} />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" id="reg_oficial" name="tiene_registro_oficial"
                    checked={base.tiene_registro_oficial} onChange={chBase}
                    className="w-4 h-4 accent-blue-600" />
                  <label htmlFor="reg_oficial" className="text-sm text-slate-700 font-medium">
                    Tiene registro oficial
                  </label>
                </div>
                {base.tiene_registro_oficial && (
                  <div>
                    <Label>Número de registro oficial</Label>
                    <Input name="registro_oficial_num" placeholder="Ej. AC-2018-0042-CDMX"
                      value={base.registro_oficial_num} onChange={chBase} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label>Observaciones</Label>
                  <Textarea name="observaciones" placeholder="Información adicional relevante…"
                    value={base.observaciones} onChange={chBase} />
                </div>

                {/* ── Persona Física extra ── */}
                {tipoActor === "persona_fisica" && (
                  <>
                    <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-3">👤 Datos de persona física</p>
                    </div>
                    <div>
                      <Label>CURP</Label>
                      <Input name="curp" placeholder="MERC850312HDFNRS01" maxLength={18}
                        className="uppercase" value={pf.curp} onChange={chPf} />
                    </div>
                    <div>
                      <Label>RFC</Label>
                      <Input name="rfc" placeholder="MERC850312AB1" maxLength={13}
                        className="uppercase" value={pf.rfc} onChange={chPf} />
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
                      <Input name="ocupacion_oficio" placeholder="Ej. Promotor social"
                        value={pf.ocupacion_oficio} onChange={chPf} />
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
                      <Input name="disponibilidad" placeholder="Ej. Tiempo completo"
                        value={pf.disponibilidad} onChange={chPf} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descripción de actividad</Label>
                      <Textarea name="descripcion_actividad" placeholder="Describe brevemente su labor…"
                        value={pf.descripcion_actividad} onChange={chPf} />
                    </div>
                    <div>
                      <Label>Pertenece a grupo</Label>
                      <Input name="pertenece_grupo" placeholder="Ej. Colectivo vecinal"
                        value={pf.pertenece_grupo} onChange={chPf} />
                    </div>
                    <div>
                      <Label>¿Cómo contactar?</Label>
                      <Input name="como_contactar" placeholder="Ej. WhatsApp por las mañanas"
                        value={pf.como_contactar} onChange={chPf} />
                    </div>
                    <div className="flex gap-6 md:col-span-2 mt-1">
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

          {/* ══ STEP 2 — Dirección ══════════════════════════════════════════════ */}
          {step === 2 && (
            <SectionCard title="Dirección" icon="📍" accent="violet">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Búsqueda por Código Postal</Label>
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

                {/* Autocompletados */}
                <div>
                  <Label>Estado</Label>
                  <Input value={dir.estado_nombre} readOnly placeholder="Se autocompleta con el CP"
                    className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <Label>Municipio / Alcaldía</Label>
                  <Input value={dir.municipio_nombre} readOnly placeholder="Se autocompleta con el CP"
                    className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="md:col-span-2">
                  <Label>Colonia</Label>
                  <Select name="colonia_id" value={dir.colonia_id} onChange={chDir} disabled={colonias.length === 0}>
                    <option value="">{colonias.length === 0 ? "Busca un código postal primero" : "Seleccionar colonia…"}</option>
                    {colonias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Calle</Label>
                  <Input name="calle" placeholder="Av. Insurgentes" value={dir.calle} onChange={chDir} />
                </div>
                <div>
                  <Label>No. exterior</Label>
                  <Input name="no_exterior" placeholder="1234" value={dir.no_exterior} onChange={chDir} />
                </div>
                <div>
                  <Label>No. interior</Label>
                  <Input name="no_interior" placeholder="Piso 3 (opcional)" value={dir.no_interior} onChange={chDir} />
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
                  <Input name="pueblo_comunidad" placeholder="Nombre del pueblo (si aplica)"
                    value={dir.pueblo_comunidad} onChange={chDir} />
                </div>
                <div className="md:col-span-2">
                  <Label>Referencia de ubicación</Label>
                  <Input name="referencia_ubicacion" placeholder="Ej. Frente al mercado municipal"
                    value={dir.referencia_ubicacion} onChange={chDir} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ══ STEP 3 — Contactos ══════════════════════════════════════════════ */}
          {step === 3 && (
            <SectionCard title="Contactos" icon="📞" accent="amber">
              {contactos.map((c, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {c.es_principal ? "⭐ Principal" : `Contacto ${i + 1}`}
                    </span>
                    {contactos.length > 1 && <RemoveButton onClick={() => setContactos(p => p.filter((_, j) => j !== i))} />}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Teléfono principal</Label>
                      <Input placeholder="5512345678" value={c.tel_principal}
                        onChange={e => updateList(setContactos, i, "tel_principal", e.target.value)} />
                    </div>
                    <div>
                      <Label>Teléfono secundario</Label>
                      <Input placeholder="(opcional)" value={c.tel_secundario}
                        onChange={e => updateList(setContactos, i, "tel_secundario", e.target.value)} />
                    </div>
                    <div>
                      <Label>Correo electrónico</Label>
                      <Input type="email" placeholder="contacto@ejemplo.org" value={c.correo}
                        onChange={e => updateList(setContactos, i, "correo", e.target.value)} />
                    </div>
                    <div>
                      <Label>Página web</Label>
                      <Input placeholder="https://..." value={c.pagina_web}
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
                        <Input placeholder="@usuario" value={c.red_social_usuario}
                          onChange={e => updateList(setContactos, i, "red_social_usuario", e.target.value)} />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <Label>Observaciones</Label>
                      <Textarea placeholder="Notas adicionales sobre este contacto…" value={c.observaciones}
                        onChange={e => updateList(setContactos, i, "observaciones", e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`principal-${i}`} checked={c.es_principal}
                        onChange={e => {
                          setContactos(prev => prev.map((item, j) =>
                            j === i ? { ...item, es_principal: e.target.checked }
                                    : { ...item, es_principal: false }
                          ));
                        }}
                        className="w-4 h-4 accent-amber-500" />
                      <label htmlFor={`principal-${i}`} className="text-sm text-slate-700">Contacto principal</label>
                    </div>
                  </div>
                </div>
              ))}
              <AddButton onClick={() => setContactos(p => [...p, emptyContacto()])} label="Agregar contacto" />
            </SectionCard>
          )}

          {/* ══ STEP 4 — Programas ══════════════════════════════════════════════ */}
          {step === 4 && (
            <SectionCard title="Programas" icon="📂" accent="rose">
              {programas.length === 0 && (
                <p className="text-sm text-slate-400 italic mb-3">
                  No se han agregado programas. Puedes continuar sin agregar ninguno.
                </p>
              )}
              {programas.map((p, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Programa {i + 1}</span>
                    <RemoveButton onClick={() => setProgramas(prev => prev.filter((_, j) => j !== i))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <Label>Nombre del programa *</Label>
                      <Input placeholder="Ej. Reintegración Familiar para NNA" value={p.nom_programa}
                        onChange={e => updateList(setProgramas, i, "nom_programa", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descripción</Label>
                      <Textarea placeholder="Objetivo y alcance del programa…" value={p.descripcion}
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
                      <input type="checkbox" id={`activo-${i}`} checked={p.activo_programa}
                        onChange={e => updateList(setProgramas, i, "activo_programa", e.target.checked)}
                        className="w-4 h-4 accent-rose-500" />
                      <label htmlFor={`activo-${i}`} className="text-sm text-slate-700">Programa activo</label>
                    </div>
                  </div>
                </div>
              ))}
              <AddButton onClick={() => setProgramas(p => [...p, emptyPrograma()])} label="Agregar programa" />
            </SectionCard>
          )}

          {/* ══ STEP 5 — Enlaces ════════════════════════════════════════════════ */}
          {step === 5 && (
            <SectionCard title="Enlaces / Representantes" icon="🤝" accent="slate">
              {enlaces.length === 0 && (
                <p className="text-sm text-slate-400 italic mb-3">
                  No se han agregado enlaces. Puedes continuar sin agregar ninguno.
                </p>
              )}
              {enlaces.map((en, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {en.es_principal_contacto ? "⭐ Enlace principal" : `Enlace ${i + 1}`}
                    </span>
                    <RemoveButton onClick={() => setEnlaces(prev => prev.filter((_, j) => j !== i))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Nombre del enlace *</Label>
                      <Input placeholder="Ej. Lic. María Gutiérrez" value={en.nom_enlace}
                        onChange={e => updateList(setEnlaces, i, "nom_enlace", e.target.value)} />
                    </div>
                    <div>
                      <Label>Cargo</Label>
                      <Input placeholder="Ej. Directora Ejecutiva" value={en.cargo_enlace}
                        onChange={e => updateList(setEnlaces, i, "cargo_enlace", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Notas</Label>
                      <Textarea placeholder="Información adicional sobre el enlace…" value={en.notas_enlace}
                        onChange={e => updateList(setEnlaces, i, "notas_enlace", e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id={`enlace-principal-${i}`} checked={en.es_principal_contacto}
                        onChange={e => {
                          setEnlaces(prev => prev.map((item, j) =>
                            j === i ? { ...item, es_principal_contacto: e.target.checked }
                                    : { ...item, es_principal_contacto: false }
                          ));
                        }}
                        className="w-4 h-4 accent-slate-500" />
                      <label htmlFor={`enlace-principal-${i}`} className="text-sm text-slate-700">Enlace principal</label>
                    </div>
                  </div>
                </div>
              ))}
              <AddButton onClick={() => setEnlaces(p => [...p, emptyEnlace()])} label="Agregar enlace" />
            </SectionCard>
          )}

          {/* ── Error global ── */}
          {submitError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              ⚠ {submitError}
            </div>
          )}

          {/* ── Navegación entre pasos ── */}
          <div className="flex justify-between items-center pt-2">
            <div>
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                  ← Anterior
                </button>
              )}
              {step === 0 && (
                <Link href="/actoresDerechos"
                  className="bg-slate-100 text-slate-700 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition">
                  Cancelar
                </Link>
              )}
            </div>

            <div>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={() => setStep(s => s + 1)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-200">
                  Siguiente →
                </button>
              ) : (
                <button type="submit" disabled={guardando}
                  className="bg-green-600 text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-green-700
                    disabled:opacity-50 transition shadow-md shadow-green-200">
                  {guardando ? "Guardando…" : "✓ Registrar Actor"}
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
