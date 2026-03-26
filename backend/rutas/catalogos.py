from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy import select
from typing import List

from models import CatRol, CatTipoVivienda, CatEstado, CatColonia, CatMunicipio, CatEstatusEscolar, CatViviendaNNA
# from schemas import CatalogoBaseEstado, CatalogoBaseRol,CatalogoBaseTipoVivienda

# from schemas import ColoniaResponse, CodigoPostalResponse, MunicipioResponse

from database import AsyncSessionLocal


router = APIRouter(prefix="/catalogos", tags=["Catalogos"])
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/por-codigo-postal/{codigo_postal}")
async def obtener_datos_por_cp(
    codigo_postal: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CatColonia)
        .options(
            selectinload(CatColonia.municipio).selectinload(CatMunicipio.estado)
        )
        .where(CatColonia.codigo_postal == codigo_postal)
    )
    colonias = result.scalars().all()

    if not colonias:
        raise HTTPException(status_code=404, detail="No se encontraron colonias para ese código postal")

    # Estado y municipio son los mismos para todas las colonias del CP
    primera = colonias[0]

    return {
        "codigo_postal": codigo_postal,
        "estado": {
            "id": primera.municipio.estado.id,
            "nombre": primera.municipio.estado.nombre
        },
        "municipio": {
            "id": primera.municipio.id,
            "nombre": primera.municipio.nombre
        },
        "colonias": [
            {"id": c.id, "nombre": c.nombre}
            for c in colonias
        ]
    }

@router.get("/roles")
async def obtener_roles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatRol).order_by(CatRol.nombre_rol))
    roles = result.scalars().all()
    return [{"id": r.id, "nombre_rol": r.nombre_rol} for r in roles]
 
 
@router.get("/roles/{rol_id}")
async def obtener_rol(rol_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatRol).where(CatRol.id == rol_id))
    rol = result.scalar_one_or_none()
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return {"id": rol.id, "nombre_rol": rol.nombre_rol}



 
@router.get("/tipos-vivienda")
async def obtener_tipos_vivienda(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda).order_by(CatTipoVivienda.descripcion))
    tipos = result.scalars().all()
    return [{"id": t.id, "descripcion": t.descripcion} for t in tipos]
 
 
@router.get("/tipos-vivienda/{tipo_id}")
async def obtener_tipo_vivienda(tipo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CatTipoVivienda).where(CatTipoVivienda.id == tipo_id))
    tipo = result.scalar_one_or_none()
    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de vivienda no encontrado")
    return {"id": tipo.id, "descripcion": tipo.descripcion}


from pydantic import BaseModel

class CatEstatusEscolarResponse(BaseModel):
    id: int
    descripcion: str

    class Config:
        from_attributes = True

@router.get("/estatus-escolar", response_model=list[CatEstatusEscolarResponse])
async def obtener_estatus_escolar(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CatEstatusEscolar).order_by(CatEstatusEscolar.descripcion)
    )
    return result.scalars().all()

class CatViviendaNNAResponse(BaseModel):
    id: int
    descripcion: str

    class Config:
        from_attributes = True

@router.get("/tipos-vivienda-nna", response_model=list[CatViviendaNNAResponse])
async def obtener_tipos_vivienda(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CatViviendaNNA).order_by(CatViviendaNNA.descripcion)
    )
    return result.scalars().all()


# @router.get("/roles", response_model=List[CatalogoBaseRol])
# async def obtener_roles(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(CatRol))
#     roles = result.scalars().all()
#     return roles

# @router.get("/tipos-vivienda", response_model=list[CatalogoBaseTipoVivienda])
# async def obtener_tipos_vivienda(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(CatTipoVivienda))
#     tipos = result.scalars().all()
#     return tipos

# @router.get("/estados", response_model=list[CatalogoBaseEstado])
# async def obtener_estados(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(CatEstado))
#     estados = result.scalars().all()
#     return estados


# @router.get("/colonias", response_model=list[ColoniaResponse])
# async def obtener_colonias(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(CatColonia))
#     return result.scalars().all()


# @router.get("/municipios", response_model=list[MunicipioResponse])
# async def obtener_municipios(db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(CatMunicipio))
#     return result.scalars().all()