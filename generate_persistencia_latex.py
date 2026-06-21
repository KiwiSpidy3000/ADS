import re

business_model_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\CDT-Analysis\3ModeloDelNegocio.tex"
output_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\parte5_persistencia.tex"

with open(business_model_path, 'r', encoding='utf-8') as f:
    content = f.read()

def parse_entities(text):
    pos = 0
    parsed = []
    while True:
        idx = text.find(r"\begin{cdtEntidad}", pos)
        if idx == -1:
            break
        
        # Find first arg {LogicalName}
        i = idx + 18
        while i < len(text) and text[i] != '{':
            i += 1
        if i >= len(text):
            break
        
        start_log = i + 1
        brace_count = 1
        i = start_log
        while i < len(text) and brace_count > 0:
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
            i += 1
        log_name = text[start_log:i-1]
        
        # Find second arg {physical_name}
        while i < len(text) and text[i] != '{':
            i += 1
        if i >= len(text):
            break
        
        start_phys = i + 1
        brace_count = 1
        i = start_phys
        while i < len(text) and brace_count > 0:
            if text[i] == '{':
                brace_count += 1
            elif text[i] == '}':
                brace_count -= 1
            i += 1
        phys_name = text[start_phys:i-1]
        
        # Find the matching \end{cdtEntidad}
        end_idx = text.find(r"\end{cdtEntidad}", i)
        if end_idx == -1:
            break
            
        body = text[i:end_idx]
        parsed.append((log_name, phys_name, body))
        pos = end_idx + 16
    return parsed

def parse_attributes(body):
    pos = 0
    attrs = []
    while True:
        idx = body.find(r"\brAttr", pos)
        if idx == -1:
            break
            
        args = []
        i = idx + 7
        for _ in range(5):
            while i < len(body) and body[i] != '{':
                i += 1
            if i >= len(body):
                break
                
            start = i + 1
            brace_count = 1
            i = start
            while i < len(body) and brace_count > 0:
                if body[i] == '{':
                    brace_count += 1
                elif body[i] == '}':
                    brace_count -= 1
                i += 1
            args.append(body[start:i-1])
            
        if len(args) == 5:
            attrs.append(args)
            pos = i
        else:
            pos = idx + 7
    return attrs

entities = parse_entities(content)
latex_tables = []

for log_name, phys_name, body in entities:
    phys_name_clean = phys_name.replace(r'\_', '_').strip()
    log_name_clean = log_name.strip()
    
    attrs = parse_attributes(body)
    if not attrs:
        continue
        
    table_latex = []
    table_latex.append(f"\\begin{{table}}[H]")
    table_latex.append(f"\t\\centering")
    table_latex.append(f"\t\\caption{{Diccionario de datos --- Tabla \\texttt{{{phys_name}}} ({log_name_clean})}}")
    table_latex.append(f"\t\\label{{tab:data-dict-{phys_name_clean}}}")
    table_latex.append(f"\t\\footnotesize")  # Small font size to prevent overflow
    table_latex.append(f"\t\\begin{{tabular}}{{>{{\\ttfamily}}p{{3.2cm}} l l l p{{6.8cm}}}}")  # Fixed column widths
    table_latex.append(f"\t\t\\toprule")
    table_latex.append(f"\t\t\\textbf{{Campo}} & \\textbf{{Tipo}} & \\textbf{{Longitud}} & \\textbf{{Nulo}} & \\textbf{{Descripción}} \\\\")
    table_latex.append(f"\t\t\\midrule")
    
    for phys_col, log_col, col_type, desc, req in attrs:
        # Clean physical column (escape underscores for LaTeX)
        phys_col_clean = phys_col.replace(r'\_', '_').replace('_', r'\_').strip()
        
        # Clean type and extract length
        col_type = col_type.replace(r'\_', '_').strip()
        length = "--"
        type_upper = col_type.upper()
        if "(" in col_type:
            parts = col_type.split("(")
            type_upper = parts[0].upper()
            length = parts[1].replace(")", "").strip()
            
        # Clean required to Nulo
        nulo = "NO" if req.strip().lower() in ["sí", "si", "yes", "true", "1"] else "SÍ"
        
        # Clean description (escape underscores for LaTeX, but preserve hyperlinks correctly)
        desc_clean = desc.replace(r'\_', '_').replace('_', r'\_').replace("``", '"').replace("''", '"').strip()
        
        table_latex.append(f"\t\t{phys_col_clean} & {type_upper} & {length} & {nulo} & {desc_clean} \\\\")
        
    table_latex.append(f"\t\t\\bottomrule")
    table_latex.append(f"\t\\end{{tabular}}")
    table_latex.append(f"\\end{{table}}")
    table_latex.append(f"")
    
    latex_tables.append("\n".join(table_latex))

