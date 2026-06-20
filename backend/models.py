from sqlalchemy import (
    Boolean, Column, Date, DateTime, Numeric,
    ForeignKey, Integer, String, Text, UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


# =============================================================
# CATÁLOGOS GEOGRÁFICOS
# =============================================================

class CatEstados(Base):
    __tablename__ = "cat_estados"
    __table_args__ = (UniqueConstraint("nombre", name="uq_cat_estados_nombre"),)

    id     = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, nullable=False)

    municipios = relationship("CatMunicipios", back_populates="estado")


class CatMunicipios(Base):
    __tablename__ = "cat_municipios"

    id        = Column(Integer, primary_key=True, autoincrement=True)
    nombre    = Column(String, nullable=False)
    estado_id = Column(Integer, ForeignKey("cat_estados.id"))

    estado   = relationship("CatEstados", back_populates="municipios")
    colonias = relationship("CatColonias", back_populates="municipio")


class CatColonias(Base):
    __tablename__ = "cat_colonias"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    nombre        = Column(String, nullable=False)
    codigo_postal = Column(String(5), nullable=False)
    municipio_id  = Column(Integer, ForeignKey("cat_municipios.id"))

    municipio   = relationship("CatMunicipios", back_populates="colonias")
    direcciones = relationship("Direcciones", back_populates="colonia")


# =============================================================
# CATÁLOGOS DE DIRECCIÓN Y CONTACTO
# =============================================================

class CatTipoLugar(Base):
    __tablename__ = "cat_tipo_lugar"
    __table_args__ = (UniqueConstraint("descripcion", name="uq_cat_tipo_lugar_descripcion"),)

    id             = Column(Integer, primary_key=True, autoincrement=True)
    descripcion    = Column(String, nullable=False)
    aplica_nna     = Column(Boolean, default=True)
    aplica_persona = Column(Boolean, default=True)
    aplica_actor   = Column(Boolean, default=False)

    direcciones = relationship("Direcciones", back_populates="tipo_lugar")


class CatPlataformaRedSocial(Base):
    __tablename__ = "cat_plataforma_red_social"
    __table_args__ = (UniqueConstraint("nombre", name="uq_cat_plataforma_red_social_nombre"),)

    id       = Column(Integer, primary_key=True, autoincrement=True)
    nombre   = Column(String, nullable=False)
    url_base = Column(String)

    contactos = relationship("Contactos", back_populates="red_social")


# =============================================================
# CATÁLOGOS DE ROLES Y PERSONAS
# =============================================================

class CatRoles(Base):
    __tablename__ = "cat_roles"
    __table_args__ = (UniqueConstraint("nombre_rol", name="uq_cat_roles_nombre_rol"),)

    id         = Column(Integer, primary_key=True, autoincrement=True)
    nombre_rol = Column(String, nullable=False)

    usuarios = relationship("Usuarios", back_populates="rol")


class CatNacionalidades(Base):
    __tablename__ = "cat_nacionalidades"
    __table_args__ = (UniqueConstraint("nombre", name="uq_cat_nacionalidades_nombre"),)

    id     = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String(3))

    tutores = relationship("Tutores", back_populates="nacionalidad")
    nna     = relationship("NNA",     back_populates="nacionalidad")


class CatGradoEscolar(Base):
    __tablename__ = "cat_grado_escolar"
    __table_args__ = (UniqueConstraint("descripcion", name="uq_cat_grado_escolar_descripcion"),)

    id          = Column(Integer, primary_key=True, autoincrement=True)
    descripcion = Column(String, nullable=False)

    nna = relationship("NNA", back_populates="grado_escolar")


# =============================================================
# CATÁLOGOS DE IDIOMAS
# =============================================================

class CatIdiomas(Base):
    __tablename__ = "cat_idiomas"

    id       = Column(Integer, primary_key=True, autoincrement=True)
    nombre   = Column(String, nullable=False)
    variante = Column(String)

    tutor_idiomas = relationship("TutorIdiomas", back_populates="idioma")
    nna_idiomas   = relationship("NNAIdiomas",   back_populates="idioma")


class CatNivelIdioma(Base):
    __tablename__ = "cat_nivel_idioma"
    __table_args__ = (UniqueConstraint("nivel", name="uq_cat_nivel_idioma_nivel"),)

    id    = Column(Integer, primary_key=True, autoincrement=True)
    nivel = Column(String, nullable=False)


