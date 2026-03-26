from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

from database import AsyncSessionLocal
from models import NNA, DireccionNNA

router = APIRouter(prefix="/nnas", tags=["NNAs"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ============================================================
# SCHEMAS
# ============================================================

class DireccionNNACreate(BaseModel):
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    pueblo_comunidad: Optional[str] = None
    vivienda_nna_id: Optional[int] = None


class NNACreate(BaseModel):
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    fecha_nacimiento: date
    sexo: Optional[str] = None
    curp: Optional[str] = None
    nacionalidad: Optional[str] = "Mexicana"
    es_migrante: Optional[bool] = False
    creado_por: Optional[int] = None
    estatus_escolar_id: Optional[int] = None
    tutor_id: Optional[int] = None
    equipo_asignado_id: Optional[int] = None
    # Dirección
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    pueblo_comunidad: Optional[str] = None
    vivienda_nna_id: Optional[int] = None


class NNAUpdate(BaseModel):
    nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    sexo: Optional[str] = None
    curp: Optional[str] = None
    nacionalidad: Optional[str] = None
    es_migrante: Optional[bool] = None
    activo: Optional[bool] = None
    estatus_escolar_id: Optional[int] = None
    tutor_id: Optional[int] = None
    equipo_asignado_id: Optional[int] = None
    # Dirección
    calle: Optional[str] = None
    num_exterior: Optional[str] = None
    num_interior: Optional[str] = None
    colonia_id: Optional[int] = None
    pueblo_comunidad: Optional[str] = None
    vivienda_nna_id: Optional[int] = None


# ── Response schemas ─────────────────────────────────────────

class ColoniaSimple(BaseModel):
    id: int
    nombre: str
    codigo_postal: str
    class Config:
        from_attributes = True

class ViviendaNNASimple(BaseModel):
    id: int
    descripcion: Optional[str]
    class Config:
        from_attributes = True

class DireccionNNAResponse(BaseModel):
    id: int
    calle: Optional[str]
    num_exterior: Optional[str]
    num_interior: Optional[str]
    pueblo_comunidad: Optional[str]
    colonia_id: Optional[int]
    vivienda_nna_id: Optional[int]
    colonia: Optional[ColoniaSimple] = None
    vivienda_nna: Optional[ViviendaNNASimple] = None
    class Config:
        from_attributes = True

class EstatusEscolarSimple(BaseModel):
    id: int
    descripcion: str
    class Config:
        from_attributes = True

class TutorSimple(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    class Config:
        from_attributes = True

class EquipoSimple(BaseModel):
    id: int
    nombre_equipo: str
    class Config:
        from_attributes = True

class NNAResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    fecha_nacimiento: date
    sexo: Optional[str]
    curp: Optional[str]
    nacionalidad: Optional[str]
    es_migrante: bool
    activo: bool
    fecha_registro: datetime
    creado_por: Optional[int]
    estatus_escolar_id: Optional[int]
    tutor_id: Optional[int]
    direccion_id: Optional[int]
    equipo_asignado_id: Optional[int]
    # Relaciones anidadas
    estatus_escolar: Optional[EstatusEscolarSimple] = None
    tutor: Optional[TutorSimple] = None
    direccion: Optional[DireccionNNAResponse] = None
    equipo_asignado: Optional[EquipoSimple] = None
    class Config:
        from_attributes = True


# ── Carga de relaciones reutilizable ─────────────────────────
def _opciones_carga():
    return [
        selectinload(NNA.estatus_escolar),
        selectinload(NNA.tutor),
        selectinload(NNA.equipo_asignado),
        selectinload(NNA.direccion).selectinload(DireccionNNA.colonia),
        selectinload(NNA.direccion).selectinload(DireccionNNA.vivienda_nna),
    ]


# ============================================================
# ENDPOINTS
# ============================================================

# ── Consultar todos ──────────────────────────────────────────
@router.get("/", response_model=list[NNAResponse])
async def consultar_nnas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NNA).options(*_opciones_carga()).order_by(NNA.id)
    )
    return result.scalars().all()


# ── Consultar por ID ─────────────────────────────────────────
@router.get("/{nna_id}", response_model=NNAResponse)
async def consultar_nna(nna_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NNA).options(*_opciones_carga()).where(NNA.id == nna_id)
    )
    nna = result.scalar_one_or_none()
    if not nna:
        raise HTTPException(status_code=404, detail="NNA no encontrado")
    return nna