# Dictionary of Queries grouped by module, expanded to be extremely detailed and exhaustive
queries_latex = """
\\section{Diseño de las Consultas}

El sistema SICORRE utiliza consultas SQL parametrizadas a través del ORM de SQLAlchemy para interactuar con la base de datos PostgreSQL. A continuación se presenta el diccionario de consultas agrupado por módulos operativos del sistema, detallando el identificador de la consulta, su descripción y la sentencia lógica SQL correspondiente. Todas las tablas se presentan en un tamaño de fuente compacto para garantizar que no excedan los márgenes de página.

\\subsection{Módulo de Control de Acceso y Gestión de Usuarios}

\\begin{table}[H]
	\\centering
	\\caption{Diccionario de consultas --- Gestión de Usuarios}
	\\label{tab:consultas-usuarios}
	\\footnotesize
	\\begin{tabular}{l p{4.5cm} p{8.5cm}}
		\\toprule
		\\textbf{ID} & \\textbf{Descripción} & \\textbf{Sentencia SQL} \\\\
		\\midrule
		Q-001 & Autenticar usuario por correo y estado activo. & 
		\\texttt{SELECT * FROM usuarios WHERE correo = ? AND activo = true;} \\\\
		\\addlinespace
		Q-002 & Obtener detalles de perfil de usuario por ID. & 
		\\texttt{SELECT id, nombre, primer\\_apellido, correo, rol\\_id FROM usuarios WHERE id = ?;} \\\\
		\\addlinespace
		Q-003 & Registrar nuevo usuario en el sistema. & 
		\\texttt{INSERT INTO usuarios (nombre, primer\\_apellido, segundo\\_apellido, fecha\\_nacimiento, sexo, curp, rfc, correo, password\\_hash, tipo\\_personal, activo, direccion\\_id, rol\\_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?);} \\\\
		\\addlinespace
		Q-004 & Listar usuarios activos con su rol correspondiente. & 
		\\texttt{SELECT u.*, r.nombre\\_rol FROM usuarios u JOIN cat\\_roles r ON u.rol\\_id = r.id WHERE u.activo = true;} \\\\
		\\addlinespace
		Q-005 & Modificar información personal y laboral del usuario. & 
		\\texttt{UPDATE usuarios SET nombre=?, primer\\_apellido=?, segundo\\_apellido=?, fecha\\_nacimiento=?, sexo=?, curp=?, rfc=?, correo=?, rol\\_id=?, activo=? WHERE id=?;} \\\\
		\\addlinespace
		Q-006 & Revocar de manera lógica el acceso a un usuario. & 
		\\texttt{UPDATE usuarios SET activo = false WHERE id = ?;} \\\\
		\\addlinespace
		Q-007 & Eliminar físicamente el registro de un usuario. & 
		\\texttt{DELETE FROM usuarios WHERE id = ?;} \\\\
		\\addlinespace
		Q-008 & Comprobar duplicidad de correo o CURP en el registro. & 
		\\texttt{SELECT id FROM usuarios WHERE curp = ? OR correo = ?;} \\\\
		\\bottomrule
	\\end{tabular}
\\end{table}

\\subsection{Módulo de Equipos Multidisciplinarios}

\\begin{table}[H]
	\\centering
	\\caption{Diccionario de consultas --- Equipos Multidisciplinarios}
	\\label{tab:consultas-equipos}
	\\footnotesize
	\\begin{tabular}{l p{4.5cm} p{8.5cm}}
		\\toprule
		\\textbf{ID} & \\textbf{Descripción} & \\textbf{Sentencia SQL} \\\\
		\\midrule
		Q-009 & Registrar un nuevo equipo multidisciplinario. & 
		\\texttt{INSERT INTO equipos\\_multidisciplinarios (nombre\\_equipo, activo, fecha\\_creacion) VALUES (?, true, ?);} \\\\
		\\addlinespace
		Q-010 & Consultar todos los equipos multidisciplinarios activos. & 
		\\texttt{SELECT * FROM equipos\\_multidisciplinarios WHERE activo = true;} \\\\
		\\addlinespace
		Q-011 & Listar integrantes especialistas de un equipo activo. & 
		\\texttt{SELECT ie.*, u.nombre, u.primer\\_apellido, r.nombre\\_rol FROM integrantes\\_equipo ie JOIN usuarios u ON ie.usuario\\_id = u.id JOIN cat\\_roles r ON u.rol\\_id = r.id WHERE ie.equipo\\_id = ? AND ie.estatus\\_integrante = 'Activo';} \\\\
		\\addlinespace
		Q-012 & Asignar un usuario especialista a un equipo. & 
		\\texttt{INSERT INTO integrantes\\_equipo (equipo\\_id, usuario\\_id, fecha\\_ingreso, estatus\\_integrante) VALUES (?, ?, ?, 'Activo');} \\\\
		\\addlinespace
		Q-013 & Registrar la salida o baja de un integrante del equipo. & 
		\\texttt{UPDATE integrantes\\_equipo SET estatus\\_integrante = 'Inactivo', fecha\\_salida = ?, motivo\\_cambio = ? WHERE equipo\\_id = ? AND usuario\\_id = ?;} \\\\
		\\addlinespace
		Q-014 & Vincular un NNA a un equipo multidisciplinario. & 
		\\texttt{UPDATE nna SET equipo\\_asignado\\_id = ? WHERE id = ?;} \\\\
		\\bottomrule
	\\end{tabular}
\\end{table}

\\subsection{Módulo de NNA y Tutores}

\\begin{table}[H]
	\\centering
	\\caption{Diccionario de consultas --- NNA, Tutores e Idiomas/Salud}
	\\label{tab:consultas-nna-tutores}
	\\footnotesize
	\\begin{tabular}{l p{4.5cm} p{8.5cm}}
		\\toprule
		\\textbf{ID} & \\textbf{Descripción} & \\textbf{Sentencia SQL} \\\\
		\\midrule
		Q-015 & Registrar un niño, niña o adolescente en el sistema. & 
		\\texttt{INSERT INTO nna (nombre, primer\\_apellido, segundo\\_apellido, fecha\\_nacimiento, sexo, curp, nacionalidad\\_id, municipio\\_nacimiento\\_id, es\\_migrante, creado\\_por, activo, fecha\\_registro, estatus\\_escolar\\_id, direccion\\_id, equipo\\_asignado\\_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-016 & Buscar un NNA en el sistema por nombre o CURP. & 
		\\texttt{SELECT * FROM nna WHERE (nombre LIKE ? OR curp = ?) AND activo = true;} \\\\
		\\addlinespace
		Q-017 & Actualizar la ficha de identidad e información escolar de NNA. & 
		\\texttt{UPDATE nna SET nombre=?, primer\\_apellido=?, segundo\\_apellido=?, fecha\\_nacimiento=?, sexo=?, curp=?, nacionalidad\\_id=?, municipio\\_nacimiento\\_id=?, es\\_migrante=?, estatus\\_escolar\\_id=?, direccion\\_id=? WHERE id=?;} \\\\
		\\addlinespace
		Q-018 & Registrar un hecho victimal asociado al NNA. & 
		\\texttt{INSERT INTO hechos\\_victimales (nna\\_id, nombre\\_victima\\_directa, fecha\\_hecho, descripcion\\_delito) VALUES (?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-019 & Registrar un tutor o responsable legal en el sistema. & 
		\\texttt{INSERT INTO tutores (nombre, primer\\_apellido, segundo\\_apellido, fecha\\_nacimiento, sexo, curp, nacionalidad\\_id, municipio\\_nacimiento\\_id, escolaridad, ocupacion, es\\_tutor\\_legal, tipo\\_tutela\\_id, resolucion\\_tutela, fecha\\_inicio\\_tutela, direccion\\_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-020 & Crear una relación de tutoría NNA-Tutor. & 
		\\texttt{INSERT INTO nna\\_tutores (nna\\_id, tutor\\_id, parentesco, es\\_principal, fecha\\_inicio) VALUES (?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-021 & Modificar los datos generales e información de tutela del tutor. & 
		\\texttt{UPDATE tutores SET nombre=?, primer\\_apellido=?, segundo\\_apellido=?, fecha\\_nacimiento=?, sexo=?, curp=?, nacionalidad\\_id=?, municipio\\_nacimiento\\_id=?, escolaridad=?, ocupacion=?, es\\_tutor\\_legal=?, tipo\\_tutela\\_id=?, resolucion\\_tutela=?, fecha\\_inicio\\_tutela=?, direccion\\_id=? WHERE id=?;} \\\\
		\\addlinespace
		Q-022 & Registrar un idioma o dialecto del NNA. & 
		\\texttt{INSERT INTO nna\\_idiomas (nna\\_id, idioma\\_id, nivel\\_habla\\_id, nivel\\_comprension\\_id, nivel\\_escritura\\_id, requiere\\_traductor) VALUES (?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-023 & Consultar idiomas registrados del NNA. & 
		\\texttt{SELECT ni.*, i.nombre FROM nna\\_idiomas ni JOIN cat\\_idiomas i ON ni.idioma\\_id = i.id WHERE ni.nna\\_id = ?;} \\\\
		\\addlinespace
		Q-024 & Registrar un idioma del Tutor. & 
		\\texttt{INSERT INTO tutor\\_idiomas (tutor\\_id, idioma\\_id, nivel\\_habla\\_id, nivel\\_comprension\\_id, nivel\\_escritura\\_id, requiere\\_traductor) VALUES (?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-025 & Consultar idiomas registrados del Tutor. & 
		\\texttt{SELECT ti.*, i.nombre FROM tutor\\_idiomas ti JOIN cat\\_idiomas i ON ti.idioma\\_id = i.id WHERE ti.tutor\\_id = ?;} \\\\
		\\addlinespace
		Q-026 & Registrar una discapacidad asociada al NNA. & 
		\\texttt{INSERT INTO nna\\_discapacidades (nna\\_id, discapacidad\\_id, tipo\\_discapacidad, grado\\_dependencia, observaciones) VALUES (?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-027 & Consultar las discapacidades del NNA. & 
		\\texttt{SELECT nd.*, d.nombre FROM nna\\_discapacidades nd JOIN cat\\_discapacidades d ON nd.discapacidad\\_id = d.id WHERE nd.nna\\_id = ?;} \\\\
		\\addlinespace
		Q-028 & Registrar una enfermedad crónica o padecimiento (NNA/Tutor). & 
		\\texttt{INSERT INTO personas\\_enfermedades (nna\\_id, tutor\\_id, enfermedad\\_id, tratamiento\\_id, es\\_cronica, esta\\_controlada, requiere\\_medicamento, nombre\\_medicamento, observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-029 & Consultar enfermedades activas registradas para el menor o tutor. & 
		\\texttt{SELECT pe.*, e.nombre FROM personas\\_enfermedades pe JOIN cat\\_enfermedades e ON pe.enfermedad\\_id = e.id WHERE pe.nna\\_id = ? OR pe.tutor\\_id = ?;} \\\\
		\\bottomrule
	\\end{tabular}
\\end{table}

\\subsection{Módulo de Expedientes y Valoraciones}

\\begin{table}[H]
	\\centering
	\\caption{Diccionario de consultas --- Expedientes y Valoraciones}
	\\label{tab:consultas-expedientes}
	\\footnotesize
	\\begin{tabular}{l p{4.5cm} p{8.5cm}}
		\\toprule
		\\textbf{ID} & \\textbf{Descripción} & \\textbf{Sentencia SQL} \\\\
		\\midrule
		Q-030 & Crear / Abrir expediente de atención para un NNA. & 
		\\texttt{INSERT INTO expedientes (folio\\_fud, nna\\_id, estatus\\_proceso) VALUES (?, ?, 'Detección');} \\\\
		\\addlinespace
		Q-031 & Consultar la información básica del expediente de un NNA. & 
		\\texttt{SELECT * FROM expedientes WHERE id = ? OR folio\\_fud = ?;} \\\\
		\\addlinespace
		Q-032 & Registrar una valoración multidisciplinaria de especialista. & 
		\\texttt{INSERT INTO valoraciones (expediente\\_id, especialista\\_id, area\\_evaluacion, hallazgos\\_dictamen, medidas\\_sugeridas, fecha\\_valoracion) VALUES (?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-033 & Registrar la vulneración de un derecho de la LGDNNA. & 
		\\texttt{INSERT INTO derechos\\_vulnerados (expediente\\_id, derecho\\_id, esta\\_vulnerado, observaciones, creado\\_por, fecha\\_registro) VALUES (?, ?, true, ?, ?, ?);} \\\\
		\\addlinespace
		Q-034 & Actualizar el estado de vulneración/restitución de un derecho. & 
		\\texttt{UPDATE derechos\\_vulnerados SET esta\\_vulnerado = ?, observaciones = ? WHERE id = ?;} \\\\
		\\addlinespace
		Q-035 & Obtener el historial de valoraciones del expediente. & 
		\\texttt{SELECT v.*, u.nombre FROM valoraciones v JOIN usuarios u ON v.especialista\\_id = u.id WHERE v.expediente\\_id = ? ORDER BY v.fecha\\_valoracion DESC;} \\\\
		\\addlinespace
		Q-036 & Obtener la lista de derechos vulnerados activos. & 
		\\texttt{SELECT dv.*, d.nom\\_derecho FROM derechos\\_vulnerados dv JOIN cat\\_derecho\\_lgdnna d ON dv.derecho\\_id = d.id\\_derecho WHERE dv.expediente\\_id = ? AND dv.esta\\_vulnerado = true;} \\\\
		\\bottomrule
	\\end{tabular}
\\end{table}

\\subsection{Módulo de Directorio de Actores y Catálogos}

\\begin{table}[H]
	\\centering
	\\caption{Diccionario de consultas --- Directorio de Actores y Catálogos}
	\\label{tab:consultas-actores}
	\\footnotesize
	\\begin{tabular}{l p{4.5cm} p{8.5cm}}
		\\toprule
		\\textbf{ID} & \\textbf{Descripción} & \\textbf{Sentencia SQL} \\\\
		\\midrule
		Q-037 & Registrar una nueva institución / actor de derechos. & 
		\\texttt{INSERT INTO actores\\_derechos (nombre, tipo\\_actor\\_id, tiene\\_registro\\_oficial, registro\\_oficial\\_num, horario\\_atencion, observaciones, activo, fecha\\_registro, direccion\\_id) VALUES (?, ?, ?, ?, ?, ?, true, ?, ?);} \\\\
		\\addlinespace
		Q-038 & Registrar medios de contacto de un actor. & 
		\\texttt{INSERT INTO contactos (tel\\_principal, tel\\_secundario, correo, pagina\\_web, red\\_social\\_id, red\\_social\\_usuario, actor\\_id, es\\_principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-039 & Registrar una dirección o ubicación de actor o persona. & 
		\\texttt{INSERT INTO direcciones (calle, no\\_exterior, no\\_interior, colonia\\_id, tipo\\_lugar\\_id, pueblo\\_comunidad, referencia\\_ubicacion) VALUES (?, ?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-040 & Registrar datos específicos de Persona Física en el Directorio. & 
		\\texttt{INSERT INTO actor\\_persona\\_fisica (id\\_actor, curp, rfc, fecha\\_nacimiento, sexo, municipio\\_id, escolaridad, ocupacion\\_oficio, descripcion\\_actividad, disponibilidad, es\\_lider\\_comunitario, es\\_lider\\_religioso, pertenece\\_grupo, como\\_contactar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-041 & Registrar enlace o representante institucional del actor. & 
		\\texttt{INSERT INTO actor\\_enlace (actor\\_id, nom\\_enlace, cargo\\_enlace, es\\_principal\\_contacto, notas\\_enlace) VALUES (?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-042 & Consultar la lista de enlaces registrados para un actor. & 
		\\texttt{SELECT * FROM actor\\_enlace WHERE actor\\_id = ?;} \\\\
		\\addlinespace
		Q-043 & Registrar un programa de apoyo ofrecido por el actor. & 
		\\texttt{INSERT INTO actor\\_programa (actor\\_id, nom\\_programa, descripcion, fecha\\_inicio, activo\\_programa) VALUES (?, ?, ?, ?, true);} \\\\
		\\addlinespace
		Q-044 & Registrar un servicio de apoyo asociado a un programa. & 
		\\texttt{INSERT INTO servicios\\_actores (actor\\_id, programa\\_id, categoria\\_id, nombre\\_servicio, descripcion\\_servicio, modalidad, es\\_gratuito, costo, duracion, disponibilidad, requisitos\\_tramites, poblacion\\_objetivo, activo\\_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true);} \\\\
		\\addlinespace
		Q-045 & Vincular un derecho de LGDNNA con un servicio de actor. & 
		\\texttt{INSERT INTO servicio\\_derecho (servicio\\_id, derecho\\_id) VALUES (?, ?);} \\\\
		\\addlinespace
		Q-046 & Vincular un servicio a un expediente (Canalización activa). & 
		\\texttt{INSERT INTO expediente\\_vinculacion\\_servicios (expediente\\_id, servicio\\_actor\\_id, fecha\\_vinculacion) VALUES (?, ?, ?);} \\\\
		\\addlinespace
		Q-047 & Consultar las canalizaciones de servicios activas del expediente. & 
		\\texttt{SELECT evs.*, sa.nombre\\_servicio, ad.nombre FROM expediente\\_vinculacion\\_servicios evs JOIN servicios\\_actores sa ON evs.servicio\\_actor\\_id = sa.id JOIN actores\\_derechos ad ON sa.actor\\_id = ad.id WHERE evs.expediente\\_id = ?;} \\\\
		\\addlinespace
		Q-048 & Filtrar actores por municipio y categoría de servicio. & 
		\\texttt{SELECT a.*, sa.nombre\\_servicio FROM actores\\_derechos a JOIN direcciones d ON a.direccion\\_id = d.id JOIN cat\\_colonias c ON d.colonia\\_id = c.id JOIN cat\\_municipios m ON c.municipio\\_id = m.id JOIN servicios\\_actores sa ON sa.actor\\_id = a.id WHERE m.id = ? AND sa.categoria\\_id = ? AND a.activo = true;} \\\\
		\\addlinespace
		Q-049 & Deshabilitar un actor de manera lógica. & 
		\\texttt{UPDATE actores\\_derechos SET activo = false WHERE id = ?;} \\\\
		\\addlinespace
		Q-050 & Reactivar un actor inhabilitado. & 
		\\texttt{UPDATE actores\\_derechos SET activo = true WHERE id = ?;} \\\\
		\\addlinespace
		Q-051 & Deshabilitar lógicamente un programa de actor. & 
		\\texttt{UPDATE actor\\_programa SET activo\\_programa = false WHERE id\\_programa = ?;} \\\\
		\\addlinespace
		Q-052 & Consultar colonias y municipios por Código Postal (SEPOMEX). & 
		\\texttt{SELECT col.id, col.nombre, mun.id, mun.nombre, est.id, est.nombre FROM cat\\_colonias col JOIN cat\\_municipios mun ON col.municipio\\_id = mun.id JOIN cat\\_estados est ON mun.estado\\_id = est.id WHERE col.codigo\\_postal = ?;} \\\\
		\\addlinespace
		Q-053 & Obtener catálogo de idiomas INALI. & 
		\\texttt{SELECT id, nombre, variante FROM cat\\_idiomas ORDER BY nombre ASC;} \\\\
		\\addlinespace
		Q-054 & Consultar eventos programados en calendario mensual. & 
		\\texttt{SELECT * FROM eventos\\_calendario WHERE fecha\\_inicio >= ? AND fecha\\_fin <= ?;} \\\\
		\\addlinespace
		Q-055 & Registrar un nuevo evento o cita en la agenda del calendario. & 
		\\texttt{INSERT INTO eventos\\_calendario (titulo, descripcion, fecha\\_inicio, fecha\\_fin, expediente\\_id) VALUES (?, ?, ?, ?, ?);} \\\\
		\\addlinespace
		Q-056 & Modificar datos u horarios de un evento en el calendario. & 
		\\texttt{UPDATE eventos\\_calendario SET titulo=?, descripcion=?, fecha\\_inicio=?, fecha\\_fin=? WHERE id=?;} \\\\
		\\bottomrule
	\\end{tabular}
\\end{table}
"""

