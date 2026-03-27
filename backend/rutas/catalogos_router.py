from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from models import (
    CatTipoVivienda,
    CatViviendaNNA,
    CatEstatusEscolar,
    CatIdioma,
    CatEnfermedad,
    CatDiscapacidad,
)
from database import AsyncSessionLocal


# ============================================================
# DEPENDENCY
# ============================================================

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ============================================================
# SCHEMAS PYDANTIC
# ============================================================

class TipoViviendaCreate(BaseModel):
    descripcion: str

class TipoViviendaUpdate(BaseModel):
    descripcion: Optional[str] = None

class TipoViviendaOut(BaseModel):
    id: int
    descripcion: str
    class Config:
        from_attributes = True


class ViviendaNNACreate(BaseModel):
    descripcion: Optional[str] = None

class ViviendaNNAUpdate(BaseModel):
    descripcion: Optional[str] = None

class ViviendaNNAOut(BaseModel):
    id: int
    descripcion: Optional[str] = None
    class Config:
        from_attributes = True


class EstatusEscolarCreate(BaseModel):
    descripcion: str

class EstatusEscolarUpdate(BaseModel):
    descripcion: Optional[str] = None

class EstatusEscolarOut(BaseModel):
    id: int
    descripcion: str
    class Config:
        from_attributes = True


class IdiomaCreate(BaseModel):
    nombre: str
    variante: Optional[str] = None

class IdiomaUpdate(BaseModel):
    nombre: Optional[str] = None
    variante: Optional[str] = None

class IdiomaOut(BaseModel):
    id: int
    nombre: str
    variante: Optional[str] = None
    class Config:
        from_attributes = True


class EnfermedadCreate(BaseModel):
    nombre: str

class EnfermedadUpdate(BaseModel):
    nombre: Optional[str] = None

class EnfermedadOut(BaseModel):
    id: int
    nombre: str
    class Config:
        from_attributes = True


class DiscapacidadCreate(BaseModel):
    nombre: str

class DiscapacidadUpdate(BaseModel):
    nombre: Optional[str] = None

class DiscapacidadOut(BaseModel):
    id: int
    nombre: str
    class Config:
        from_attributes = True


# ============================================================
# ROUTER: cat_tipo_vivienda
# ============================================================

router_tipo_vivienda = APIRouter(prefix="/catalogos/tipo-vivienda", tags=["Tipo Vivienda"])

@router_tipo_vivienda.get("/", response_model=List[TipoViviendaOut])
async def listar_tipo_vivienda(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda))
    return result.scalars().all()

