import Image from "next/image";

export default function Home() {
  return (

<body className="bg-gray-100">
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="font-bold text-xl">!Null - Sistema SIGERD</h1>
        <span>Bienvenido, Administrador</span>
    </nav>

    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Personal</h2>
            <a href="regnuevopersonal.html" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">+
                Registrar
                Personal</a>
        </div>

        <table className="min-w-full bg-white border">
            <thead>
                <tr className="bg-gray-200 text-gray-700">
                    <th className="py-3 px-4 text-left border">Nombre</th>
                    <th className="py-3 px-4 text-left border">Rol</th>
                    <th className="py-3 px-4 text-left border">Estatus</th>
                    <th className="py-3 px-4 text-center border">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="py-2 px-4 border">Persona</td>
                    <td className="py-2 px-4 border">Psicólogo</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Activo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-red-600" href="/revocarAcceso" >Revocar</a>
                    
                    </td>
                </tr>
                                <tr>
                    <td className="py-2 px-4 border">Estévez Pérez Alison</td>
                    <td className="py-2 px-4 border">Psicólogo</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Activo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-red-600" href="/revocarAcceso" >Revocar</a>
                    
                    </td>
                </tr>
                                <tr>
                    <td className="py-2 px-4 border">Daniel</td>
                    <td className="py-2 px-4 border">Psicólogo</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Activo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-red-600" href="/revocarAcceso" >Revocar</a>
                    
                    </td>
                </tr>
                                <tr>
                    <td className="py-2 px-4 border">Persona</td>
                    <td className="py-2 px-4 border">Abogado</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Activo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-red-600" href="/revocarAcceso" >Revocar</a>
                    
                    </td>
                </tr>
                                <tr>
                    <td className="py-2 px-4 border">Persona</td>
                    <td className="py-2 px-4 border">Trabajador Social</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Inactivo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-green-600" href="/revocarAcceso" >Activar</a>
                    
                    </td>
                </tr>
                                                <tr>
                    <td className="py-2 px-4 border">Persona</td>
                    <td className="py-2 px-4 border">Multidisciplinario</td>
                    <td className="py-2 px-4 border"><span
                            className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Inactivo</span></td>
                    <td className="py-2 px-4 border text-center">

                        <button className="text-blue-600 mr-2">Modificar</button>
                        <a className="text-green-600" href="/revocarAcceso" >Activar</a>
                    
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
  );
}
