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


    class Config:
        from_attributes = True