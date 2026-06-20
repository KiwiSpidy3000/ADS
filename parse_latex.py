import re
import os

latex_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\CDT-Analysis\4ModeloDinamico.tex"
output_path = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\parte4_dinamico.tex"

with open(latex_path, 'r', encoding='utf-8') as f:
    content = f.read()

# List of files in img to find matching image
img_dir = r"c:\Users\Alison\Documents\ADS-recuperacion\ADS-recuperacion\documento-diseno\img"
img_files = os.listdir(img_dir)

def get_image_file(cu_id):
    # Try finding exact matches like CU-XX.png or CUXX.png
    num_str = "".join(re.findall(r'\d+', cu_id))
    
    # Check with hyphen
    hyphen_name = f"CU-{num_str}.png"
    if hyphen_name in img_files:
        return hyphen_name
        
    # Check without hyphen
    no_hyphen_name = f"CU{num_str}.png"
    if no_hyphen_name in img_files:
        return no_hyphen_name
        
    # Check any file starting with CU-XX or CUXX
    for f in img_files:
        if f.lower().startswith(f"cu-{num_str}.") or f.lower().startswith(f"cu{num_str}."):
            return f
            
    # Default fallback
    return f"CU{num_str}.png"

# Dictionary of the 20 use cases not detailed in 4ModeloDinamico.tex
missing_ucs = {
    "CU-03": {
        "name": "Recuperar contraseña",
        "desc": "El usuario solicita restablecer su contraseña de acceso mediante su correo electrónico. El sistema genera un token de recuperación y envía un correo con el enlace de restablecimiento.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Correo no registrado} - El correo electrónico no corresponde a ningún usuario activo.\n\\end{itemize}"
    },
    "CU-16": {
        "name": "Registrar hecho victimal",
        "desc": "El Especialista captura la información del hecho victimal (violencia, maltrato, etc.) sufrido por el NNA para agregarlo a su expediente de restitución.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Datos incompletos} - Si no se rellenan los campos obligatorios del hecho victimal.\n\\end{itemize}"
    },
    "CU-17": {
        "name": "Modificar hecho victimal",
        "desc": "El Especialista edita la información previamente registrada sobre un hecho victimal en el sistema para corregir o complementar los datos.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Hecho no encontrado} - Si el identificador del hecho victimal no corresponde a ningún registro activo.\n\\end{itemize}"
    },
    "CU-20": {
        "name": "Abrir expediente",
        "desc": "El Especialista inicia un nuevo expediente de atención para un NNA, registrando el motivo de apertura y asociando su información general.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Expediente duplicado} - El NNA ya cuenta con un expediente de atención abierto en el sistema.\n\\end{itemize}"
    },
    "CU-21": {
        "name": "Consultar expediente",
        "desc": "El Especialista visualiza la información consolidada de un expediente de atención, incluyendo la línea de tiempo, valoraciones y derechos del NNA.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Acceso no autorizado} - El usuario no cuenta con los permisos necesarios para consultar este expediente.\n\\end{itemize}"
    },
    "CU-22": {
        "name": "Registrar valoración multidisciplinaria",
        "desc": "El Especialista registra el diagnóstico y las observaciones de una valoración realizada en áreas como salud, psicología, o educación.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Datos de diagnóstico vacíos} - El sistema requiere una descripción diagnóstica obligatoria.\n\\end{itemize}"
    },
    "CU-23": {
        "name": "Modificar valoración multidisciplinaria",
        "desc": "El Especialista actualiza los resultados o el diagnóstico de una valoración multidisciplinaria registrada en el expediente.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Valoración no encontrada} - Si el identificador de la valoración a modificar no existe.\n\\end{itemize}"
    },
    "CU-24": {
        "name": "Registrar derecho vulnerado",
        "desc": "El Especialista registra los derechos (de acuerdo a la LGDNNA) que han sido vulnerados para el NNA, asociándolos a su expediente.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Derecho ya registrado} - El derecho que se intenta agregar ya se encuentra listado en el expediente del NNA.\n\\end{itemize}"
    },
    "CU-25": {
        "name": "Modificar derecho vulnerado",
        "desc": "El Especialista actualiza el estado (vulnerado, restituido) o las observaciones de un derecho registrado en el expediente del NNA.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Registro no encontrado} - Si el derecho vulnerado a modificar no existe.\n\\end{itemize}"
    },
    "CU-26": {
        "name": "Registrar actor en materia de derechos",
        "desc": "El Especialista registra una institución u organismo externo que proporciona servicios de apoyo en la restitución de derechos.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Nombre duplicado} - Si la institución ya existe en el directorio de actores en materia de derechos.\n\\end{itemize}"
    },
    "CU-27": {
        "name": "Consultar actor en materia de derechos",
        "desc": "El Especialista visualiza el perfil detallado, la información de contacto y los servicios vigentes que ofrece un actor registrado.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Actor no encontrado} - Si el identificador del actor consultado no corresponde a ningún registro.\n\\end{itemize}"
    },
    "CU-28": {
        "name": "Modificar actor en materia de derechos",
        "desc": "El Especialista modifica la información general de contacto, nombre o datos de una institución del directorio.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Datos vacíos} - Si se intenta guardar la modificación omitiendo campos requeridos.\n\\end{itemize}"
    },
    "CU-29": {
        "name": "Eliminar actor en materia de derechos",
        "desc": "El Especialista elimina permanentemente un actor en materia de derechos del directorio.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Actor con dependencias} - No se puede eliminar el actor si está vinculado a servicios o expedientes activos.\n\\end{itemize}"
    },
    "CU-30": {
        "name": "Registrar servicio de actor",
        "desc": "El Especialista registra un nuevo servicio de apoyo (médico, legal, etc.) ofrecido por un actor en materia de derechos.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Datos de servicio inválidos} - Si el costo o la descripción son incorrectos.\n\\end{itemize}"
    },
    "CU-31": {
        "name": "Consultar actores por municipio y tipo de servicio",
        "desc": "El Especialista busca y filtra actores de derechos según el municipio de su ubicación y la categoría de servicios que ofrecen.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Sin resultados} - No existen actores que coincidan con la combinación de municipio y tipo de servicio seleccionados.\n\\end{itemize}"
    },
    "CU-35": {
        "name": "Modificar discapacidad de NNA o tutor",
        "desc": "El Especialista actualiza el registro de discapacidad de un NNA o su tutor, modificando las observaciones o el tipo de discapacidad.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Registro no encontrado} - Si la discapacidad a modificar no existe en el sistema.\n\\end{itemize}"
    },
    "CU-37": {
        "name": "Modificar enfermedad de NNA o tutor",
        "desc": "El Especialista modifica las observaciones o el estado de una enfermedad crónica o padecimiento registrado para el NNA o tutor.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Registro no encontrado} - Si el registro de enfermedad no existe.\n\\end{itemize}"
    },
    "CU-38": {
        "name": "Consultar calendario de expedientes",
        "desc": "El Especialista visualiza en una interfaz de calendario mensual todos los eventos, audiencias y valoraciones programadas.",
        "errors": "Este caso de uso no presenta flujos alternativos ni excepciones."
    },
    "CU-39": {
        "name": "Registrar evento en calendario",
        "desc": "El Especialista programa una nueva cita, audiencia o valoración en el calendario del sistema, asociándola a un expediente.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Choque de horario} - Si ya existe un evento programado para el mismo especialista a esa hora.\n\\end{itemize}"
    },
    "CU-40": {
        "name": "Modificar evento en calendario",
        "desc": "El Especialista actualiza la fecha, hora, descripción o tipo de un evento programado en el calendario.",
        "errors": "\\begin{itemize}\n\t\\item \\textbf{E1: Evento no encontrado} - Si el evento seleccionado ha sido eliminado o no existe.\n\\end{itemize}"
    }
}

