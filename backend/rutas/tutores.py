from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

from database import AsyncSessionLocal
from models import NNA, DireccionNNA, Tutor

router = APIRouter(prefix="/tutores", tags=["Tutores"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

from pydantic import BaseModel
from datetime import date
from typing import Optional

class TutorCreate(BaseModel):
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    fecha_nacimiento: date
    sexo: Optional[str] = None
    curp: Optional[str] = None
    nacionalidad: Optional[str] = "Mexicana"
    parentesco: Optional[str] = None
    direccion_id: Optional[int] = None

class TutorResponse(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str
    fecha_nacimiento: date
    sexo: Optional[str]
    curp: Optional[str]
    nacionalidad: Optional[str]
    parentesco: Optional[str]
    direccion_id: Optional[int]

    class Config:
        from_attributes = True


class TutorResumenResponse(BaseModel):
    id: int
    nombre_completo: str

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            nombre_completo=f"{obj.nombre} {obj.primer_apellido} {obj.segundo_apellido}"
        )

@router.get("/", response_model=list[TutorResponse])
async def obtener_tutores(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Tutor).order_by(Tutor.nombre)
    )
    return result.scalars().all()
@router.post("/", response_model=TutorResponse)
async def crear_tutor(
    datos: TutorCreate,
    db: AsyncSession = Depends(get_db)
):
    #  Validar CURP única (si viene)
    if datos.curp:
        res = await db.execute(
            select(Tutor).where(Tutor.curp == datos.curp)
        )
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail="Ya existe un tutor con esta CURP"
            )

    #  Crear tutor
    nuevo_tutor = Tutor(
        nombre=datos.nombre,
        primer_apellido=datos.primer_apellido,
        segundo_apellido=datos.segundo_apellido,
        fecha_nacimiento=datos.fecha_nacimiento,
        sexo=datos.sexo,
        curp=datos.curp,
        nacionalidad=datos.nacionalidad,
        parentesco=datos.parentesco,
        direccion_id=datos.direccion_id
    )

    db.add(nuevo_tutor)
    await db.commit()
    await db.refresh(nuevo_tutor)

    return nuevo_tutor