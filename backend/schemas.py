from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class UsuarioCreate(BaseModel):
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    curp: str
    rfc: str
    fecha_nacimiento: date
    correo: EmailStr
    password: str
    calle : str
    num_exterior : str 
    num_interior : str 
    colonia : str 
    codigo_postal : str 
    municipio_alcaldia : str 
    rol_id: int
    estado_id: int
    tipo_vivienda_id: int


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


# ---- Usuario ----

class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    curp: str
    rfc: str
    fecha_nacimiento: date
    correo: EmailStr
    calle : str
    num_exterior : str 
    num_interior : str 
    colonia : str 
    codigo_postal : str 
    municipio_alcaldia : str 
    rol_id: int
    estado_id: int
    tipo_vivienda_id: int
    rol: Optional[RolResponse]
    estado: Optional[EstadoResponse]
    tipo_vivienda: Optional[TipoViviendaResponse]
    activo: Optional[bool] 

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

    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia: Optional[str] = None
    codigo_postal: Optional[str] = None
    municipio_alcaldia: Optional[str] = None

    rol_id: Optional[int] = None
    estado_id: Optional[int] = None
    tipo_vivienda_id: Optional[int] = None
    activo: Optional[bool] = None