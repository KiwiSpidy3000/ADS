"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Contacto {
  id: number;
  tel_principal: string;
  tel_secundario?: string;
  correo?: string;
  pagina_web?: string;
  red_social_id?: number;
  red_social_usuario?: string;
  es_principal: boolean;
  observaciones?: string;
}

interface Programa {
  id: number;
  nom_programa: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo_programa: boolean;
}

interface Enlace {
  id: number;
  nom_enlace: string;
  cargo_enlace?: string;
  es_principal_contacto: boolean;
  notas_enlace?: string;
}

interface Direccion {
  calle?: string;
  no_exterior?: string;
  no_interior?: string;
  colonia?: string;
  municipio?: string;
  estado?: string;
  referencia_ubicacion?: string;
  pueblo_comunidad?: string;
}

interface PersonaFisica {
  curp?: string;
  rfc?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  escolaridad?: string;
  ocupacion_oficio?: string;
  descripcion_actividad?: string;
  zona_geografica?: string;
  disponibilidad?: string;
  es_lider_comunitario: boolean;
  es_lider_religioso: boolean;
  pertenece_grupo?: string;
  como_contactar?: string;
}

interface Actor {
  id: number;
  nombre: string;
  tipo: "persona_fisica" | "asociacion";
  tipo_actor?: string;
  tiene_registro_oficial: boolean;
  registro_oficial_num?: string;
  horario_atencion?: string;
  responsable_contacto?: string;
  observaciones?: string;
  direccion?: Direccion;
  contactos: Contacto[];
  programas: Programa[];
  enlaces: Enlace[];
  persona_fisica?: PersonaFisica;
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const Badge = ({
  children, color = "blue",
}: { children: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue:   "bg-blue-100 text-blue-700 border-blue-200",
    green:  "bg-green-100 text-green-700 border-green-200",
    amber:  "bg-amber-100 text-amber-700 border-amber-200",
    rose:   "bg-rose-100 text-rose-700 border-rose-200",
    slate:  "bg-slate-100 text-slate-600 border-slate-200",
    teal:   "bg-teal-100 text-teal-700 border-teal-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] ?? colors.slate}`}>
      {children}
    </span>
  );
};

const DataRow = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 sm:w-44 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-700">{value}</span>
    </div>
  );
};