# Parse documented UseCase blocks
usecases = {}
pos = 0
while True:
    start_idx = content.find(r"\begin{UseCase}", pos)
    if start_idx == -1:
        break
    
    # We must skip the "\begin{UseCase}" part which is 15 chars, to find the ID's open brace
    arg1_start = content.find("{", start_idx + 15)
    if arg1_start == -1:
        pos = start_idx + 15
        continue
    arg1_end = content.find("}", arg1_start)
    cu_id = content[arg1_start+1:arg1_end].strip()
    
    arg2_start = content.find("{", arg1_end)
    arg2_end = content.find("}", arg2_start)
    cu_name = content[arg2_start+1:arg2_end].strip()
    
    arg3_start = content.find("{", arg2_end)
    brace_count = 1
    i = arg3_start + 1
    while brace_count > 0 and i < len(content):
        if content[i] == "{":
            brace_count += 1
        elif content[i] == "}":
            brace_count -= 1
        i += 1
    arg3_end = i - 1
    cu_desc = content[arg3_start+1:arg3_end].strip()
    
    end_usecase_idx = content.find(r"\end{UseCase}", arg3_end)
    block_body = content[arg3_end:end_usecase_idx]
    
    # Extract Errores
    errores_content = "Este caso de uso no presenta flujos alternativos ni excepciones."
    err_start = block_body.find(r"\UCitem{Errores}")
    if err_start != -1:
        brace_start = block_body.find("{", err_start + 15)
        if brace_start != -1:
            brace_count = 1
            j = brace_start + 1
            while brace_count > 0 and j < len(block_body):
                if block_body[j] == "{":
                    brace_count += 1
                elif block_body[j] == "}":
                    brace_count -= 1
                j += 1
            brace_end = j - 1
            err_body = block_body[brace_start+1:brace_end].strip()
            
            titems = re.findall(r'\\Titem\s+(?:\{\\bf\s+\\hypertarget\{.*?\}\{(.*?)\}\}\s*:\s*|\{\\bf\s+(.*?)\}\s*:\s*)(.*?)(?=\\Titem|\\end\{Titemize\}|\Z)', err_body, re.DOTALL)
            if titems:
                errs = []
                for item in titems:
                    ey = item[0] if item[0] else item[1]
                    desc = item[2].strip()
                    desc = desc.replace("``", '"').replace("''", '"')
                    desc = re.sub(r'\s+', ' ', desc)
                    errs.append(f"\\item \\textbf{{{ey}: {desc}}}")
                if errs:
                    errores_content = "\\begin{itemize}\n\t" + "\n\t".join(errs) + "\n\\end{itemize}"
            else:
                cleaned_text = re.sub(r'\\begin\{Titemize\}|\\end\{Titemize\}|\\Titem', '', err_body).strip()
                cleaned_text = cleaned_text.replace("``", '"').replace("''", '"')
                cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
                if cleaned_text and not cleaned_text.lower().startswith("ningun"):
                    errores_content = cleaned_text
    
    usecases[cu_id] = {
        'name': cu_name,
        'desc': cu_desc.replace("``", '"').replace("''", '"').strip(),
        'errors': errores_content
    }
    
    pos = end_usecase_idx + 13

