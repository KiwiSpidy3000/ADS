import Link from "next/link";

export default function NuevoRegistro() {
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-2">
          Nuevo Registro de Personal
        </h2>

        <form className="space-y-6">
          {/* Datos personales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nombre(s)</label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Apellido Paterno
              </label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Apellido Materno
              </label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">
                CURP (18 caracteres)
              </label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">RFC</label>
              <input type="text" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Fecha de nacimiento
              </label>
              <input type="date" className="w-full border p-2 rounded" />
            </div>
          </div>

          {/* Tipo y rol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded">
            <div>
              <label className="block text-sm font-medium">
                Tipo de Personal
              </label>
              <select className="w-full border p-2 rounded">
                <option>Empleado</option>
                <option>Voluntario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Rol</label>
              <select className="w-full border p-2 rounded">
                <option>Psicólogo</option>
                <option>Abogado</option>
                <option>Trabajador Social</option>
                <option>Médico</option>
              </select>
            </div>
          </div>

          {/* Acceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Correo</label>
              <input type="email" className="w-full border p-2 rounded" />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Contraseña Provisional
              </label>
              <input type="password" className="w-full border p-2 rounded" />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/listausuarios"
              className="bg-gray-400 text-white px-6 py-2 rounded"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}