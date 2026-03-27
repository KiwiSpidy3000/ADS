from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, TIMESTAMP, Text, Numeric, func
from sqlalchemy.orm import relationship
from database import Base


# ============================================================
# CATÁLOGOS GEOGRÁFICOS
# ============================================================

class CatEstado(Base):
    __tablename__ = "cat_estados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)

    municipios = relationship("CatMunicipio", back_populates="estado")


class CatMunicipio(Base):
    __tablename__ = "cat_municipios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    estado_id = Column(Integer, ForeignKey("cat_estados.id"))

    estado = relationship("CatEstado", back_populates="municipios")
    colonias = relationship("CatColonia", back_populates="municipio")


class CatColonia(Base):
    __tablename__ = "cat_colonias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo_postal = Column(String(5), nullable=False)
    municipio_id = Column(Integer, ForeignKey("cat_municipios.id"))

    municipio = relationship("CatMunicipio", back_populates="colonias")


# ============================================================
# CATÁLOGOS DE VIVIENDA
# ============================================================

class CatTipoVivienda(Base):
    __tablename__ = "cat_tipo_vivienda"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, unique=True, nullable=False)


class CatViviendaNNA(Base):
    __tablename__ = "cat_vivienda_nna"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, unique=True)


# ============================================================
# CATÁLOGOS VARIOS
# ============================================================

class CatEstatusEscolar(Base):
    __tablename__ = "cat_estatus_escolar"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String, unique=True, nullable=False)


class CatIdioma(Base):
    __tablename__ = "cat_idiomas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    variante = Column(String, nullable=True)


class CatEnfermedad(Base):
    __tablename__ = "cat_enfermedades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)


class CatDiscapacidad(Base):
    __tablename__ = "cat_discapacidades"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)


class CatRol(Base):
    __tablename__ = "cat_roles"

    id = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String, unique=True, nullable=False)

    usuarios = relationship("Usuario", back_populates="rol")


# ============================================================
# DIRECCIONES
# ============================================================

class DireccionUsuario(Base):
    __tablename__ = "direcciones_usuarios"

    id = Column(Integer, primary_key=True, index=True)
    calle = Column(String, nullable=True)
    num_exterior = Column(String, nullable=True)
    num_interior = Column(String, nullable=True)
    colonia_id = Column(Integer, ForeignKey("cat_colonias.id"), nullable=True)
    tipo_vivienda_id = Column(Integer, ForeignKey("cat_tipo_vivienda.id"), nullable=True)

    colonia = relationship("CatColonia")
    tipo_vivienda = relationship("CatTipoVivienda")


class DireccionNNA(Base):
    __tablename__ = "direcciones_nna"

    id = Column(Integer, primary_key=True, index=True)
    calle = Column(String, nullable=True)
    num_exterior = Column(String, nullable=True)
    num_interior = Column(String, nullable=True)
    colonia_id = Column(Integer, ForeignKey("cat_colonias.id"), nullable=True)
    pueblo_comunidad = Column(String, nullable=True)
    vivienda_nna_id = Column(Integer, ForeignKey("cat_vivienda_nna.id"), nullable=True)

    colonia = relationship("CatColonia")
    vivienda_nna = relationship("CatViviendaNNA")


class DireccionActor(Base):
    __tablename__ = "direcciones_actores"

    id = Column(Integer, primary_key=True, index=True)
    calle = Column(String, nullable=True)
    num_exterior = Column(String, nullable=True)
    num_interior = Column(String, nullable=True)
    referencia_ubicacion = Column(Text, nullable=True)
    colonia_id = Column(Integer, ForeignKey("cat_colonias.id"), nullable=True)

    colonia = relationship("CatColonia")