# =============================================================
# CATÁLOGOS DE SALUD
# =============================================================

class CatEnfermedades(Base):
    __tablename__ = "cat_enfermedades"

    id     = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, nullable=False)

    tratamientos       = relationship("CatTratamientos",   back_populates="enfermedad")
    tutor_enfermedades = relationship("TutorEnfermedades", back_populates="enfermedad")
    nna_enfermedades   = relationship("NNAEnfermedades",   back_populates="enfermedad")


class CatTratamientos(Base):
    __tablename__ = "cat_tratamientos"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    nombre        = Column(String, nullable=False)
    descripcion   = Column(Text)
    enfermedad_id = Column(Integer, ForeignKey("cat_enfermedades.id"))

    enfermedad         = relationship("CatEnfermedades",    back_populates="tratamientos")
    tutor_enfermedades = relationship("TutorEnfermedades",  back_populates="tratamiento")
    nna_enfermedades   = relationship("NNAEnfermedades",    back_populates="tratamiento")


class CatDiscapacidades(Base):
    __tablename__ = "cat_discapacidades"

    id     = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String, nullable=False)

    nna_discapacidades = relationship("NNADiscapacidades", back_populates="discapacidad")


# =============================================================
# CATÁLOGOS DE ACTORES
# =============================================================

class CatTipoActor(Base):
    __tablename__ = "cat_tipo_actor"
    __table_args__ = (UniqueConstraint("nom_tipo", name="uq_cat_tipo_actor_nom_tipo"),)

    id          = Column(Integer, primary_key=True, autoincrement=True)
    nom_tipo    = Column(String, nullable=False)
    es_publica  = Column(Boolean, default=False)
    descripcion = Column(String)

    actores = relationship("ActoresDerechos", back_populates="tipo_actor")


class CatCategoriaServicio(Base):
    __tablename__ = "cat_categoria_servicio"
    __table_args__ = (UniqueConstraint("nom_categoria", name="uq_cat_categoria_servicio_nom_categoria"),)

    id_cat_serv   = Column(Integer, primary_key=True, autoincrement=True)
    nom_categoria = Column(String, nullable=False)
    descripcion   = Column(String)

    servicios = relationship("ServiciosActores", back_populates="categoria")


# =============================================================
# CATÁLOGO DERECHOS LGDNNA
# =============================================================

class CatDerechoLgdnna(Base):
    __tablename__ = "cat_derecho_lgdnna"
    __table_args__ = (
        UniqueConstraint("fraccion_art13", name="uq_cat_derecho_lgdnna_fraccion_art13"),
        UniqueConstraint("nom_derecho",    name="uq_cat_derecho_lgdnna_nom_derecho"),
    )

    id_derecho      = Column(Integer, primary_key=True, autoincrement=True)
    fraccion_art13  = Column(String(5), nullable=False)
    nom_derecho     = Column(String, nullable=False)
    capitulo_lgdnna = Column(String)
    articulo_ref    = Column(String)
    descripcion     = Column(Text)

    derechos_vulnerados = relationship("DerechosVulnerados", back_populates="derecho")
    servicio_derecho    = relationship("ServicioDerecho",    back_populates="derecho")


# =============================================================
# CATÁLOGO TIPO TUTELA
# =============================================================

class CatTipoTutela(Base):
    __tablename__ = "cat_tipo_tutela"
    __table_args__ = (UniqueConstraint("descripcion", name="uq_cat_tipo_tutela_descripcion"),)

    id                           = Column(Integer, primary_key=True, autoincrement=True)
    descripcion                  = Column(String, nullable=False)
    requiere_resolucion_judicial = Column(Boolean, default=False)

    tutores = relationship("Tutores", back_populates="tipo_tutela")


# =============================================================
# DIRECCIONES
# =============================================================

class Direcciones(Base):
    __tablename__ = "direcciones"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    calle                = Column(String)
    no_exterior          = Column(String)
    no_interior          = Column(String)
    colonia_id           = Column(Integer, ForeignKey("cat_colonias.id"))
    tipo_lugar_id        = Column(Integer, ForeignKey("cat_tipo_lugar.id"))
    pueblo_comunidad     = Column(String)
    referencia_ubicacion = Column(Text)

    colonia    = relationship("CatColonias",  back_populates="direcciones")
    tipo_lugar = relationship("CatTipoLugar", back_populates="direcciones")


