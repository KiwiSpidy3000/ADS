from pydantic import BaseModel, EmailStr
from datetime import date

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


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    correo: EmailStr
    activo: bool

    class Config:
        from_attributes = True