from sqlalchemy import Column, Integer, String, Date
from database import Base

class Personal(Base):
    __tablename__ = "Personal"

    id = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String(255))
    Ap_Paterno = Column(String(255))
    Ap_Materno = Column(String(255))
    CURP = Column(String(255))
    RFC = Column(String(255))
    Edad = Column(Date)
    Tipo_empleado = Column(String(255))
    Rol = Column(String(255))
    correo = Column(String(255))
    password = Column(String(255))
    alta = Column(Integer)