print(f"Parsed {len(usecases)} use cases from 4ModeloDinamico.tex.")

# Combine into a final list of 59 use cases
all_usecases = {}
for i in range(1, 60):
    cu_id = f"CU-{i:02d}"
    if cu_id in usecases:
        all_usecases[cu_id] = usecases[cu_id]
    elif cu_id in missing_ucs:
        all_usecases[cu_id] = missing_ucs[cu_id]
    else:
        # Fallback if somehow a usecase is completely missing (should not happen)
        all_usecases[cu_id] = {
            'name': f"Caso de Uso {cu_id}",
            'desc': f"Descripción para {cu_id}.",
            'errors': "Este caso de uso no presenta flujos alternativos ni excepciones."
        }

# Generate LaTeX content in strictly numerical order
latex_out = [
    "\\chapter{Diseño Dinámico}",
    "",
    "El presente capítulo detalla el comportamiento en tiempo de ejecución del sistema SICORRE para los casos de uso principales. A continuación, se presentan los diagramas de secuencia que modelan la interacción entre los diferentes componentes del sistema (Usuario, Interfaz, Backend y Base de Datos) junto con sus flujos de excepción y flujos alternativos.",
    ""
]

sorted_keys = sorted(all_usecases.keys(), key=lambda x: int(x.split('-')[1]))

for idx, cu_id in enumerate(sorted_keys):
    uc = all_usecases[cu_id]
    name = uc['name']
    desc = uc['desc']
    errors = uc['errors']
    img_file = get_image_file(cu_id)
    
    latex_out.append(f"% ============================================================")
    latex_out.append(f"\\section{{Diseño Dinámico del CU: {name} ({cu_id})}}")
    latex_out.append(f"% ============================================================")
    latex_out.append(f"")
    latex_out.append(f"\\subsection*{{Descripción del Flujo}}")
    latex_out.append(f"{desc}")
    latex_out.append(f"")
    latex_out.append(f"\\begin{{figure}}[H]")
    latex_out.append(f"\t\\centering")
    latex_out.append(f"\t\\includegraphics[width=0.8\\textwidth]{{img/{img_file}}}")
    latex_out.append(f"\t\\caption{{Diagrama de secuencia --- {cu_id} {name}.}}")
    latex_out.append(f"\t\\label{{fig:secuencia-{cu_id.lower().replace('-', '')}}}")
    latex_out.append(f"\\end{{figure}}")
    latex_out.append(f"")
    latex_out.append(f"\\subsection*{{Flujo Alternativo / Excepciones}}")
    latex_out.append(f"{errors}")
    latex_out.append(f"")
    if idx < len(sorted_keys) - 1:
        latex_out.append(f"\\bigskip")
        latex_out.append(f"\\noindent\\rule{{\\linewidth}}{{0.5pt}}")
        latex_out.append(f"\\bigskip")
        latex_out.append(f"")

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(latex_out))

print(f"Done generating {len(sorted_keys)} usecases in new LaTeX file!")
