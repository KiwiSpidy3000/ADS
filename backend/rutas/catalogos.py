from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy import select
from typing import List

from models import Rol, TipoVivienda, Estado
from schemas import CatalogoBaseEstado, CatalogoBaseRol,CatalogoBaseTipoVivienda
from database import AsyncSessionLocal


router = APIRouter(prefix="/catalogos", tags=["Catalogos"])
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/roles", response_model=List[CatalogoBaseRol])
async def obtener_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol))
    roles = result.scalars().all()
    return roles

@router.get("/tipos-vivienda", response_model=list[CatalogoBaseTipoVivienda])
async def obtener_tipos_vivienda(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TipoVivienda))
    tipos = result.scalars().all()
    return tipos

@router.get("/estados", response_model=list[CatalogoBaseEstado])
async def obtener_estados(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Estado))
    estados = result.scalars().all()
    return estados