from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy import select
from passlib.context import CryptContext
from typing import List

from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from database import AsyncSessionLocal

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/", response_model=list[UsuarioResponse])
async def obtener_usuarios(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.estado),
            selectinload(Usuario.tipo_vivienda),
            selectinload(Usuario.cat_colonia),
            selectinload(Usuario.cat_municipio),
            selectinload(Usuario.cat_codigo_postal),
        )
        
    )

    usuarios = result.scalars().all()
    return usuarios

@router.get("/por_id/{id}", response_model=UsuarioResponse)
async def obtener_usuario_por_id(
    id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.estado),
            selectinload(Usuario.tipo_vivienda),
            selectinload(Usuario.cat_colonia),
            selectinload(Usuario.cat_municipio),
            selectinload(Usuario.cat_codigo_postal),
        )
        .where(Usuario.id == id)
    )

    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return usuario

@router.post("/", response_model=UsuarioResponse)
async def crear_usuario(
    usuario: UsuarioCreate,
    db: AsyncSession = Depends(get_db)
):

    # Verificar si el correo ya existe
    result = await db.execute(
        select(Usuario).where(Usuario.correo == usuario.correo)
    )
    usuario_existente = result.scalar_one_or_none()

    if usuario_existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    hashed_password = usuario.password #  pwd_context.hash(usuario.password)

    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        primer_apellido=usuario.primer_apellido,
        segundo_apellido=usuario.segundo_apellido,
        curp=usuario.curp,
        rfc=usuario.rfc,
        fecha_nacimiento=usuario.fecha_nacimiento,
        correo=usuario.correo,
        password_hash=hashed_password,
        calle = usuario.calle,
        num_exterior = usuario.num_exterior,
        num_interior = usuario.num_interior,
        colonia = usuario.colonia,
        codigo_postal = usuario.codigo_postal,
        municipio_alcaldia = usuario.municipio_alcaldia,

        rol_id=usuario.rol_id,
        estado_id=usuario.estado_id,
        tipo_vivienda_id=usuario.tipo_vivienda_id
    )

    db.add(nuevo_usuario)
    await db.commit()
    await db.refresh(nuevo_usuario)

    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.estado),
            selectinload(Usuario.tipo_vivienda),
            selectinload(Usuario.cat_colonia),
            selectinload(Usuario.cat_municipio),
            selectinload(Usuario.cat_codigo_postal),
        )
        .where(Usuario.id == nuevo_usuario.id)
    )
    usuario_creado = result.scalar_one()

    return usuario_creado
@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Usuario).where(Usuario.id == usuario_id)
    )
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = datos.model_dump(exclude_unset=True)


    if "password" in update_data:
        update_data["password_hash"] = update_data.pop("password")

    for key, value in update_data.items():
        setattr(usuario, key, value)

    await db.commit()

    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.estado),
            selectinload(Usuario.tipo_vivienda),
            selectinload(Usuario.cat_colonia),
            selectinload(Usuario.cat_municipio),
            selectinload(Usuario.cat_codigo_postal),
        )
        .where(Usuario.id == usuario_id)
    )
    usuario_actualizado = result.scalar_one()

    return usuario_actualizado

@router.delete("/{usuario_id}")
async def eliminar_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(Usuario).where(Usuario.id == usuario_id)
    )
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    await db.delete(usuario)
    await db.commit()

    return {"message": "Usuario eliminado correctamente"}

@router.patch("/{usuario_id}/revocar", response_model=UsuarioResponse)
async def revocar_acceso(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Usuario)
        .where(Usuario.id == usuario_id)
    )
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.activo = False

    await db.commit()

    
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.estado),
            selectinload(Usuario.tipo_vivienda),
            selectinload(Usuario.cat_colonia),
            selectinload(Usuario.cat_municipio),
            selectinload(Usuario.cat_codigo_postal),
        )
        .where(Usuario.id == usuario_id)
    )
    usuario_actualizado = result.scalar_one()

    return usuario_actualizado