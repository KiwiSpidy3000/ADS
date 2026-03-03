from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base


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


class Colonia(Base):
    __tablename__ = "cat_colonia"

    id = Column(Integer, primary_key=True, index=True)
    nombre_colonia = Column(String(100), unique=True, nullable=False)


class Municipio(Base):
    __tablename__ = "cat_municipio"

    id = Column(Integer, primary_key=True, index=True)
    nombre_municipio = Column(String(100), unique=True, nullable=False)


class CodigoPostal(Base):
    __tablename__ = "cat_codigoPostal"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(10), unique=True, nullable=False)


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

    # Domicilio
    calle = Column(String(100), nullable=True)
    num_exterior = Column(String(20), nullable=True)
    num_interior = Column(String(20), nullable=True)

    # cORREGIDO: FK a catálogos (antes eran String sin relación)
    colonia = Column(Integer, ForeignKey("cat_colonia.id"), nullable=True)
    codigo_postal = Column(Integer, ForeignKey("cat_codigoPostal.id"), nullable=True)
    municipio_alcaldia = Column(Integer, ForeignKey("cat_municipio.id"), nullable=True)

    # Otros FK
    rol_id = Column(Integer, ForeignKey("roles.id"))
    estado_id = Column(Integer, ForeignKey("cat_estados.id"))
    tipo_vivienda_id = Column(Integer, ForeignKey("cat_tipo_vivienda.id"))

    activo = Column(Boolean, default=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # Relaciones
    rol = relationship("Rol")
    estado = relationship("Estado")
    tipo_vivienda = relationship("TipoVivienda")
    cat_colonia = relationship("Colonia")
    cat_municipio = relationship("Municipio")
    cat_codigo_postal = relationship("CodigoPostal")
