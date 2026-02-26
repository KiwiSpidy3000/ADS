import Image from "next/image";

export default function Home() {
  return (

<body className="bg-gray-100">
    <nav className="bg-blue-600 p-4 text-white flex justify-between align-middle shadow-md">
        <h1 className="font-bold text-xl flex items-center">!Null - Sistema SIGERD</h1>
        <div className="flex items-center gap-4">
            <span className="text-sm">Bienvenido, Administrador</span>
            <a href="listausuarios.html" className="text-white hover:text-gray-200">Volver</a>
        </div>
    </nav>

    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Administración de Acceso</h2>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r">
            <div className="flex">
                <div className="ml-3">
                    <p className="text-sm text-yellow-800 font-medium">
                        Advertencia:
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                        Está modificando el acceso de un usuario. Revocar el acceso impedirá que el usuario ingrese al
                        sistema,
                        pero mantendrá su historial clínico y legal intacto por normativa LGDNNA.
                    </p>
                </div>
            </div>
        </div>

        <div
            className="flex flex-col sm:flex-row items-center justify-between p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="mb-4 sm:mb-0">
                <span className="text-gray-700 block text-sm uppercase tracking-wide font-semibold">Estatus Actual</span>
                <span className="flex items-center mt-1">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <strong className="text-green-700 text-lg">ACTIVO</strong>
                </span>
            </div>

            <button
                className="bg-red-600 hover:bg-red-700 transition-colors text-white font-bold py-2 px-6 rounded shadow-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                  <a href="listausuarios.html">       REVOCAR ACCESO</a>
         
            </button>
        </div>
    </div>
</body>
  );
}
