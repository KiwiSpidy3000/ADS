import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 border-b pb-2">
            Iniciar Sesión
        </h2>
        <form action="#" className="space-y-6">
            <div>
                <label className="block text-sm font-medium">Correo Electronico</label>
                <input type="email"
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Contraseña</label>
                <input type="password"
                    className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"/>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <a href="index.html"
                    className="bg-gray-400 text-white px-6 py-2 rounded">
                    Cancelar
                </a>
                <a href="/listaUsuarios" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition">
                    Ingresar
                </a>
 
            </div>

        </form>
    </div>
    </div>
  );
}