# ── Registrar ────────────────────────────────────────────────
@router.post("/", response_model=NNAResponse)
async def registrar_nna(datos: NNACreate, db: AsyncSession = Depends(get_db)):

    # Verificar CURP duplicado si se proporcionó
    if datos.curp:
        result = await db.execute(select(NNA).where(NNA.curp == datos.curp))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un NNA con esa CURP")

    # Crear dirección
    nueva_direccion = DireccionNNA(
        calle=datos.calle,
        num_exterior=datos.num_exterior,
        num_interior=datos.num_interior,
        colonia_id=datos.colonia_id,
        pueblo_comunidad=datos.pueblo_comunidad,
        vivienda_nna_id=datos.vivienda_nna_id,
    )
    db.add(nueva_direccion)
    await db.flush()

    # Crear NNA
    nuevo_nna = NNA(
        nombre=datos.nombre,
        primer_apellido=datos.primer_apellido,
        segundo_apellido=datos.segundo_apellido,
        fecha_nacimiento=datos.fecha_nacimiento,
        sexo=datos.sexo,
        curp=datos.curp,
        nacionalidad=datos.nacionalidad,
        es_migrante=datos.es_migrante,
        creado_por=datos.creado_por,
        estatus_escolar_id=datos.estatus_escolar_id,
        tutor_id=datos.tutor_id,
        equipo_asignado_id=datos.equipo_asignado_id,
        direccion_id=nueva_direccion.id,
    )
    db.add(nuevo_nna)
    await db.commit()
    await db.refresh(nuevo_nna)

    # Retornar con relaciones cargadas
    result = await db.execute(
        select(NNA).options(*_opciones_carga()).where(NNA.id == nuevo_nna.id)
    )
    return result.scalar_one()


# ── Modificar ────────────────────────────────────────────────
@router.patch("/{nna_id}", response_model=NNAResponse)
async def modificar_nna(
    nna_id: int,
    datos: NNAUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(NNA).options(*_opciones_carga()).where(NNA.id == nna_id)
    )
    nna = result.scalar_one_or_none()
    if not nna:
        raise HTTPException(status_code=404, detail="NNA no encontrado")

    # Verificar CURP duplicado si se está cambiando
    if datos.curp and datos.curp != nna.curp:
        dup = await db.execute(select(NNA).where(NNA.curp == datos.curp))
        if dup.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Ya existe un NNA con esa CURP")

    # Actualizar campos del NNA
    campos_nna = [
        "nombre", "primer_apellido", "segundo_apellido", "fecha_nacimiento",
        "sexo", "curp", "nacionalidad", "es_migrante", "activo",
        "estatus_escolar_id", "tutor_id", "equipo_asignado_id",
    ]
    for campo in campos_nna:
        valor = getattr(datos, campo)
        if valor is not None:
            setattr(nna, campo, valor)

    # Actualizar dirección si se enviaron campos de dirección
    campos_dir = ["calle", "num_exterior", "num_interior",
                  "colonia_id", "pueblo_comunidad", "vivienda_nna_id"]
    datos_dir = {c: getattr(datos, c) for c in campos_dir if getattr(datos, c) is not None}

    if datos_dir:
        if nna.direccion_id:
            # Actualizar dirección existente
            dir_result = await db.execute(
                select(DireccionNNA).where(DireccionNNA.id == nna.direccion_id)
            )
            direccion = dir_result.scalar_one_or_none()
            if direccion:
                for campo, valor in datos_dir.items():
                    setattr(direccion, campo, valor)
        else:
            # Crear nueva dirección si no tenía
            nueva_direccion = DireccionNNA(**datos_dir)
            db.add(nueva_direccion)
            await db.flush()
            nna.direccion_id = nueva_direccion.id

    await db.commit()

    result = await db.execute(
        select(NNA).options(*_opciones_carga()).where(NNA.id == nna_id)
    )
    return result.scalar_one()


@router.delete("/{nna_id}")
async def eliminar_nna(
    nna_id: int,
    db: AsyncSession = Depends(get_db)
):
    
    
    res = await db.execute(
        select(NNA).where(NNA.id == nna_id)
    )
    nna = res.scalar_one_or_none()

    if not nna:
        raise HTTPException(status_code=404, detail="NNA no encontrado")

    # ELIMINACIÓN FÍSICA
    await db.delete(nna)
    await db.commit()

    return {"mensaje": "NNA eliminado correctamente"}