# =============================================================
# CONTACTOS
# =============================================================

class Contactos(Base):
    __tablename__ = "contactos"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    tel_principal      = Column(String(15))
    tel_secundario     = Column(String(15))
    correo             = Column(String(150))
    pagina_web         = Column(String(255))
    red_social_id      = Column(Integer, ForeignKey("cat_plataforma_red_social.id"))
    red_social_usuario = Column(String(100))
    tutor_id           = Column(Integer, ForeignKey("tutores.id"))
    actor_id           = Column(Integer, ForeignKey("actores_derechos.id"))
    enlace_id          = Column(Integer, ForeignKey("actor_enlace.id_enlace"))
    es_principal       = Column(Boolean, default=False)
    observaciones      = Column(String)

    red_social = relationship("CatPlataformaRedSocial", back_populates="contactos")
    tutor      = relationship("Tutores",                back_populates="contactos")
    actor      = relationship("ActoresDerechos",        back_populates="contactos")
    enlace     = relationship("ActorEnlace",            back_populates="contactos")


# =============================================================
# USUARIOS
# =============================================================

class Usuarios(Base):
    __tablename__ = "usuarios"
    __table_args__ = (
        UniqueConstraint("curp",   name="uq_usuarios_curp"),
        UniqueConstraint("rfc",    name="uq_usuarios_rfc"),
        UniqueConstraint("correo", name="uq_usuarios_correo"),
    )

    id               = Column(Integer, primary_key=True, autoincrement=True)
    nombre           = Column(String, nullable=False)
    primer_apellido  = Column(String, nullable=False)
    segundo_apellido = Column(String, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    sexo             = Column(String)
    curp             = Column(String(18), nullable=False)
    rfc              = Column(String(13), nullable=False)
    correo           = Column(String(100), nullable=False)
    password_hash    = Column(String(255), nullable=False)
    tipo_personal    = Column(Boolean)
    activo           = Column(Boolean, default=True)
    fecha_registro   = Column(DateTime, server_default=func.now())
    direccion_id     = Column(Integer, ForeignKey("direcciones.id"))
    rol_id           = Column(Integer, ForeignKey("cat_roles.id"))

    rol                  = relationship("CatRoles",                back_populates="usuarios")
    integrantes_equipo   = relationship("IntegrantesEquipo",       back_populates="usuario")
    valoraciones         = relationship("Valoraciones",            back_populates="especialista")
    derechos_vulnerados  = relationship("DerechosVulnerados",      back_populates="creado_por_usuario")
    nna_creados          = relationship("NNA",                     back_populates="creado_por_usuario")


# =============================================================
# EQUIPOS MULTIDISCIPLINARIOS
# =============================================================

class EquiposMultidisciplinarios(Base):
    __tablename__ = "equipos_multidisciplinarios"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    nombre_equipo  = Column(String, nullable=False)
    activo         = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    integrantes = relationship("IntegrantesEquipo", back_populates="equipo")
    nna         = relationship("NNA",               back_populates="equipo_asignado")


# =============================================================
# TUTORES
# =============================================================

class Tutores(Base):
    __tablename__ = "tutores"
    __table_args__ = (UniqueConstraint("curp", name="uq_tutores_curp"),)

    id                      = Column(Integer, primary_key=True, autoincrement=True)
    nombre                  = Column(String, nullable=False)
    primer_apellido         = Column(String, nullable=False)
    segundo_apellido        = Column(String, nullable=False)
    fecha_nacimiento        = Column(Date, nullable=False)
    sexo                    = Column(String)
    curp                    = Column(String(18))
    nacionalidad_id         = Column(Integer, ForeignKey("cat_nacionalidades.id"))
    municipio_nacimiento_id = Column(Integer, ForeignKey("cat_municipios.id"))
    escolaridad             = Column(String)
    ocupacion               = Column(String)
    es_tutor_legal          = Column(Boolean, default=False)
    tipo_tutela_id          = Column(Integer, ForeignKey("cat_tipo_tutela.id"))
    resolucion_tutela       = Column(String)
    fecha_inicio_tutela     = Column(Date)
    direccion_id            = Column(Integer, ForeignKey("direcciones.id"))

    nacionalidad         = relationship("CatNacionalidades", back_populates="tutores")
    municipio_nacimiento = relationship("CatMunicipios")
    tipo_tutela          = relationship("CatTipoTutela",     back_populates="tutores")
    nna_tutores          = relationship("NNATutores",        back_populates="tutor")
    enfermedades         = relationship("TutorEnfermedades", back_populates="tutor")
    idiomas              = relationship("TutorIdiomas",      back_populates="tutor")
    contactos            = relationship("Contactos",         back_populates="tutor")


# =============================================================
# NNA
# =============================================================

class NNA(Base):
    __tablename__ = "nna"
    __table_args__ = (UniqueConstraint("curp", name="uq_nna_curp"),)

    id                      = Column(Integer, primary_key=True, autoincrement=True)
    nombre                  = Column(String, nullable=False)
    primer_apellido         = Column(String, nullable=False)
    segundo_apellido        = Column(String, nullable=False)
    fecha_nacimiento        = Column(Date, nullable=False)
    sexo                    = Column(String)
    curp                    = Column(String(18))
    nacionalidad_id         = Column(Integer, ForeignKey("cat_nacionalidades.id"))
    municipio_nacimiento_id = Column(Integer, ForeignKey("cat_municipios.id"))
    es_migrante             = Column(Boolean, default=False)
    creado_por              = Column(Integer, ForeignKey("usuarios.id"))
    activo                  = Column(Boolean, default=True)
    fecha_registro          = Column(DateTime, server_default=func.now())
    grado_escolar_id      = Column(Integer, ForeignKey("cat_grado_escolar.id"))
    direccion_id            = Column(Integer, ForeignKey("direcciones.id"))
    equipo_asignado_id      = Column(Integer, ForeignKey("equipos_multidisciplinarios.id"))

    nacionalidad         = relationship("CatNacionalidades",        back_populates="nna")
    municipio_nacimiento = relationship("CatMunicipios")
    creado_por_usuario   = relationship("Usuarios",                 back_populates="nna_creados")
    grado_escolar      = relationship("CatGradoEscolar",        back_populates="nna")
    equipo_asignado      = relationship("EquiposMultidisciplinarios", back_populates="nna")
    tutores              = relationship("NNATutores",               back_populates="nna")
    enfermedades         = relationship("NNAEnfermedades",          back_populates="nna")
    discapacidades       = relationship("NNADiscapacidades",        back_populates="nna")
    idiomas              = relationship("NNAIdiomas",               back_populates="nna")
    victima_directa      = relationship("VictimaDirecta",           back_populates="nna", uselist=False)
    expedientes          = relationship("Expedientes",              back_populates="nna")
    hechos_victimales    = relationship("HechosVictimales",         back_populates="nna")


# =============================================================
# VÍCTIMA DIRECTA
# =============================================================

class VictimaDirecta(Base):
    __tablename__ = "victima_directa"
    __table_args__ = (UniqueConstraint("curp", name="uq_victima_directa_curp"),)

    id                       = Column(Integer, primary_key=True, autoincrement=True)
    nombre                   = Column(String, nullable=False)
    primer_apellido          = Column(String, nullable=False)
    segundo_apellido         = Column(String)
    curp                     = Column(String(18))
    fecha_nacimiento         = Column(Date)
    fecha_fallecimiento      = Column(Date)
    modalidad_feminicidio    = Column(String)
    causa_certificada_muerte = Column(Text)
    descripcion_hecho        = Column(Text)
    nna_id                   = Column(Integer, ForeignKey("nna.id"))

    nna = relationship("NNA", back_populates="victima_directa")


# =============================================================
# ACTORES EN MATERIA DE DERECHOS
# =============================================================

class ActoresDerechos(Base):
    __tablename__ = "actores_derechos"

    id                     = Column(Integer, primary_key=True, autoincrement=True)
    nombre                 = Column(String, nullable=False)
    tipo_actor_id          = Column(Integer, ForeignKey("cat_tipo_actor.id"))
    tiene_registro_oficial = Column(Boolean, default=False)
    registro_oficial_num   = Column(String)
    horario_atencion       = Column(String)
    responsable_contacto   = Column(String)
    observaciones          = Column(Text)
    activo                 = Column(Boolean, default=True)
    fecha_registro         = Column(DateTime, server_default=func.now())
    direccion_id           = Column(Integer, ForeignKey("direcciones.id"))

    tipo_actor     = relationship("CatTipoActor",      back_populates="actores")
    persona_fisica = relationship("ActorPersonaFisica", back_populates="actor", uselist=False)
    enlaces        = relationship("ActorEnlace",        back_populates="actor")
    programas      = relationship("ActorPrograma",      back_populates="actor")
    servicios      = relationship("ServiciosActores",   back_populates="actor")
    contactos      = relationship("Contactos",          back_populates="actor")

    direccion_id = Column(Integer, ForeignKey("direcciones.id"), nullable=True)
    direccion = relationship("Direcciones", lazy="select", foreign_keys=[direccion_id])


class ActorPersonaFisica(Base):
    __tablename__ = "actor_persona_fisica"
    __table_args__ = (UniqueConstraint("curp", name="uq_actor_persona_fisica_curp"),)

    id_actor              = Column(Integer, ForeignKey("actores_derechos.id"), primary_key=True)
    curp                  = Column(String(18))
    rfc                   = Column(String(13))
    fecha_nacimiento      = Column(Date)
    sexo                  = Column(String)
    municipio_id          = Column(Integer, ForeignKey("cat_municipios.id"))
    escolaridad           = Column(String)
    ocupacion_oficio      = Column(String)
    descripcion_actividad = Column(Text)
    zona_geografica       = Column(String)
    disponibilidad        = Column(String)
    es_lider_comunitario  = Column(Boolean, default=False)
    es_lider_religioso    = Column(Boolean, default=False)
    pertenece_grupo       = Column(String)
    como_contactar        = Column(Text)

    actor      = relationship("ActoresDerechos", back_populates="persona_fisica")
    municipio  = relationship("CatMunicipios")


class ActorEnlace(Base):
    __tablename__ = "actor_enlace"

    id_enlace             = Column(Integer, primary_key=True, autoincrement=True)
    actor_id              = Column(Integer, ForeignKey("actores_derechos.id"))
    nom_enlace            = Column(String, nullable=False)
    cargo_enlace          = Column(String)
    es_principal_contacto = Column(Boolean, default=False)
    notas_enlace          = Column(Text)

    actor     = relationship("ActoresDerechos", back_populates="enlaces")
    contactos = relationship("Contactos",       back_populates="enlace")


class ActorPrograma(Base):
    __tablename__ = "actor_programa"

    id_programa     = Column(Integer, primary_key=True, autoincrement=True)
    actor_id        = Column(Integer, ForeignKey("actores_derechos.id"))
    nom_programa    = Column(String, nullable=False)
    descripcion     = Column(Text)
    fecha_inicio    = Column(Date)
    fecha_fin       = Column(Date)
    activo_programa = Column(Boolean, default=True)

    actor     = relationship("ActoresDerechos",  back_populates="programas")
    servicios = relationship("ServiciosActores", back_populates="programa")


class ServiciosActores(Base):
    __tablename__ = "servicios_actores"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    actor_id             = Column(Integer, ForeignKey("actores_derechos.id"))
    programa_id          = Column(Integer, ForeignKey("actor_programa.id_programa"))
    categoria_id         = Column(Integer, ForeignKey("cat_categoria_servicio.id_cat_serv"))
    nombre_servicio      = Column(String, nullable=False)
    descripcion_servicio = Column(Text)
    modalidad            = Column(String)
    es_gratuito          = Column(Boolean, default=True)
    costo                = Column(Numeric)
    duracion             = Column(String)
    disponibilidad       = Column(String)
    requisitos_tramites  = Column(Text)
    poblacion_objetivo   = Column(String)
    cupos_disponibles    = Column(Integer)
    activo_servicio      = Column(Boolean, default=True)

    actor     = relationship("ActoresDerechos",     back_populates="servicios")
    programa  = relationship("ActorPrograma",       back_populates="servicios")
    categoria = relationship("CatCategoriaServicio", back_populates="servicios")
    derechos  = relationship("ServicioDerecho",     back_populates="servicio")
    vinculaciones = relationship("ExpedienteVinculacionServicios", back_populates="servicio_actor")


# =============================================================
# EXPEDIENTES
# =============================================================

class HechosVictimales(Base):
    __tablename__ = "hechos_victimales"

    id                     = Column(Integer, primary_key=True, autoincrement=True)
    nna_id                 = Column(Integer, ForeignKey("nna.id"))
    nombre_victima_directa = Column(String)
    fecha_hecho            = Column(Date)
    descripcion_delito     = Column(Text)

    nna = relationship("NNA", back_populates="hechos_victimales")


class Expedientes(Base):
    __tablename__ = "expedientes"
    __table_args__ = (UniqueConstraint("folio_fud", name="uq_expedientes_folio_fud"),)

    id              = Column(Integer, primary_key=True, autoincrement=True)
    folio_fud       = Column(String)
    nna_id          = Column(Integer, ForeignKey("nna.id"))
    estatus_proceso = Column(String, default="Detección")

    nna                  = relationship("NNA",                          back_populates="expedientes")
    valoraciones         = relationship("Valoraciones",                 back_populates="expediente")
    derechos_vulnerados  = relationship("DerechosVulnerados",           back_populates="expediente")
    vinculacion_servicios = relationship("ExpedienteVinculacionServicios", back_populates="expediente")


class Valoraciones(Base):
    __tablename__ = "valoraciones"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    expediente_id      = Column(Integer, ForeignKey("expedientes.id"))
    especialista_id    = Column(Integer, ForeignKey("usuarios.id"))
    area_evaluacion    = Column(String, nullable=False)
    hallazgos_dictamen = Column(Text, nullable=False)
    medidas_sugeridas  = Column(Text)
    fecha_valoracion   = Column(DateTime, server_default=func.now())

    expediente  = relationship("Expedientes", back_populates="valoraciones")
    especialista = relationship("Usuarios",   back_populates="valoraciones")


class DerechosVulnerados(Base):
    __tablename__ = "derechos_vulnerados"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    expediente_id  = Column(Integer, ForeignKey("expedientes.id"))
    derecho_id     = Column(Integer, ForeignKey("cat_derecho_lgdnna.id_derecho"))
    esta_vulnerado = Column(Boolean, default=False)
    observaciones  = Column(Text)
    creado_por     = Column(Integer, ForeignKey("usuarios.id"))
    fecha_registro = Column(DateTime, server_default=func.now())

    expediente          = relationship("Expedientes",      back_populates="derechos_vulnerados")
    derecho             = relationship("CatDerechoLgdnna", back_populates="derechos_vulnerados")
    creado_por_usuario  = relationship("Usuarios",         back_populates="derechos_vulnerados")


# =============================================================
# TABLAS DE RELACIÓN
# =============================================================

class NNATutores(Base):
    __tablename__ = "nna_tutores"

    id            = Column(Integer, primary_key=True, autoincrement=True)
    nna_id        = Column(Integer, ForeignKey("nna.id"))
    tutor_id      = Column(Integer, ForeignKey("tutores.id"))
    parentesco    = Column(String, nullable=False)
    es_principal  = Column(Boolean, default=False)
    fecha_inicio  = Column(Date)
    fecha_fin     = Column(Date)
    observaciones = Column(Text)

    nna   = relationship("NNA",     back_populates="tutores")
    tutor = relationship("Tutores", back_populates="nna_tutores")


class IntegrantesEquipo(Base):
    __tablename__ = "integrantes_equipo"

    id                 = Column(Integer, primary_key=True, autoincrement=True)
    equipo_id          = Column(Integer, ForeignKey("equipos_multidisciplinarios.id"))
    usuario_id         = Column(Integer, ForeignKey("usuarios.id"))
    fecha_ingreso      = Column(DateTime, server_default=func.now())
    fecha_salida       = Column(DateTime)
    motivo_cambio      = Column(Text)
    estatus_integrante = Column(String, default="Activo")

    equipo   = relationship("EquiposMultidisciplinarios", back_populates="integrantes")
    usuario  = relationship("Usuarios",                   back_populates="integrantes_equipo")


class TutorEnfermedades(Base):
    __tablename__ = "tutor_enfermedades"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    tutor_id             = Column(Integer, ForeignKey("tutores.id"))
    enfermedad_id        = Column(Integer, ForeignKey("cat_enfermedades.id"))
    tratamiento_id       = Column(Integer, ForeignKey("cat_tratamientos.id"))
    es_cronica           = Column(Boolean, default=False)
    esta_controlada      = Column(Boolean, default=False)
    requiere_medicamento = Column(Boolean, default=False)
    nombre_medicamento   = Column(String)
    observaciones        = Column(Text)

    tutor       = relationship("Tutores",          back_populates="enfermedades")
    enfermedad  = relationship("CatEnfermedades",  back_populates="tutor_enfermedades")
    tratamiento = relationship("CatTratamientos",  back_populates="tutor_enfermedades")


class TutorIdiomas(Base):
    __tablename__ = "tutor_idiomas"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    tutor_id             = Column(Integer, ForeignKey("tutores.id"))
    idioma_id            = Column(Integer, ForeignKey("cat_idiomas.id"))
    nivel_habla_id       = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    nivel_comprension_id = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    nivel_escritura_id   = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    requiere_traductor   = Column(Boolean, default=False)

    tutor  = relationship("Tutores",    back_populates="idiomas")
    idioma = relationship("CatIdiomas", back_populates="tutor_idiomas")


class NNAEnfermedades(Base):
    __tablename__ = "nna_enfermedades"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    nna_id               = Column(Integer, ForeignKey("nna.id"))
    enfermedad_id        = Column(Integer, ForeignKey("cat_enfermedades.id"))
    tratamiento_id       = Column(Integer, ForeignKey("cat_tratamientos.id"))
    es_cronica           = Column(Boolean, default=False)
    esta_controlada      = Column(Boolean, default=False)
    requiere_medicamento = Column(Boolean, default=False)
    nombre_medicamento   = Column(String)
    observaciones        = Column(Text)

    nna         = relationship("NNA",             back_populates="enfermedades")
    enfermedad  = relationship("CatEnfermedades", back_populates="nna_enfermedades")
    tratamiento = relationship("CatTratamientos", back_populates="nna_enfermedades")


class NNADiscapacidades(Base):
    __tablename__ = "nna_discapacidades"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    nna_id            = Column(Integer, ForeignKey("nna.id"))
    discapacidad_id   = Column(Integer, ForeignKey("cat_discapacidades.id"))
    tipo_discapacidad = Column(String)
    grado_dependencia = Column(String)
    observaciones     = Column(Text)

    nna          = relationship("NNA",              back_populates="discapacidades")
    discapacidad = relationship("CatDiscapacidades", back_populates="nna_discapacidades")


class NNAIdiomas(Base):
    __tablename__ = "nna_idiomas"

    id                   = Column(Integer, primary_key=True, autoincrement=True)
    nna_id               = Column(Integer, ForeignKey("nna.id"))
    idioma_id            = Column(Integer, ForeignKey("cat_idiomas.id"))
    nivel_habla_id       = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    nivel_comprension_id = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    nivel_escritura_id   = Column(Integer, ForeignKey("cat_nivel_idioma.id"))
    requiere_traductor   = Column(Boolean, default=False)

    nna    = relationship("NNA",        back_populates="idiomas")
    idioma = relationship("CatIdiomas", back_populates="nna_idiomas")


class ServicioDerecho(Base):
    __tablename__ = "servicio_derecho"

    servicio_id = Column(Integer, ForeignKey("servicios_actores.id"), primary_key=True)
    derecho_id  = Column(Integer, ForeignKey("cat_derecho_lgdnna.id_derecho"), primary_key=True)

    servicio = relationship("ServiciosActores",  back_populates="derechos")
    derecho  = relationship("CatDerechoLgdnna",  back_populates="servicio_derecho")


class ExpedienteVinculacionServicios(Base):
    __tablename__ = "expediente_vinculacion_servicios"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    expediente_id     = Column(Integer, ForeignKey("expedientes.id"))
    servicio_actor_id = Column(Integer, ForeignKey("servicios_actores.id"))
    fecha_vinculacion = Column(DateTime, server_default=func.now())

    expediente     = relationship("Expedientes",      back_populates="vinculacion_servicios")
    servicio_actor = relationship("ServiciosActores", back_populates="vinculaciones")