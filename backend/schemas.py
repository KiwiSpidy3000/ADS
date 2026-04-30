
from __future__ import annotations
from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


# ============================================================
# Catálogos geográficos
# ============================================================

class EstadoResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class MunicipioResponse(BaseModel):
    id: int
    nombre: str
    estado_id: Optional[int] = None

    class Config:
        from_attributes = True


class ColoniaResponse(BaseModel):
    id: int
    nombre: str
    codigo_postal: str
    municipio_id: Optional[int] = None

    class Config:
        from_attributes = True


# ============================================================
# Catálogos generales
# ============================================================

class RolResponse(BaseModel):
    id: int
    nombre_rol: str

    class Config:
        from_attributes = True


class TipoViviendaResponse(BaseModel):
    id: int
    descripcion: str

    class Config:
        from_attributes = True


# ============================================================
# Dirección
# ============================================================

class DireccionUsuarioResponse(BaseModel):
    id: int
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None

    # Relaciones anidadas
    colonia: Optional[ColoniaResponse] = None
    tipo_vivienda: Optional[TipoViviendaResponse] = None

    class Config:
        from_attributes = True


class DireccionUsuarioCreate(BaseModel):
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None


class DireccionUsuarioUpdate(BaseModel):
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None


# ============================================================
# Usuario
# ============================================================

class UsuarioCreate(BaseModel):
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    curp: str
    rfc: str
    fecha_nacimiento: date
    correo: EmailStr
    password: str
    rol_id: int
    sexo: Optional[str] = None   
    activo: bool
    tipo_personal: bool    

    # Dirección (opcional)
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None        # FK → cat_colonias.id
    tipo_vivienda_id: Optional[int] = None  # FK → cat_tipo_vivienda.id


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    curp: str
    rfc: str
    fecha_nacimiento: date
    correo: EmailStr
    activo: Optional[bool] = None
    fecha_registro: datetime
    tipo_personal: Optional[bool] = None
    sexo: Optional[str] = None       

    # FKs planas
    rol_id: Optional[int] = None
    direccion_id: Optional[int] = None

    # Relaciones anidadas
    rol: Optional[RolResponse] = None
    direccion: Optional[DireccionUsuarioResponse] = None

    class Config:
        from_attributes = True


# ──────────────────────────────────────────
# SCHEMA DE ACTUALIZACIÓN
# ──────────────────────────────────────────
 



class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    curp: Optional[str] = None
    rfc: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None
    rol_id: Optional[int] = None
    tipo_personal: Optional[bool] = None
    activo: Optional[bool] = None

    # Dirección
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None



from datetime import date, datetime
from typing import Literal, Optional, Union

from pydantic import BaseModel, EmailStr, Field, model_validator


# =============================================================
# SUB-SCHEMAS COMPARTIDOS
# =============================================================

class DireccionIn(BaseModel):
    calle:                Optional[str] = None
    no_exterior:          Optional[str] = None
    no_interior:          Optional[str] = None
    colonia_id:           Optional[int] = None
    tipo_lugar_id:        Optional[int] = None
    pueblo_comunidad:     Optional[str] = None
    referencia_ubicacion: Optional[str] = None


class DireccionOut(DireccionIn):
    id: int

    model_config = {"from_attributes": True}


class ContactoIn(BaseModel):
    tel_principal:      Optional[str] = Field(None, max_length=15)
    tel_secundario:     Optional[str] = Field(None, max_length=15)
    correo:             Optional[EmailStr] = None
    pagina_web:         Optional[str] = Field(None, max_length=255)
    red_social_id:      Optional[int] = None
    red_social_usuario: Optional[str] = Field(None, max_length=100)
    enlace_id:          Optional[int] = None
    es_principal:       bool = False
    observaciones:      Optional[str] = None


class ContactoOut(ContactoIn):
    id:       int
    actor_id: Optional[int] = None

    model_config = {"from_attributes": True}


class EnlaceIn(BaseModel):
    nom_enlace:            str
    cargo_enlace:          Optional[str] = None
    es_principal_contacto: bool = False
    notas_enlace:          Optional[str] = None


