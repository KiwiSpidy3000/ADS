from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional


# ============================================================
# Catálogos de dirección
# ============================================================


class ColoniaResponse(BaseModel):
    id: int
    nombre_colonia: str

    class Config:
        from_attributes = True


class MunicipioResponse(BaseModel):
    id: int
    nombre_municipio: str

    class Config:
        from_attributes = True


class CodigoPostalResponse(BaseModel):
    id: int
    numero: str

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


class EstadoResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class TipoViviendaResponse(BaseModel):
    id: int
    descripcion: str

    class Config:
        from_attributes = True


class CatalogoBaseRol(BaseModel):
    id: int
    nombre_rol: str

    class Config:
        from_attributes = True


class CatalogoBaseEstado(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class CatalogoBaseTipoVivienda(BaseModel):
    id: int
    descripcion: str

    class Config:
        from_attributes = True


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

    # Domicilio
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None

    # CORREGIDO: FK enteras a catálogos (antes eran str)
    colonia: Optional[int] = None           # FK → cat_colonia.id
    codigo_postal: Optional[int] = None     # FK → cat_codigoPostal.id
    municipio_alcaldia: Optional[int] = None  # FK → cat_municipio.id

    rol_id: int
    estado_id: int
    tipo_vivienda_id: int


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    curp: str
    rfc: str
    fecha_nacimiento: date
    correo: EmailStr

    # Domicilio
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None

    # CORREGIDO: IDs de FK + objetos de relación anidados
    colonia: Optional[int] = None
    codigo_postal: Optional[int] = None
    municipio_alcaldia: Optional[int] = None

    rol_id: Optional[int] = None
    estado_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None

    # Relaciones anidadas
    rol: Optional[RolResponse] = None
    estado: Optional[EstadoResponse] = None
    tipo_vivienda: Optional[TipoViviendaResponse] = None
    cat_colonia: Optional[ColoniaResponse] = None
    cat_municipio: Optional[MunicipioResponse] = None
    cat_codigo_postal: Optional[CodigoPostalResponse] = None

    activo: Optional[bool] = None
    fecha_registro: datetime

    class Config:
        from_attributes = True


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    curp: Optional[str] = None
    rfc: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None

    # Domicilio
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None

    # CORREGIDO: FK enteras a catálogos (antes eran str)
    colonia: Optional[int] = None           # FK → cat_colonia.id
    codigo_postal: Optional[int] = None     # FK → cat_codigoPostal.id
    municipio_alcaldia: Optional[int] = None  # FK → cat_municipio.id

    rol_id: Optional[int] = None
    estado_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None
    activo: Optional[bool] = None