# Construct full parte5_persistencia.tex content
latex_out = []
latex_out.append("\\chapter[Persistencia de la Información]{Diseño de la Persistencia de la Información}")  # Added short name for header
latex_out.append("")
latex_out.append("\\section{Modelo Relacional}")
latex_out.append("")
latex_out.append("El diseño de la base de datos relacional de SICORRE está estructurado para garantizar consistencia, integridad referencial y rendimiento. El esquema PostgreSQL está completamente normalizado y se organiza en los siguientes bloques principales:")
latex_out.append("\\begin{itemize}")
latex_out.append("\t\\item \\textbf{Catálogos Geográficos y de Dirección:} Permiten estandarizar ubicaciones mediante las tablas \\texttt{cat\\_estados}, \\texttt{cat\\_municipios} y \\texttt{cat\\_colonias} (SEPOMEX), asociadas a la tabla central \\texttt{direcciones}.")
latex_out.append("\t\\item \\textbf{Control de Acceso:} Administra el personal mediante las tablas \\texttt{usuarios} y \\texttt{cat\\_roles}.")
latex_out.append("\t\\item \\textbf{Núcleo del Negocio (NNA y Tutores):} Tabla central \\texttt{nna} para menores, vinculada a sus respectivos \\texttt{tutores} mediante la tabla relacional \\texttt{nna\\_tutores}, además de registrar antecedentes en \\texttt{hechos\\_victimales} y \\texttt{victima\\_directa}.")
latex_out.append("\t\\item \\textbf{Operación y Expedientes:} Tablas de \\texttt{expedientes}, \\texttt{valoraciones} de especialistas y registro de \\texttt{derechos\\_vulnerados}.")
latex_out.append("\t\\item \\textbf{Directorio de Actores:} Controla dependencias e instituciones externas de apoyo en materia de restitución mediante las tablas \\texttt{actores\\_derechos}, \\texttt{servicios\\_actores} y \\texttt{contactos}.")
latex_out.append("\\end{itemize}")
latex_out.append("")
latex_out.append("A continuación, la Figura~\\ref{fig:modelo-relacional} ilustra el diagrama entidad-relación físico con sus correspondientes claves primarias, foráneas y cardinalidades de asociación.")
latex_out.append("")
latex_out.append("\\begin{figure}[H]")
latex_out.append("\t\\centering")
latex_out.append("\t\\includegraphics[angle=90,width=0.92\\textwidth,height=0.82\\textheight,keepaspectratio]{img/bdproyecto.png}")
latex_out.append("\t\\caption{Modelo relacional de la base de datos (PostgreSQL).}")
latex_out.append("\t\\label{fig:modelo-relacional}")
latex_out.append("\\end{figure}")
latex_out.append("")
latex_out.append("\\section{Diccionario de Datos}")
latex_out.append("")
latex_out.append("La siguiente sección presenta detalladamente el diccionario de datos de la base de datos de SICORRE, estructurado a partir del modelo conceptual y físico. Para cada tabla, se detallan los nombres de los atributos físicos, su tipo de dato, longitud máxima, obligatoriedad y una breve descripción explicativa. Todas las tablas se configuran con anchos de columna fijos y tamaño de fuente compacto para garantizar un ajuste perfecto en los márgenes de página.")
latex_out.append("")

# Add all generated tables
latex_out.append("\n".join(latex_tables))

# Add queries
latex_out.append(queries_latex)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(latex_out))

print(f"Successfully generated new {output_path} with {len(latex_tables)} database tables.")
