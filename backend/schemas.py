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