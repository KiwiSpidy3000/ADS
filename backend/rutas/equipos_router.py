from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

from database import AsyncSessionLocal
from models import EquipoMultidisciplinario, IntegranteEquipo, Usuario

router = APIRouter(prefix="/equipos", tags=["Equipos Multidisciplinarios"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ──────────────────────────────────────────
# SCHEMAS
# ──────────────────────────────────────────

class UsuarioResumenResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    correo: str
    rol_id: Optional[int] = None

    class Config:
        from_attributes = True


class IntegranteResponse(BaseModel):
    id: int
    equipo_id: Optional[int] = None
    usuario_id: Optional[int] = None
    fecha_ingreso: Optional[datetime] = None
    fecha_salida: Optional[datetime] = None
    motivo_cambio: Optional[str] = None
    estatus_integrante: Optional[str] = None
    es_momentaneo: Optional[bool] = None
    usuario: Optional[UsuarioResumenResponse] = None

    class Config:
        from_attributes = True


class EquipoResponse(BaseModel):
    id: int
    nombre_equipo: str
    activo: Optional[bool] = None
    fecha_creacion: Optional[datetime] = None
    integrantes: List[IntegranteResponse] = []

    class Config:
        from_attributes = True


class EquipoUpdate(BaseModel):
    nombre_equipo: str


class EquipoCreate(BaseModel):
    nombre_equipo: str
    activo: Optional[bool] = True


class AgregarIntegranteRequest(BaseModel):
    usuario_id: int
    es_momentaneo: Optional[bool] = False
    estatus_integrante: Optional[str] = "Activo"


# ──────────────────────────────────────────
# HELPER
# ──────────────────────────────────────────
async def _get_equipo_completo(equipo_id: int, db: AsyncSession):
    result = await db.execute(
        select(EquipoMultidisciplinario)
        .options(
            selectinload(EquipoMultidisciplinario.integrantes)
            .selectinload(IntegranteEquipo.usuario)
        )
        .where(EquipoMultidisciplinario.id == equipo_id)
    )

    equipo = result.scalar_one_or_none()

    if not equipo:
        return None

    #FILTRAR SOLO LOS ACTIVOS
    equipo.integrantes = [
        i for i in equipo.integrantes
        if i.fecha_salida is None
    ]

    return equipo

# ──────────────────────────────────────────
# GET / — Todos los equipos
# ──────────────────────────────────────────

@router.get("/usuarios-sin-equipo")
async def usuarios_sin_equipo(db: AsyncSession = Depends(get_db)):

    subquery = select(IntegranteEquipo.usuario_id).where(
        IntegranteEquipo.fecha_salida.is_(None)
    )

    result = await db.execute(
        select(Usuario).where(Usuario.id.not_in(subquery))
    )

    usuarios = result.scalars().all()
    return usuarios


@router.get("/", response_model=List[EquipoResponse])
async def obtener_equipos(db: AsyncSession = Depends(get_db)):
    """Retorna todos los equipos con sus integrantes activos."""

    result = await db.execute(
        select(EquipoMultidisciplinario)
        .options(
            selectinload(EquipoMultidisciplinario.integrantes)
            .selectinload(IntegranteEquipo.usuario)
        )
        .order_by(EquipoMultidisciplinario.fecha_creacion.desc())
    )

    equipos = result.scalars().all()

    #  FILTRAR SOLO INTEGRANTES ACTIVOS
    for equipo in equipos:
        equipo.integrantes = [
            i for i in equipo.integrantes
            if i.fecha_salida is None
        ]

    return equipos

# ──────────────────────────────────────────
# GET /{equipo_id} — Equipo por ID
# ──────────────────────────────────────────

@router.get("/{equipo_id}", response_model=EquipoResponse)
async def obtener_equipo(equipo_id: int, db: AsyncSession = Depends(get_db)):
    """Retorna un equipo por ID con todos sus integrantes."""
    equipo = await _get_equipo_completo(equipo_id, db)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo


# ──────────────────────────────────────────
# POST / — Crear equipo
# ──────────────────────────────────────────

@router.post("/", response_model=EquipoResponse, status_code=201)
async def crear_equipo(
    datos: EquipoCreate,
    db: AsyncSession = Depends(get_db)
):
    """Crea un equipo vacío. Los integrantes se agregan después."""
    nuevo_equipo = EquipoMultidisciplinario(
        nombre_equipo=datos.nombre_equipo,
        activo=datos.activo,
    )
    db.add(nuevo_equipo)
    await db.commit()

    return await _get_equipo_completo(nuevo_equipo.id, db)

# ──────────────────────────────────────────
# POST / — Actualizar Equipo
# ──────────────────────────────────────────

@router.put("/{equipo_id}", response_model=EquipoResponse)
async def actualizar_equipo(
    equipo_id: int,
    datos: EquipoUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(EquipoMultidisciplinario)
        .where(EquipoMultidisciplinario.id == equipo_id)
    )
    equipo = res.scalar_one_or_none()

    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    equipo.nombre_equipo = datos.nombre_equipo

    await db.commit()

    return await _get_equipo_completo(equipo_id, db)

@router.delete("/integrantes/{integrante_id}", response_model=EquipoResponse)
async def eliminar_integrante(
    integrante_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(IntegranteEquipo)
        .where(IntegranteEquipo.id == integrante_id)
    )
    integrante = res.scalar_one_or_none()

    if not integrante:
        raise HTTPException(status_code=404, detail="Integrante no encontrado")

    # SOFT DELETE COMPLETO
    integrante.fecha_salida = datetime.utcnow()
    integrante.estatus_integrante = "Inactivo"
    integrante.motivo_cambio = "Eliminado del equipo"

    await db.commit()

    return await _get_equipo_completo(integrante.equipo_id, db)

# ──────────────────────────────────────────
# POST /{equipo_id}/integrantes — Agregar usuario al equipo
# ──────────────────────────────────────────

@router.post("/{equipo_id}/integrantes", response_model=EquipoResponse)
async def agregar_integrante(
    equipo_id: int,
    datos: AgregarIntegranteRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Agrega un usuario ya registrado a un equipo existente.
    Valida que el equipo y el usuario existan, y que el usuario
    no sea ya integrante activo del mismo equipo.
    """
    # Verificar equipo
    res_equipo = await db.execute(
        select(EquipoMultidisciplinario).where(EquipoMultidisciplinario.id == equipo_id)
    )
    if not res_equipo.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    # Verificar usuario
    res_usuario = await db.execute(select(Usuario).where(Usuario.id == datos.usuario_id))
    if not res_usuario.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar que no sea ya integrante activo del equipo
    res_dup = await db.execute(
        select(IntegranteEquipo).where(
            IntegranteEquipo.equipo_id == equipo_id,
            IntegranteEquipo.usuario_id == datos.usuario_id,
            IntegranteEquipo.fecha_salida.is_(None),
        )
    )
    if res_dup.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="El usuario ya es integrante activo de este equipo"
        )

    nuevo_integrante = IntegranteEquipo(
        equipo_id=equipo_id,
        usuario_id=datos.usuario_id,
        es_momentaneo=datos.es_momentaneo,
        estatus_integrante=datos.estatus_integrante,
    )
    db.add(nuevo_integrante)
    await db.commit()

    return await _get_equipo_completo(equipo_id, db)


@router.delete("/{equipo_id}/")
async def eliminar_equipo(
    equipo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina un equipo dado su id
    """

    # Buscar equipo
    res_equipo = await db.execute(
        select(EquipoMultidisciplinario).where(EquipoMultidisciplinario.id == equipo_id)
    )
    equipo = res_equipo.scalar_one_or_none()

    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")

    # Eliminar
    await db.delete(equipo)
    await db.commit()

    return {"mensaje": "Equipo eliminado correctamente"}


