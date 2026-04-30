"use client"

import { useEffect, useState } from "react"

// ── Tipos ────────────────────────────────────────────────────
interface ActorPrograma {
  id_programa: number
  actor_id: number
  nom_programa: string
  descripcion?: string | null
  fecha_inicio?: string | null
  fecha_fin?: string | null
  activo_programa: boolean
}

interface Actor {
  id: number
  nombre: string
  tipo_actor_id: number
  tipo: "persona_fisica" | "asociacion"
  activo: boolean
  programas: ActorPrograma[]
}

// ── Helpers ──────────────────────────────────────────────────
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d)} ${meses[parseInt(m) - 1]} ${y}`
}

function extraerProgramas(actores: Actor[]): (ActorPrograma & { actor_nombre: string; actor_tipo: string })[] {
  return actores.flatMap((a) =>
    (a.programas ?? []).map((p) => ({
      ...p,
      actor_nombre: a.nombre,
      actor_tipo: a.tipo,
    }))
  )
}

// ── Componentes pequeños ─────────────────────────────────────
function Badge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        activo
          ? "bg-green-100 text-green-700"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${activo ? "bg-green-500" : "bg-slate-400"}`} />
      {activo ? "Activo" : "Inactivo"}
    </span>
  )
}

function TipoBadge({ tipo }: { tipo: string }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        tipo === "persona_fisica"
          ? "bg-blue-50 text-blue-600 border border-blue-100"
          : "bg-rose-50 text-rose-600 border border-rose-100"
      }`}
    >
      {tipo === "persona_fisica" ? "Persona física" : "Asociación"}
    </span>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-full mb-1" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>
      ))}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────
export default function ProgramasPage() {
  const [programas, setProgramas] = useState<(ActorPrograma & { actor_nombre: string; actor_tipo: string })[]>([])
  const [cargando, setCargando]   = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [busqueda, setBusqueda]   = useState("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "inactivo">("todos")

  useEffect(() => {
    const fetchProgramas = async () => {
      try {
        setCargando(true)
        setError(null)
        const res = await fetch("http://localhost:8000/actores")
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
        const actores: Actor[] = await res.json()
        setProgramas(extraerProgramas(actores))
      } catch (e: any) {
        setError(e.message ?? "Error desconocido al cargar los programas")
      } finally {
        setCargando(false)
      }
    }
    fetchProgramas()
  }, [])

  const programasFiltrados = programas.filter((p) => {
    const coincideBusqueda =
      p.nom_programa.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.actor_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activo" && p.activo_programa) ||
      (filtroEstado === "inactivo" && !p.activo_programa)

    return coincideBusqueda && coincideEstado
  })

  const totalActivos   = programas.filter((p) => p.activo_programa).length
  const totalInactivos = programas.filter((p) => !p.activo_programa).length

  return (
    <body className="bg-gray-100 min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <a href="/admin" className="px-4 py-2 rounded hover:bg-blue-700">
          <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        </a>
        <span>Bienvenido, Administrador</span>
      </nav>

      <div className="container mx-auto mt-10 px-4 pb-12">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Programas de atención</h2>
            <p className="text-gray-500 text-sm mt-1">
              Programas registrados para la restitución de derechos
            </p>
          </div>
          <a
            href="/admin"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver al panel
          </a>
        </div>

        {/* Tarjetas de resumen */}
        {!cargando && !error && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Total programas</p>
              <p className="text-2xl font-bold text-slate-800">{programas.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-600">{totalActivos}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-400 mb-1">Inactivos</p>
              <p className="text-2xl font-bold text-slate-400">{totalInactivos}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre, actor o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-2">
            {(["todos", "activo", "inactivo"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltroEstado(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filtroEstado === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Estados */}
        {cargando && <Skeleton />}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            <p className="font-semibold mb-1">No se pudieron cargar los programas</p>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && programasFiltrados.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No se encontraron programas con los filtros aplicados</p>
          </div>
        )}

        {/* Grid de tarjetas */}
        {!cargando && !error && programasFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programasFiltrados.map((p, i) => (
              <div
                key={p.id_programa ?? i}
                className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-rose-200 hover:shadow-sm transition-all duration-150 flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {p.nom_programa}
                  </p>
                  <Badge activo={p.activo_programa} />
                </div>

                {/* Descripción */}
                {p.descripcion && (
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {p.descripcion}
                  </p>
                )}

                {/* Fechas */}
                {(p.fecha_inicio || p.fecha_fin) && (
                  <div className="flex flex-wrap gap-3 text-xs pt-2 border-t border-slate-100">
                    {p.fecha_inicio && (
                      <span className="text-slate-400">
                        Inicio:{" "}
                        <span className="text-slate-600 font-medium">
                          {formatDate(p.fecha_inicio)}
                        </span>
                      </span>
                    )}
                    {p.fecha_fin && (
                      <span className="text-slate-400">
                        Fin:{" "}
                        <span className="text-slate-600 font-medium">
                          {formatDate(p.fecha_fin)}
                        </span>
                      </span>
                    )}
                  </div>
                )}

                {/* Footer: actor */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-auto">
                  <p className="text-xs text-slate-500 truncate">{p.actor_nombre}</p>
                  <TipoBadge tipo={p.actor_tipo} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </body>
  )
}
