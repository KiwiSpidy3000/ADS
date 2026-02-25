from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class PersonalCreate(BaseModel):
    Nombre: str
    Ap_Paterno: str
    Ap_Materno: str
    CURP: str
    RFC: str
    Edad: date
    Tipo_empleado: str
    Rol: str
    correo: EmailStr
    password: str
    alta: int

class PersonalResponse(PersonalCreate):

    class Config:
        from_attributes = True


#Clase para hacer las updates del persona opcional de todos los campos
class PersonalUpdate(BaseModel):
    Nombre: Optional[str] = None
    Ap_Paterno: Optional[str] = None
    Ap_Materno: Optional[str] = None
    CURP: Optional[str] = None
    RFC: Optional[str] = None
    Edad: Optional[date] = None
    Tipo_empleado: Optional[str] = None
    Rol: Optional[str] = None
    correo: Optional[EmailStr] = None
    password: Optional[str] = None
    alta: Optional[int] = None


class PersonalOut(BaseModel):
    id: int
    Nombre: str
    Ap_Paterno: str
    Ap_Materno: str
    CURP: str
    RFC: str
    Edad: date
    Tipo_empleado: str
    Rol: str
    correo: EmailStr
    alta: int

    class Config:
        from_attributes = True