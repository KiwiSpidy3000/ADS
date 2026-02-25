from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import AsyncSessionLocal, engine, Base

from models import Personal
from schemas import PersonalCreate, PersonalResponse, PersonalUpdate, PersonalOut

app = FastAPI()

# Crear tablas (solo para desarrollo)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Endpoint para registrar personal
@app.post("/personal/", response_model=PersonalResponse)
async def registrar_personal(
    personal: PersonalCreate,
    db: AsyncSession = Depends(get_db)
):
    # Verificar si el correo ya existe
    result = await db.execute(
        select(Personal).where(Personal.correo == personal.correo)
    )
    existente = result.scalar_one_or_none()

    if existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    personal.alta = 1 
    nuevo_personal = Personal(**personal.model_dump())

    db.add(nuevo_personal)
    await db.commit()
    await db.refresh(nuevo_personal)

    return nuevo_personal

# Endpoint para obtener todo el  personal
@app.get("/obtenerPersonal", response_model=list[PersonalOut])
async def obtener_personal(db: AsyncSession = Depends(get_db)):
    #Seleccionar todos los integrantes del personal

    result = await db.execute(select(Personal))
    personal = result.scalars().all()
    return personal


@app.patch("/personalPorId/{personal_id}", response_model=PersonalOut)
async def obtener_por_id(
    personal_id: int,
    datos_actualizados: PersonalUpdate,
    db: AsyncSession = Depends(get_db)
):
    # Buscar registro
    result = await db.execute(
        select(Personal).where(Personal.id == personal_id)
    )
    personal = result.scalar_one_or_none()

    if not personal:
        raise HTTPException(status_code=404, detail="Personal no encontrado")

    return personal

@app.patch("/personal/{personal_id}", response_model=PersonalOut)
async def actualizar_personal(
    personal_id: int,
    datos_actualizados: PersonalUpdate,
    db: AsyncSession = Depends(get_db)
):
    # Buscar registro
    result = await db.execute(
        select(Personal).where(Personal.id == personal_id)
    )
    personal = result.scalar_one_or_none()

    if not personal:
        raise HTTPException(status_code=404, detail="Personal no encontrado")

    # Obtener solo campos enviados
    update_data = datos_actualizados.model_dump(exclude_unset=True)

    # Actualizar dinámicamente
    for key, value in update_data.items():
        setattr(personal, key, value)

    await db.commit()
    await db.refresh(personal)

    return personal


from sqlalchemy import select

@app.delete("/personal/{personal_id}")
async def eliminar_personal(
    personal_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Buscar registro
    result = await db.execute(
        select(Personal).where(Personal.id == personal_id)
    )
    personal = result.scalar_one_or_none()

    if not personal:
        raise HTTPException(
            status_code=404,
            detail="Personal no encontrado"
        )

    await db.delete(personal)
    await db.commit()

    return {"mensaje": "Personal eliminado correctamente"}