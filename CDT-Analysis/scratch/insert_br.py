# Script to insert business rules after requirements in 2ModeloDelAlcance.tex
import re

rules_latex = r"""
%---------------------------------------------------------
\section{Reglas de negocio}

A continuación se describen las reglas de negocio identificadas a partir de las restricciones operativas y de integridad de la información del sistema.

\begin{BussinesRule}[%
	\brClassification{\btEnabler}{\bcIntegrity}{\blStrict}
	]{BR-01}{Unicidad de la CURP}
	
	\BRitem[Descripción:] La CURP de un usuario, tutor o NNA debe ser única en el sistema.
	\BRitem[Motivación:] Evitar la duplicidad de registros y expedientes para la misma persona física.
	\BRitem[Sentencia:] No se permite registrar una CURP que ya se encuentre asignada a otro registro activo.
	\BRitem[Ejemplo positivo:] 
        \begin{itemize}
        	\item Se registra un NNA con una CURP que no existe en la base de datos.
        \end{itemize}
	
	\BRitem[Ejemplo negativo:] 
		\begin{itemize}
        	\item Se intenta registrar un NNA con la CURP de otro NNA previamente registrado en el sistema.
        \end{itemize}
	
	\BRitem[Referenciado por:] \hyperlink{CU-13}{CU-13}.
\end{BussinesRule}

\begin{BussinesRule}[%
	\brClassification{\btEnabler}{\bcIntegrity}{\blStrict}
	]{BR-02}{Unicidad del correo electrónico}
	
	\BRitem[Descripción:] El correo electrónico utilizado por el personal de la fundación debe ser único.
	\BRitem[Motivación:] El correo electrónico se utiliza como credencial de acceso principal (usuario) y debe identificar univocamente a cada empleado.
	\BRitem[Sentencia:] El sistema rechazará el registro de un usuario si el correo proporcionado ya está vinculado a otra cuenta.
	\BRitem[Ejemplo positivo:] 
        \begin{itemize}
        	\item Se registra a un especialista con un correo institucional nuevo.
        \end{itemize}
	
	\BRitem[Ejemplo negativo:] 
		\begin{itemize}
        	\item Se intenta crear un usuario con un correo que ya pertenece a la cuenta de la directora.
        \end{itemize}
	
	\BRitem[Referenciado por:] \hyperlink{CU-04}{CU-04}, \hyperlink{CU-06}{CU-06}.
\end{BussinesRule}

\begin{BussinesRule}[%
	\brClassification{\btEnabler}{\bcIntegrity}{\blStrict}
	]{BR-03}{Asignación única de equipo a NNA}
	
	\BRitem[Descripción:] Un NNA solo puede estar asignado a un equipo multidisciplinario a la vez.
	\BRitem[Motivación:] Mantener la claridad en la responsabilidad y seguimiento del caso del NNA, evitando duplicidad de esfuerzos y contradicciones.
	\BRitem[Sentencia:] Si un NNA es reasignado a un nuevo equipo, su relación con el equipo anterior se sustituye por la nueva.
	\BRitem[Ejemplo positivo:] 
        \begin{itemize}
        	\item Se asigna un NNA de reciente ingreso al Equipo A.
        \end{itemize}
	
	\BRitem[Ejemplo negativo:] 
		\begin{itemize}
        	\item Se intenta asignar el NNA al Equipo B sin desligarlo primero, resultando en el NNA perteneciendo a dos equipos activos simultáneamente. (El sistema automáticamente reemplazará la asignación).
        \end{itemize}
	
	\BRitem[Referenciado por:] \hyperlink{CU-12}{CU-12}.
\end{BussinesRule}

\begin{BussinesRule}[%
	\brClassification{\btEnabler}{\bcIntegrity}{\blStrict}
	]{BR-04}{Unicidad del Folio FUD en expedientes}
	
	\BRitem[Descripción:] El folio del Formato Único de Datos (FUD) debe ser único para cada expediente.
	\BRitem[Motivación:] El folio FUD es el identificador oficial físico y lógico del expediente del NNA; duplicarlo corrompe la trazabilidad.
	\BRitem[Sentencia:] No pueden existir dos expedientes con el mismo número de folio FUD en todo el sistema.
	\BRitem[Ejemplo positivo:] 
        \begin{itemize}
        	\item Se abre un expediente con el folio FUD "2026-001".
        \end{itemize}
	
	\BRitem[Ejemplo negativo:] 
		\begin{itemize}
        	\item Se intenta crear o modificar un expediente para asignarle el folio "2026-001" cuando este ya está en uso.
        \end{itemize}
	
	\BRitem[Referenciado por:] \hyperlink{CU-15}{CU-15}, \hyperlink{CU-20}{CU-20}.
\end{BussinesRule}
"""

with open('../2ModeloDelAlcance.tex', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert after \end{requerimientosU}
target_str = "\\end{requerimientosU}\n%---------------------------------------------------------\n"

if target_str in content:
    new_content = content.replace(target_str, target_str + rules_latex)
    with open('../2ModeloDelAlcance.tex', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Reglas de negocio insertadas.")
else:
    print("No se encontró el lugar para insertar.")