@router_tipo_vivienda.get("/{id}", response_model=TipoViviendaOut)
async def obtener_tipo_vivienda(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda).where(CatTipoVivienda.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_tipo_vivienda.post("/", response_model=TipoViviendaOut, status_code=status.HTTP_201_CREATED)
async def crear_tipo_vivienda(payload: TipoViviendaCreate, db: AsyncSession = Depends(get_db)):
    registro = CatTipoVivienda(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_tipo_vivienda.patch("/{id}", response_model=TipoViviendaOut)
async def actualizar_tipo_vivienda(id: int, payload: TipoViviendaUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda).where(CatTipoVivienda.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_tipo_vivienda.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_tipo_vivienda(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda).where(CatTipoVivienda.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# ROUTER: cat_vivienda_nna
# ============================================================

router_vivienda_nna = APIRouter(prefix="/catalogos/vivienda-nna", tags=["Vivienda NNA"])

@router_vivienda_nna.get("/", response_model=List[ViviendaNNAOut])
async def listar_vivienda_nna(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatViviendaNNA))
    return result.scalars().all()

@router_vivienda_nna.get("/{id}", response_model=ViviendaNNAOut)
async def obtener_vivienda_nna(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatViviendaNNA).where(CatViviendaNNA.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_vivienda_nna.post("/", response_model=ViviendaNNAOut, status_code=status.HTTP_201_CREATED)
async def crear_vivienda_nna(payload: ViviendaNNACreate, db: AsyncSession = Depends(get_db)):
    registro = CatViviendaNNA(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_vivienda_nna.patch("/{id}", response_model=ViviendaNNAOut)
async def actualizar_vivienda_nna(id: int, payload: ViviendaNNAUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatViviendaNNA).where(CatViviendaNNA.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_vivienda_nna.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_vivienda_nna(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatViviendaNNA).where(CatViviendaNNA.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# ROUTER: cat_estatus_escolar
# ============================================================

router_estatus_escolar = APIRouter(prefix="/catalogos/estatus-escolar", tags=["Estatus Escolar"])

@router_estatus_escolar.get("/", response_model=List[EstatusEscolarOut])
async def listar_estatus_escolar(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEstatusEscolar))
    return result.scalars().all()

@router_estatus_escolar.get("/{id}", response_model=EstatusEscolarOut)
async def obtener_estatus_escolar(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEstatusEscolar).where(CatEstatusEscolar.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_estatus_escolar.post("/", response_model=EstatusEscolarOut, status_code=status.HTTP_201_CREATED)
async def crear_estatus_escolar(payload: EstatusEscolarCreate, db: AsyncSession = Depends(get_db)):
    registro = CatEstatusEscolar(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_estatus_escolar.patch("/{id}", response_model=EstatusEscolarOut)
async def actualizar_estatus_escolar(id: int, payload: EstatusEscolarUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEstatusEscolar).where(CatEstatusEscolar.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_estatus_escolar.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_estatus_escolar(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEstatusEscolar).where(CatEstatusEscolar.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# ROUTER: cat_idiomas
# ============================================================

router_idioma = APIRouter(prefix="/catalogos/idiomas", tags=["Idiomas"])

@router_idioma.get("/", response_model=List[IdiomaOut])
async def listar_idiomas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatIdioma))
    return result.scalars().all()

@router_idioma.get("/{id}", response_model=IdiomaOut)
async def obtener_idioma(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatIdioma).where(CatIdioma.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_idioma.post("/", response_model=IdiomaOut, status_code=status.HTTP_201_CREATED)
async def crear_idioma(payload: IdiomaCreate, db: AsyncSession = Depends(get_db)):
    registro = CatIdioma(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_idioma.patch("/{id}", response_model=IdiomaOut)
async def actualizar_idioma(id: int, payload: IdiomaUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatIdioma).where(CatIdioma.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_idioma.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_idioma(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatIdioma).where(CatIdioma.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# ROUTER: cat_enfermedades
# ============================================================

router_enfermedad = APIRouter(prefix="/catalogos/enfermedades", tags=["Enfermedades"])

@router_enfermedad.get("/", response_model=List[EnfermedadOut])
async def listar_enfermedades(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEnfermedad))
    return result.scalars().all()

@router_enfermedad.get("/{id}", response_model=EnfermedadOut)
async def obtener_enfermedad(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEnfermedad).where(CatEnfermedad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_enfermedad.post("/", response_model=EnfermedadOut, status_code=status.HTTP_201_CREATED)
async def crear_enfermedad(payload: EnfermedadCreate, db: AsyncSession = Depends(get_db)):
    registro = CatEnfermedad(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_enfermedad.patch("/{id}", response_model=EnfermedadOut)
async def actualizar_enfermedad(id: int, payload: EnfermedadUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEnfermedad).where(CatEnfermedad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_enfermedad.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_enfermedad(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatEnfermedad).where(CatEnfermedad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# ROUTER: cat_discapacidades
# ============================================================

router_discapacidad = APIRouter(prefix="/catalogos/discapacidades", tags=["Discapacidades"])

@router_discapacidad.get("/", response_model=List[DiscapacidadOut])
async def listar_discapacidades(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatDiscapacidad))
    return result.scalars().all()

@router_discapacidad.get("/{id}", response_model=DiscapacidadOut)
async def obtener_discapacidad(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatDiscapacidad).where(CatDiscapacidad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    return registro

@router_discapacidad.post("/", response_model=DiscapacidadOut, status_code=status.HTTP_201_CREATED)
async def crear_discapacidad(payload: DiscapacidadCreate, db: AsyncSession = Depends(get_db)):
    registro = CatDiscapacidad(**payload.model_dump())
    db.add(registro)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_discapacidad.patch("/{id}", response_model=DiscapacidadOut)
async def actualizar_discapacidad(id: int, payload: DiscapacidadUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatDiscapacidad).where(CatDiscapacidad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(registro, field, value)
    await db.commit()
    await db.refresh(registro)
    return registro

@router_discapacidad.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_discapacidad(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatDiscapacidad).where(CatDiscapacidad.id == id))
    registro = result.scalar_one_or_none()
    if not registro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro no encontrado")
    await db.delete(registro)
    await db.commit()


# ============================================================
# REGISTRO EN main.py
# ============================================================
# from catalogos_router import (
#     router_tipo_vivienda,
#     router_vivienda_nna,
#     router_estatus_escolar,
#     router_idioma,
#     router_enfermedad,
#     router_discapacidad,
# )
#
# app.include_router(router_tipo_vivienda)
# app.include_router(router_vivienda_nna)
# app.include_router(router_estatus_escolar)
# app.include_router(router_idioma)
# app.include_router(router_enfermedad)
# app.include_router(router_discapacidad)