# ============================================================
# USUARIOS
# ============================================================

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    primer_apellido = Column(String, nullable=False)
    segundo_apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    curp = Column(String(18), unique=True, nullable=False)
    rfc = Column(String(13), unique=True, nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    sexo = Column(String(50), nullable=True)          # opcional, libre captura
    tipo_personal = Column(Boolean, nullable=True)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    direccion_id = Column(Integer, ForeignKey("direcciones_usuarios.id"), nullable=True)
    rol_id = Column(Integer, ForeignKey("cat_roles.id"), nullable=True)

    # Relaciones
    direccion = relationship("DireccionUsuario")
    rol = relationship("CatRol", back_populates="usuarios")
    integrante_equipos = relationship("IntegranteEquipo", back_populates="usuario")

# ============================================================
# EQUIPOS MULTIDISCIPLINARIOS
# ============================================================

class EquipoMultidisciplinario(Base):
    __tablename__ = "equipos_multidisciplinarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre_equipo = Column(String, nullable=False)
    activo = Column(Boolean, default=True)
    fecha_creacion = Column(TIMESTAMP, server_default=func.now())

    integrantes = relationship("IntegranteEquipo", back_populates="equipo")
    nnas = relationship("NNA", back_populates="equipo_asignado")


class IntegranteEquipo(Base):
    __tablename__ = "integrantes_equipo"

    id = Column(Integer, primary_key=True, index=True)
    equipo_id = Column(Integer, ForeignKey("equipos_multidisciplinarios.id"), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_ingreso = Column(TIMESTAMP, server_default=func.now())
    fecha_salida = Column(TIMESTAMP, nullable=True)
    motivo_cambio = Column(Text, nullable=True)
    estatus_integrante = Column(String, default="Activo")
    es_momentaneo = Column(Boolean, default=False)

    equipo = relationship("EquipoMultidisciplinario", back_populates="integrantes")
    usuario = relationship("Usuario", back_populates="integrante_equipos")


# ============================================================
# TUTORES
# ============================================================


class TutorIdioma(Base):
    __tablename__ = "tutor_idiomas"

    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("tutores.id"), nullable=True)
    idioma_id = Column(Integer, ForeignKey("cat_idiomas.id"), nullable=True)
    habla = Column(Boolean, default=False)
    entiende = Column(Boolean, default=False)
    escribe = Column(Boolean, default=False)
    requiere_traductor = Column(Boolean, default=False)

    tutor = relationship("Tutor", back_populates="idiomas")
    idioma = relationship("CatIdioma")

class Tutor(Base):
    __tablename__ = "tutores"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    primer_apellido = Column(String, nullable=False)
    segundo_apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo = Column(String, nullable=True)
    curp = Column(String(18), unique=True, nullable=True)
    nacionalidad = Column(String, default="Mexicana")
    parentesco = Column(String, nullable=True)
    direccion_id = Column(Integer, ForeignKey("direcciones_usuarios.id"), nullable=True)

    direccion = relationship("DireccionUsuario")
    nnas = relationship("NNA", back_populates="tutor")
    enfermedades = relationship("TutorEnfermedad", back_populates="tutor")
    idiomas = relationship("TutorIdioma", back_populates="tutor")


# ============================================================
# NNA (Niñas, Niños y Adolescentes)
# ============================================================

class NNA(Base):
    __tablename__ = "nna"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    primer_apellido = Column(String, nullable=False)
    segundo_apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo = Column(String, nullable=True)
    curp = Column(String(18), unique=True, nullable=True)
    nacionalidad = Column(String, default="Mexicana")
    es_migrante = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    creado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    estatus_escolar_id = Column(Integer, ForeignKey("cat_estatus_escolar.id"), nullable=True)
    tutor_id = Column(Integer, ForeignKey("tutores.id"), nullable=True)
    direccion_id = Column(Integer, ForeignKey("direcciones_nna.id"), nullable=True)
    equipo_asignado_id = Column(Integer, ForeignKey("equipos_multidisciplinarios.id"), nullable=True)

    # Relaciones
    creador = relationship("Usuario")
    estatus_escolar = relationship("CatEstatusEscolar")
    tutor = relationship("Tutor", back_populates="nnas")
    direccion = relationship("DireccionNNA")
    equipo_asignado = relationship("EquipoMultidisciplinario", back_populates="nnas")
    enfermedades = relationship("NNAEnfermedad", back_populates="nna")
    discapacidades = relationship("NNADiscapacidad", back_populates="nna")
    idiomas = relationship("NNAIdioma", back_populates="nna")
    hechos_victimales = relationship("HechoVictimal", back_populates="nna")
    expedientes = relationship("Expediente", back_populates="nna")


# ============================================================
# ENFERMEDADES Y DISCAPACIDADES
# ============================================================

class TutorEnfermedad(Base):
    __tablename__ = "tutor_enfermedades"

    id = Column(Integer, primary_key=True, index=True)
    tutor_id = Column(Integer, ForeignKey("tutores.id"), nullable=True)
    enfermedad_id = Column(Integer, ForeignKey("cat_enfermedades.id"), nullable=True)
    es_cronica = Column(Boolean, default=False)
    esta_controlada = Column(Boolean, default=False)
    requiere_medicamento = Column(Boolean, default=False)
    nombre_medicamento = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)

    tutor = relationship("Tutor", back_populates="enfermedades")
    enfermedad = relationship("CatEnfermedad")


class NNAEnfermedad(Base):
    __tablename__ = "nna_enfermedades"

    id = Column(Integer, primary_key=True, index=True)
    nna_id = Column(Integer, ForeignKey("nna.id"), nullable=True)
    enfermedad_id = Column(Integer, ForeignKey("cat_enfermedades.id"), nullable=True)
    es_cronica = Column(Boolean, default=False)
    esta_controlada = Column(Boolean, default=False)
    requiere_medicamento = Column(Boolean, default=False)
    nombre_medicamento = Column(String, nullable=True)
    observaciones = Column(Text, nullable=True)

    nna = relationship("NNA", back_populates="enfermedades")
    enfermedad = relationship("CatEnfermedad")