class EnlaceOut(EnlaceIn):
    id_enlace: int
    actor_id:  int

    model_config = {"from_attributes": True}


class ProgramaIn(BaseModel):
    nom_programa:    str
    descripcion:     Optional[str] = None
    fecha_inicio:    Optional[date] = None
    fecha_fin:       Optional[date] = None
    activo_programa: bool = True


class ProgramaOut(ProgramaIn):
    id_programa: int
    actor_id:    int

    model_config = {"from_attributes": True}


# =============================================================
# DATOS ESPECÍFICOS: PERSONA FÍSICA
# =============================================================

class PersonaFisicaIn(BaseModel):
    curp:                  Optional[str] = Field(None, max_length=18)
    rfc:                   Optional[str] = Field(None, max_length=13)
    fecha_nacimiento:      Optional[date] = None
    sexo:                  Optional[str] = None
    municipio_id:          Optional[int] = None
    escolaridad:           Optional[str] = None
    ocupacion_oficio:      Optional[str] = None
    descripcion_actividad: Optional[str] = None
    zona_geografica:       Optional[str] = None
    disponibilidad:        Optional[str] = None
    es_lider_comunitario:  bool = False
    es_lider_religioso:    bool = False
    pertenece_grupo:       Optional[str] = None
    como_contactar:        Optional[str] = None


class PersonaFisicaOut(PersonaFisicaIn):
    model_config = {"from_attributes": True}


# =============================================================
# PAYLOAD DE CREACIÓN  –  discriminated union por tipo_actor
# =============================================================

class ActorBaseIn(BaseModel):
    """Campos comunes a cualquier actor."""
    nombre:                str
    tipo_actor_id:         int
    tiene_registro_oficial: bool = False
    registro_oficial_num:  Optional[str] = None
    horario_atencion:      Optional[str] = None
    responsable_contacto:  Optional[str] = None
    observaciones:         Optional[str] = None

    # Objetos anidados opcionales
    direccion:  Optional[DireccionIn] = None
    contactos:  list[ContactoIn]      = Field(default_factory=list)
    programas:  list[ProgramaIn]      = Field(default_factory=list)


class ActorPersonaFisicaCreate(ActorBaseIn):
    """
    Payload para registrar un actor de tipo persona física.
    Incluye los datos extra de actor_persona_fisica.
    """
    tipo: Literal["persona_fisica"]
    persona_fisica: PersonaFisicaIn

    # No aplica lista de enlaces para persona física
    enlaces: list[EnlaceIn] = Field(default_factory=list)


class ActorAsociacionCreate(ActorBaseIn):
    """
    Payload para registrar un actor de tipo asociación /
    institución (pública, privada, religiosa, educativa, salud).
    Incluye personas de enlace dentro de la organización.
    """
    tipo: Literal["asociacion"]
    enlaces: list[EnlaceIn] = Field(default_factory=list)


# Union discriminada: FastAPI usa el campo `tipo` para saber cuál validar
ActorCreate = Union[ActorPersonaFisicaCreate, ActorAsociacionCreate]


# =============================================================
# RESPUESTAS
# =============================================================

class ActorBaseOut(BaseModel):
    id:                    int
    nombre:                str
    tipo_actor_id:         int
    tiene_registro_oficial: bool
    registro_oficial_num:  Optional[str]
    horario_atencion:      Optional[str]
    responsable_contacto:  Optional[str]
    observaciones:         Optional[str]
    activo:                bool
    fecha_registro:        datetime
    direccion_id:          Optional[int]

    direccion: Optional[DireccionOut] = None
    contactos: list[ContactoOut]      = []
    programas: list[ProgramaOut]      = []

    model_config = {"from_attributes": True}


class ActorPersonaFisicaOut(ActorBaseOut):
    tipo:          Literal["persona_fisica"] = "persona_fisica"
    persona_fisica: Optional[PersonaFisicaOut] = None
    enlaces:        list[EnlaceOut]            = []


class ActorAsociacionOut(ActorBaseOut):
    tipo:    Literal["asociacion"] = "asociacion"
    enlaces: list[EnlaceOut]       = []


ActorOut = Union[ActorPersonaFisicaOut, ActorAsociacionOut]