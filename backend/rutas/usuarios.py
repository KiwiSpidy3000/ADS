from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from passlib.context import CryptContext
from typing import List

from models import Usuario
from schemas import UsuarioCreate, UsuarioResponse
from database import AsyncSessionLocal

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@router.get("/", response_model=List[UsuarioResponse])
async def obtener_usuarios(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Usuario))
    usuarios = result.scalars().all()
    return usuarios

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

    return nuevo_usuario