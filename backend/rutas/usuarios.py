from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from sqlalchemy import select
from passlib.context import CryptContext
from typing import List

from models import Usuario, DireccionUsuario
from schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from database import AsyncSessionLocal

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# ──────────────────────────────────────────
# ENDPOINTS
# ──────────────────────────────────────────

@router.get("/", response_model=List[UsuarioResponse])
async def obtener_usuarios(db: AsyncSession = Depends(get_db)):
    """
    Retorna todos los usuarios con sus relaciones:
    rol, dirección, colonia y tipo de vivienda.
    """
    result = await db.execute(
        select(Usuario)
        .options(
            # Rol del usuario
            selectinload(Usuario.rol),
            # Dirección → Colonia y Tipo de Vivienda
            selectinload(Usuario.direccion).selectinload(
                Usuario.direccion.property.mapper.class_.colonia
            ),
            selectinload(Usuario.direccion).selectinload(
                Usuario.direccion.property.mapper.class_.tipo_vivienda
            ),
        )
        .order_by(Usuario.primer_apellido, Usuario.nombre)
    )
    usuarios = result.scalars().all()
    return usuarios


@router.get("/{usuario_id}", response_model=UsuarioResponse)
async def obtener_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retorna un usuario por ID con todas sus relaciones anidadas.
    """
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.direccion).selectinload(
                Usuario.direccion.property.mapper.class_.colonia
            ),
            selectinload(Usuario.direccion).selectinload(
                Usuario.direccion.property.mapper.class_.tipo_vivienda
            ),
        )
        .where(Usuario.id == usuario_id)
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
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # Crear dirección primero
    nueva_direccion = DireccionUsuario(
        calle=usuario.calle,
        num_exterior=usuario.num_exterior,
        num_interior=usuario.num_interior,
        colonia_id=usuario.colonia_id,
        tipo_vivienda_id=usuario.tipo_vivienda_id
    )
    db.add(nueva_direccion)
    await db.flush()  # Para obtener el id sin hacer commit aún

    # Crear usuario con la dirección recién creada
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        primer_apellido=usuario.primer_apellido,
        segundo_apellido=usuario.segundo_apellido,
        curp=usuario.curp,
        rfc=usuario.rfc,
        fecha_nacimiento=usuario.fecha_nacimiento,
        correo=usuario.correo,
        password_hash=usuario.password,  # pwd_context.hash(usuario.password)
        rol_id=usuario.rol_id,
        direccion_id=nueva_direccion.id
    )

    db.add(nuevo_usuario)
    await db.commit()
    await db.refresh(nuevo_usuario)

    # Consulta final con relaciones cargadas
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.direccion).selectinload(DireccionUsuario.colonia),
            selectinload(Usuario.direccion).selectinload(DireccionUsuario.tipo_vivienda),
        )
        .where(Usuario.id == nuevo_usuario.id)
    )
    return result.scalar_one()

# ──────────────────────────────────────────
# HELPER: carga completa del usuario
# ──────────────────────────────────────────
 
async def _get_usuario_completo(usuario_id: int, db: AsyncSession) -> Usuario:
    """Reutilizable: trae el usuario con todas sus relaciones anidadas."""
    result = await db.execute(
        select(Usuario)
        .options(
            selectinload(Usuario.rol),
            selectinload(Usuario.direccion).selectinload(DireccionUsuario.colonia),
            selectinload(Usuario.direccion).selectinload(DireccionUsuario.tipo_vivienda),
        )
        .where(Usuario.id == usuario_id)
    )
    return result.scalar_one_or_none()
 
 
# ──────────────────────────────────────────
# PUT — Actualizar usuario
# ──────────────────────────────────────────
 
@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def actualizar_usuario(
    usuario_id: int,
    datos: UsuarioUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Actualiza los campos enviados. Los campos no incluidos en el body no se tocan."""
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
 
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
 
    update_data = datos.model_dump(exclude_unset=True)
 
    # El campo se recibe como "password" pero se guarda como "password_hash"
    if "password" in update_data:
        update_data["password_hash"] = update_data.pop("password")
 
    for key, value in update_data.items():
        setattr(usuario, key, value)
 
    await db.commit()
 
    usuario_actualizado = await _get_usuario_completo(usuario_id, db)
    return usuario_actualizado
 
 
# ──────────────────────────────────────────
# DELETE — Eliminar usuario
# ──────────────────────────────────────────
 
@router.delete("/{usuario_id}")
async def eliminar_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Elimina el usuario permanentemente. Considera usar /revocar para solo desactivarlo."""
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
 
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
 
    await db.delete(usuario)
    await db.commit()
 
    return {"message": f"Usuario {usuario_id} eliminado correctamente"}
 
 
# ──────────────────────────────────────────
# PATCH — Revocar acceso (desactivar)
# ──────────────────────────────────────────
 
@router.patch("/{usuario_id}/revocar", response_model=UsuarioResponse)
async def revocar_acceso(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Desactiva el usuario sin eliminarlo. Operación reversible."""
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
 
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
 
    if not usuario.activo:
        raise HTTPException(status_code=400, detail="El usuario ya se encuentra inactivo")
 
    usuario.activo = False
    await db.commit()
 
    usuario_actualizado = await _get_usuario_completo(usuario_id, db)
    return usuario_actualizado
 
 
# ──────────────────────────────────────────
# PATCH — Reactivar acceso
# ──────────────────────────────────────────
 
@router.patch("/{usuario_id}/reactivar", response_model=UsuarioResponse)
async def reactivar_acceso(
    usuario_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Reactiva un usuario previamente revocado."""
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalar_one_or_none()
 
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
 
    if usuario.activo:
        raise HTTPException(status_code=400, detail="El usuario ya se encuentra activo")
 
    usuario.activo = True
    await db.commit()
 
    usuario_actualizado = await _get_usuario_completo(usuario_id, db)
    return usuario_actualizado