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

@router.post("/", response_model=UsuarioResponse, status_code=201)
async def registrar_usuario(
    datos: UsuarioCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registra un nuevo usuario.
    - Verifica duplicados de CURP, RFC y correo antes de insertar.
    - Si vienen datos de dirección, crea el registro en direcciones_usuarios
      y lo vincula automáticamente al usuario.
    - Hashea el password con bcrypt.
    """
 
    # ── 1. Verificar duplicados ───────────────────────────────
    duplicados = [
        (Usuario.curp, datos.curp, "CURP"),
        (Usuario.rfc, datos.rfc, "RFC"),
        (Usuario.correo, datos.correo, "correo"),
    ]
    for campo, valor, etiqueta in duplicados:
        existe = await db.execute(select(Usuario).where(campo == valor))
        if existe.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un usuario registrado con ese {etiqueta}"
            )
 
    # ── 2. Crear dirección si vienen datos ────────────────────
    direccion_id = None
    hay_direccion = any([
        datos.calle,
        datos.num_exterior,
        datos.num_interior,
        datos.colonia_id,
        datos.tipo_vivienda_id,
    ])
 
    if hay_direccion:
        nueva_direccion = DireccionUsuario(
            calle=datos.calle,
            num_exterior=datos.num_exterior,
            num_interior=datos.num_interior,
            colonia_id=datos.colonia_id,
            tipo_vivienda_id=datos.tipo_vivienda_id,
        )
        db.add(nueva_direccion)
        await db.flush()          # obtiene el ID sin hacer commit todavía
        direccion_id = nueva_direccion.id
 
    # ── 3. Crear usuario ──────────────────────────────────────
    nuevo_usuario = Usuario(
        nombre=datos.nombre,
        primer_apellido=datos.primer_apellido,
        segundo_apellido=datos.segundo_apellido,
        curp=datos.curp.upper(),
        rfc=datos.rfc.upper(),
        fecha_nacimiento=datos.fecha_nacimiento,
        correo=datos.correo.lower(),
        password_hash=(datos.password),
        sexo=datos.sexo,
        activo=datos.activo,
        tipo_personal=datos.tipo_personal,
        rol_id=datos.rol_id,
        direccion_id=direccion_id,
    )
    db.add(nuevo_usuario)
    await db.commit()
 
    # ── 4. Retornar con relaciones cargadas ───────────────────
    usuario_completo = await _get_usuario_completo(nuevo_usuario.id, db)
    return usuario_completo

 
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