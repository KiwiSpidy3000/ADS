"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface TipoVivienda {
  id: number;
  descripcion: string;
}

interface ViviendaNNA {
  id: number;
  descripcion?: string;
}

interface GradoEscolar {
  id: number;
  descripcion: string;
}

interface Idioma {
  id: number;
  nombre: string;
  variante?: string;
}

interface Enfermedad {
  id: number;
  nombre: string;
}

interface Discapacidad {
  id: number;
  nombre: string;
}

// ─── Componente de tabla genérica ─────────────────────────────────────────────

function CatalogoTabla<T extends { id: number }>({
  titulo,
  columnas,
  datos,
  cargando,
  renderFila,
}: {
  titulo: string;
  columnas: string[];
  datos: T[];
  cargando: boolean;
  renderFila: (item: T) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-2 h-6 rounded-full bg-blue-500 inline-block" />
          <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
          {!cargando && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {datos.length} registros
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {cargando ? (
          <div className="flex items-center gap-2 text-gray-400 py-6 justify-center">
            <svg className="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Cargando registros...</span>
          </div>
        ) : datos.length === 0 ? (
          <p className="text-center text-gray-400 py-6 text-sm">Sin registros disponibles.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                  {columnas.map((col) => (
                    <th key={col} className="py-2 px-4 text-left border border-gray-200 font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                    {renderFila(item)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CatalogosPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [tiposVivienda, setTiposVivienda] = useState<TipoVivienda[]>([]);
  const [viviendasNNA, setViviendasNNA] = useState<ViviendaNNA[]>([]);
  const [estatusEscolar, setEstatusEscolar] = useState<GradoEscolar[]>([]);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [enfermedades, setEnfermedades] = useState<Enfermedad[]>([]);
  const [discapacidades, setDiscapacidades] = useState<Discapacidad[]>([]);

  const [cargando, setCargando] = useState<Record<string, boolean>>({
    tiposVivienda: true,
    viviendasNNA: true,
    estatusEscolar: true,
    idiomas: true,
    enfermedades: true,
    discapacidades: true,
  });

  const fetchCatalogo = async <T,>(
    endpoint: string,
    setter: (data: T[]) => void,
    key: string
  ) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data: T[] = await res.json();
      setter(data);
    } catch (err) {
      console.error(`Error cargando ${key}:`, err);
    } finally {
      setCargando((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    fetchCatalogo<TipoVivienda>("/catalogos/tipo-vivienda/", setTiposVivienda, "tiposVivienda");
    fetchCatalogo<ViviendaNNA>("/catalogos/vivienda-nna/", setViviendasNNA, "viviendasNNA");
    fetchCatalogo<GradoEscolar>("/catalogos/grado-escolar/", setEstatusEscolar, "estatusEscolar");
    fetchCatalogo<Idioma>("/catalogos/idiomas/", setIdiomas, "idiomas");
    fetchCatalogo<Enfermedad>("/catalogos/enfermedades/", setEnfermedades, "enfermedades");
    fetchCatalogo<Discapacidad>("/catalogos/discapacidades/", setDiscapacidades, "discapacidades");
  }, []);

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
        {/* Encabezado de sección */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Catálogos del sistema</h2>
            <p className="text-gray-500 text-sm mt-1">
              Consulta de catálogos usados en los formularios del sistema
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver al panel
          </Link>
        </div>

        {/* Grid de catálogos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Tipo de vivienda */}
          <CatalogoTabla<TipoVivienda>
            titulo="Tipos de vivienda"
            columnas={["ID", "Descripción"]}
            datos={tiposVivienda}
            cargando={cargando.tiposVivienda}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.descripcion}</td>
              </>
            )}
          />

          {/* Vivienda NNA */}
          <CatalogoTabla<ViviendaNNA>
            titulo="Vivienda NNA"
            columnas={["ID", "Descripción"]}
            datos={viviendasNNA}
            cargando={cargando.viviendasNNA}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.descripcion || "—"}</td>
              </>
            )}
          />

          {/* Grado escolar */}
          <CatalogoTabla<GradoEscolar>
            titulo="Grado escolar"
            columnas={["ID", "Descripción"]}
            datos={estatusEscolar}
            cargando={cargando.estatusEscolar}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.descripcion}</td>
              </>
            )}
          />

          {/* Idiomas */}
          <CatalogoTabla<Idioma>
            titulo="Idiomas"
            columnas={["ID", "Nombre", "Variante"]}
            datos={idiomas}
            cargando={cargando.idiomas}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.nombre}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.variante || "—"}</td>
              </>
            )}
          />

          {/* Enfermedades */}
          <CatalogoTabla<Enfermedad>
            titulo="Enfermedades"
            columnas={["ID", "Nombre"]}
            datos={enfermedades}
            cargando={cargando.enfermedades}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.nombre}</td>
              </>
            )}
          />

          {/* Discapacidades */}
          <CatalogoTabla<Discapacidad>
            titulo="Discapacidades"
            columnas={["ID", "Nombre"]}
            datos={discapacidades}
            cargando={cargando.discapacidades}
            renderFila={(item) => (
              <>
                <td className="py-2 px-4 border border-gray-100 text-gray-500">{item.id}</td>
                <td className="py-2 px-4 border border-gray-100 text-gray-800">{item.nombre}</td>
              </>
            )}
          />

        </div>
      </div>
    </body>
  );
}
