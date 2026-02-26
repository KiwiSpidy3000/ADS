from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    primer_apellido = Column(String(150), nullable=False)
    segundo_apellido = Column(String(150), nullable=False)
    curp = Column(String(18), unique=True, nullable=False)
    rfc = Column(String(13), unique=True, nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    #Calle
    calle = Column(String(100), nullable=False)
    num_exterior = Column(String(20), nullable=False)
    num_interior = Column(String(20), nullable=False)
    colonia = Column(String(100), nullable=False)
    codigo_postal = Column(String(10), nullable=False)
    municipio_alcaldia = Column(String(100), nullable=False)
    #nuemro exterior

    rol_id = Column(Integer, ForeignKey("roles.id"))
    estado_id = Column(Integer, ForeignKey("cat_estados.id"))
    tipo_vivienda_id = Column(Integer, ForeignKey("cat_tipo_vivienda.id"))

    activo = Column(Boolean, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())
    rol = relationship("Rol")
    estado = relationship("Estado")
    tipo_vivienda = relationship("TipoVivienda")
class Rol(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)


class Estado(Base):
    __tablename__ = "cat_estados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)


class TipoVivienda(Base):
    __tablename__ = "cat_tipo_vivienda"

    id = Column(Integer, primary_key=True, index=True)
    descripcion = Column(String(50), unique=True, nullable=False)