const Section = ({
  title, icon, children, accent = "blue",
}: {
  title: string; icon: string; children: React.ReactNode; accent?: string;
}) => {
  const borders: Record<string, string> = {
    blue:   "border-blue-500",
    teal:   "border-teal-500",
    amber:  "border-amber-500",
    rose:   "border-rose-500",
    violet: "border-violet-500",
    slate:  "border-slate-400",
    green:  "border-green-500",
  };
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden`}>
      <div className={`border-l-4 ${borders[accent] ?? borders.blue} px-5 py-3 bg-slate-50 flex items-center gap-2`}>
        <span className="text-base">{icon}</span>
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-600">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
};

const SkeletonBlock = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-4 bg-slate-200 rounded w-full" style={{ width: `${70 + i * 7}%` }} />
    ))}
  </div>
);

const formatDate = (d?: string) => {
  if (!d) return null;
  try {
    return new Date(d).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  } catch { return d; }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ActorDerechosPerfil() {
  const params  = useParams();
  const id      = params?.id;
  const [actor, setActor]     = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchActor = async () => {
      try {
        const res = await fetch(`http://localhost:8000/actores/${id}`);
        if (!res.ok) throw new Error("No se encontró el actor");
        const data = await res.json();
        setActor(data);
      } catch (e: any) {
        setError(e.message ?? "Error al cargar el actor");
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [id]);

  const isPersonaFisica = actor?.tipo === "persona_fisica";

  // ── Avatar inicial ──────────────────────────────────────────────────────────
  const initials = actor?.nombre
    ? actor.nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
    : "?";

  const avatarColor = isPersonaFisica
    ? "from-blue-500 to-blue-700"
    : "from-teal-500 to-teal-700";

  // ── Dirección formateada ────────────────────────────────────────────────────
  const dirString = actor?.direccion
    ? [
        actor.direccion.calle,
        actor.direccion.no_exterior && `#${actor.direccion.no_exterior}`,
        actor.direccion.no_interior && `Int. ${actor.direccion.no_interior}`,
        actor.direccion.colonia,
        actor.direccion.municipio,
        actor.direccion.estado,
      ].filter(Boolean).join(", ")
    : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Nav ── */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <a href="/admin" className="text-white px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span className="self-center">Bienvenido, Administrador</span>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/actores-derechos" className="hover:text-blue-600 transition font-medium">
            Actores de Derechos
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold truncate max-w-xs">
            {loading ? "Cargando…" : (actor?.nombre ?? "Perfil")}
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-12 space-y-5">

        {/* ── Error ── */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-5 py-4 text-sm mt-4">
            ⚠ {error}
          </div>
        )}

        {/* ── Hero card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Franja decorativa */}
          <div className={`h-24 bg-gradient-to-r ${avatarColor} relative`}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,.15) 10px,rgba(255,255,255,.15) 11px)" }} />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className={`-mt-10 w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarColor}
              flex items-center justify-center text-white text-2xl font-black
              shadow-lg ring-4 ring-white mb-4`}>
              {loading ? "…" : initials}
            </div>

            {loading ? (
              <SkeletonBlock />
            ) : actor ? (
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 leading-tight">{actor.nombre}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge color={isPersonaFisica ? "blue" : "teal"}>
                      {isPersonaFisica ? "👤 Persona Física" : "🏢 Asociación"}
                    </Badge>
                    {actor.tipo_actor && <Badge color="slate">{actor.tipo_actor}</Badge>}
                    {actor.tiene_registro_oficial && (
                      <Badge color="green">✓ Registro oficial</Badge>
                    )}
                  </div>
                  {actor.registro_oficial_num && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      Registro: <span className="font-mono text-slate-600">{actor.registro_oficial_num}</span>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/actores-derechos/${id}/editar`}
                    className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg
                      hover:bg-blue-700 transition shadow-sm">
                    ✏ Editar
                  </Link>
                  <Link href="/actoresDerechos"
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg
                      hover:bg-slate-200 transition">
                    ← Volver
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <SkeletonBlock />
              </div>
            ))}
          </div>
        )}

        {actor && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── Datos generales ── */}
              <Section title="Datos generales" icon="📋" accent="blue">
                <DataRow label="Responsable" value={actor.responsable_contacto} />
                <DataRow label="Horario"     value={actor.horario_atencion} />
                <DataRow label="Observaciones" value={actor.observaciones} />
                {!actor.responsable_contacto && !actor.horario_atencion && !actor.observaciones && (
                  <p className="text-xs text-slate-400 italic">Sin datos adicionales</p>
                )}
              </Section>

              {/* ── Dirección ── */}
              <Section title="Dirección" icon="📍" accent="violet">
                {dirString ? (
                  <>
                    <p className="text-sm text-slate-700 mb-2">{dirString}</p>
                    {actor.direccion?.pueblo_comunidad && (
                      <DataRow label="Pueblo/Comunidad" value={actor.direccion.pueblo_comunidad} />
                    )}
                    {actor.direccion?.referencia_ubicacion && (
                      <DataRow label="Referencia" value={actor.direccion.referencia_ubicacion} />
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Sin dirección registrada</p>
                )}
              </Section>
            </div>

            {/* ── Persona física ── */}
            {isPersonaFisica && actor.persona_fisica && (
              <Section title="Datos de persona física" icon="👤" accent="teal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <div>
                    <DataRow label="CURP"            value={actor.persona_fisica.curp} />
                    <DataRow label="RFC"             value={actor.persona_fisica.rfc} />
                    <DataRow label="Fecha Nac."      value={formatDate(actor.persona_fisica.fecha_nacimiento)} />
                    <DataRow label="Sexo"            value={actor.persona_fisica.sexo} />
                    <DataRow label="Escolaridad"     value={actor.persona_fisica.escolaridad} />
                    <DataRow label="Ocupación"       value={actor.persona_fisica.ocupacion_oficio} />
                  </div>
                  <div>
                    <DataRow label="Zona geográfica" value={actor.persona_fisica.zona_geografica} />
                    <DataRow label="Disponibilidad"  value={actor.persona_fisica.disponibilidad} />
                    <DataRow label="Grupo"           value={actor.persona_fisica.pertenece_grupo} />
                    <DataRow label="Cómo contactar"  value={actor.persona_fisica.como_contactar} />
                    <DataRow label="Descripción"     value={actor.persona_fisica.descripcion_actividad} />
                  </div>
                </div>
                {/* Indicadores booleanos */}
                <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
                  <Badge color={actor.persona_fisica.es_lider_comunitario ? "green" : "slate"}>
                    {actor.persona_fisica.es_lider_comunitario ? "✓" : "✗"} Líder comunitario
                  </Badge>
                  <Badge color={actor.persona_fisica.es_lider_religioso ? "green" : "slate"}>
                    {actor.persona_fisica.es_lider_religioso ? "✓" : "✗"} Líder religioso
                  </Badge>
                </div>
              </Section>
            )}

            {/* ── Contactos ── */}
            <Section title="Contactos" icon="📞" accent="amber">
              {actor.contactos.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin contactos registrados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actor.contactos.map((c, i) => (
                    <div key={c.id ?? i}
                      className={`rounded-xl border p-4 ${c.es_principal
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Contacto {i + 1}
                        </span>
                        {c.es_principal && <Badge color="amber">⭐ Principal</Badge>}
                      </div>
                      <div className="space-y-1">
                        {c.tel_principal && (
                          <a href={`tel:${c.tel_principal}`}
                            className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition">
                            <span className="text-base">📱</span> {c.tel_principal}
                          </a>
                        )}
                        {c.tel_secundario && (
                          <a href={`tel:${c.tel_secundario}`}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition">
                            <span className="text-base">☎️</span> {c.tel_secundario}
                          </a>
                        )}
                        {c.correo && (
                          <a href={`mailto:${c.correo}`}
                            className="flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600 transition break-all">
                            <span className="text-base">✉️</span> {c.correo}
                          </a>
                        )}
                        {c.pagina_web && (
                          <a href={c.pagina_web} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline break-all">
                            <span className="text-base">🌐</span> {c.pagina_web}
                          </a>
                        )}
                        {c.red_social_usuario && (
                          <p className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-base">💬</span> {c.red_social_usuario}
                          </p>
                        )}
                        {c.observaciones && (
                          <p className="text-xs text-slate-400 mt-1 italic">{c.observaciones}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Programas ── */}
            <Section title="Programas" icon="📂" accent="rose">
              {actor.programas.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin programas registrados</p>
              ) : (
                <div className="space-y-3">
                  {actor.programas.map((p, i) => (
                    <div key={p.id ?? i}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-bold text-slate-800">{p.nom_programa}</p>
                        <Badge color={p.activo_programa ? "green" : "slate"}>
                          {p.activo_programa ? "● Activo" : "○ Inactivo"}
                        </Badge>
                      </div>
                      {p.descripcion && (
                        <p className="text-xs text-slate-500 mb-2">{p.descripcion}</p>
                      )}
                      <div className="flex gap-4 text-xs text-slate-400">
                        {p.fecha_inicio && <span>Inicio: {formatDate(p.fecha_inicio)}</span>}
                        {p.fecha_fin    && <span>Fin: {formatDate(p.fecha_fin)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* ── Enlaces ── */}
            <Section title="Enlaces / Representantes" icon="🤝" accent="slate">
              {actor.enlaces.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin enlaces registrados</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actor.enlaces.map((en, i) => (
                    <div key={en.id ?? i}
                      className={`rounded-xl border p-4 ${en.es_principal_contacto
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-bold text-slate-800">{en.nom_enlace}</p>
                        {en.es_principal_contacto && <Badge color="blue">⭐ Principal</Badge>}
                      </div>
                      {en.cargo_enlace && (
                        <p className="text-xs text-slate-500 mb-1">{en.cargo_enlace}</p>
                      )}
                      {en.notas_enlace && (
                        <p className="text-xs text-slate-400 italic">{en.notas_enlace}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        )}
      </main>
    </div>
  );
}