class NNADiscapacidad(Base):
    __tablename__ = "nna_discapacidades"

    id = Column(Integer, primary_key=True, index=True)
    nna_id = Column(Integer, ForeignKey("nna.id"), nullable=True)
    discapacidad_id = Column(Integer, ForeignKey("cat_discapacidades.id"), nullable=True)
    tipo_discapacidad = Column(String, nullable=True)
    grado_dependencia = Column(String, nullable=True)

    nna = relationship("NNA", back_populates="discapacidades")
    discapacidad = relationship("CatDiscapacidad")


class NNAIdioma(Base):
    __tablename__ = "nna_idiomas"

    id = Column(Integer, primary_key=True, index=True)
    nna_id = Column(Integer, ForeignKey("nna.id"), nullable=True)
    idioma_id = Column(Integer, ForeignKey("cat_idiomas.id"), nullable=True)
    habla = Column(Boolean, default=False)
    entiende = Column(Boolean, default=False)
    escribe = Column(Boolean, default=False)
    requiere_traductor = Column(Boolean, default=False)

    nna = relationship("NNA", back_populates="idiomas")
    idioma = relationship("CatIdioma")


# ============================================================
# ACTORES DE DERECHOS Y SERVICIOS
# ============================================================

class ActorDerechos(Base):
    __tablename__ = "actores_derechos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    es_institucion_publica = Column(Boolean, default=False)
    es_organizacion_privada = Column(Boolean, default=False)
    es_persona_fisica = Column(Boolean, default=False)
    direccion_id = Column(Integer, ForeignKey("direcciones_actores.id"), nullable=True)
    pagina_web = Column(String, nullable=True)
    telefonos = Column(String, nullable=True)
    redes_sociales = Column(String, nullable=True)
    correos = Column(String, nullable=True)
    horarios_atencion = Column(String, nullable=True)
    responsable_contacto = Column(String, nullable=True)

    direccion = relationship("DireccionActor")
    servicios = relationship("ServicioActor", back_populates="actor")


class ServicioActor(Base):
    __tablename__ = "servicios_actores"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("actores_derechos.id"), nullable=True)
    nombre_servicio = Column(String, nullable=True)
    es_servicio_medico = Column(Boolean, default=False)
    es_servicio_psicologico = Column(Boolean, default=False)
    es_servicio_legal = Column(Boolean, default=False)
    es_gratuito = Column(Boolean, default=True)
    costo = Column(Numeric, nullable=True)
    duracion = Column(String, nullable=True)
    disponibilidad = Column(String, nullable=True)
    requisitos_tramites = Column(Text, nullable=True)

    actor = relationship("ActorDerechos", back_populates="servicios")


# ============================================================
# HECHOS VICTIMALES
# ============================================================

class HechoVictimal(Base):
    __tablename__ = "hechos_victimales"

    id = Column(Integer, primary_key=True, index=True)
    nna_id = Column(Integer, ForeignKey("nna.id"), nullable=True)
    nombre_victima_directa = Column(String, nullable=True)
    fecha_hecho = Column(Date, nullable=True)
    descripcion_delito = Column(Text, nullable=True)

    nna = relationship("NNA", back_populates="hechos_victimales")


# ============================================================
# EXPEDIENTES
# ============================================================

class Expediente(Base):
    __tablename__ = "expedientes"

    id = Column(Integer, primary_key=True, index=True)
    folio_fud = Column(String, unique=True, nullable=True)
    nna_id = Column(Integer, ForeignKey("nna.id"), nullable=True)
    estatus_proceso = Column(String, default="Detección")

    nna = relationship("NNA", back_populates="expedientes")
    valoraciones = relationship("Valoracion", back_populates="expediente")
    derechos_vulnerados = relationship("DerechoVulnerado", back_populates="expediente")
    vinculaciones_servicios = relationship("ExpedienteVinculacionServicio", back_populates="expediente")


class Valoracion(Base):
    __tablename__ = "valoraciones"

    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"), nullable=True)
    especialista_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    area_evaluacion = Column(String, nullable=False)
    hallazgos_dictamen = Column(Text, nullable=False)
    medidas_sugeridas = Column(Text, nullable=True)
    fecha_valoracion = Column(TIMESTAMP, server_default=func.now())

    expediente = relationship("Expediente", back_populates="valoraciones")
    especialista = relationship("Usuario")


class DerechoVulnerado(Base):
    __tablename__ = "derechos_vulnerados"

    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"), nullable=True)
    derecho_nombre = Column(String, nullable=True)
    esta_vulnerado = Column(Boolean, default=False)
    observaciones = Column(Text, nullable=True)
    creado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    expediente = relationship("Expediente", back_populates="derechos_vulnerados")
    usuario_creador = relationship("Usuario")


class ExpedienteVinculacionServicio(Base):
    __tablename__ = "expediente_vinculacion_servicios"

    id = Column(Integer, primary_key=True, index=True)
    expediente_id = Column(Integer, ForeignKey("expedientes.id"), nullable=True)
    servicio_actor_id = Column(Integer, ForeignKey("servicios_actores.id"), nullable=True)
    fecha_vinculacion = Column(TIMESTAMP, server_default=func.now())

    expediente = relationship("Expediente", back_populates="vinculaciones_servicios")
    servicio = relationship("ServicioActor")