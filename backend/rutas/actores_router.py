from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy import select, update, delete
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import joinedload
from database import AsyncSessionLocal
from models import (
    ActoresDerechos,
    ActorPersonaFisica,
    ActorEnlace,
    ActorPrograma,
    Contactos,
    Direcciones,
)
from schemas import (
    ActorCreate,
    DireccionOut,
    ActorPersonaFisicaCreate,
    ActorAsociacionCreate,
    ActorPersonaFisicaOut,
    ActorAsociacionOut,
    ActorOut,
)

router = APIRouter(prefix="/actores", tags=["Actores"])


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

DB = Annotated[AsyncSession, Depends(get_db)]


# =============================================================
# POST /actores/
# =============================================================

@router.post(
    "/",
    response_model=ActorOut,
    status_code=status.HTTP_201_CREATED,
)
async def crear_actor(payload: ActorCreate, db: DB):
    try:
        # 1. Dirección
        direccion_id = None
        if payload.direccion:
            direccion = Direcciones(**payload.direccion.model_dump())
            db.add(direccion)
            await db.flush()
            direccion_id = direccion.id

        # 2. Actor base
        actor = ActoresDerechos(
            nombre                 = payload.nombre,
            tipo_actor_id          = payload.tipo_actor_id,
            tiene_registro_oficial = payload.tiene_registro_oficial,
            registro_oficial_num   = payload.registro_oficial_num,
            horario_atencion       = payload.horario_atencion,
            responsable_contacto   = payload.responsable_contacto,
            observaciones          = payload.observaciones,
            direccion_id           = direccion_id,
        )
        db.add(actor)
        await db.flush()  # actor.id disponible aquí

        # 3. Persona física (solo si aplica)
        if isinstance(payload, ActorPersonaFisicaCreate):
            pf = ActorPersonaFisica(
                id_actor = actor.id,
                **payload.persona_fisica.model_dump()
            )
            db.add(pf)

        # 4. Enlaces
        for e in payload.enlaces:
            db.add(ActorEnlace(actor_id=actor.id, **e.model_dump()))

        # 5. Programas
        for p in payload.programas:
            db.add(ActorPrograma(actor_id=actor.id, **p.model_dump()))

        # 6. Contactos
        for c in payload.contactos:
            db.add(Contactos(actor_id=actor.id, **c.model_dump()))

        await db.commit()

        # 7. Regresar el actor recién creado
        result = await db.execute(
            select(ActoresDerechos).where(ActoresDerechos.id == actor.id)
        )
        actor_db = result.scalar_one()

        if isinstance(payload, ActorPersonaFisicaCreate):
            pf_result = await db.execute(
                select(ActorPersonaFisica).where(ActorPersonaFisica.id_actor == actor.id)
            )
            pf_db = pf_result.scalar_one_or_none()
            return ActorPersonaFisicaOut(
                **actor_db.__dict__,
                tipo           = "persona_fisica",
                persona_fisica = pf_db,
            )

        return ActorAsociacionOut(
            **actor_db.__dict__,
            tipo = "asociacion",
        )

    except HTTPException:
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar el actor: {str(exc)}",
        )

from sqlalchemy.orm import joinedload
def actor_to_dict(actor) -> dict:
    """Extrae el __dict__ del ORM excluyendo claves internas y la relación direccion."""
    return {
        k: v for k, v in actor.__dict__.items()
        if not k.startswith("_") and k != "direccion"
    }


# =============================================================
# GET /actores/{actor_id}
# =============================================================
@router.get("/{actor_id}", response_model=ActorOut)
async def obtener_actor(actor_id: int, db: DB):
    result = await db.execute(
        select(ActoresDerechos)
        .options(joinedload(ActoresDerechos.direccion))
        .where(ActoresDerechos.id == actor_id)
    )
    actor = result.scalar_one_or_none()
    if not actor:
        raise HTTPException(status_code=404, detail="Actor no encontrado")

    pf_result = await db.execute(
        select(ActorPersonaFisica).where(ActorPersonaFisica.id_actor == actor_id)
    )
    pf = pf_result.scalar_one_or_none()

    direccion = DireccionOut.model_validate(actor.direccion) if actor.direccion else None
    data = actor_to_dict(actor)

    if pf:
        return ActorPersonaFisicaOut(
            **data,
            tipo           = "persona_fisica",
            persona_fisica = pf,
            direccion      = direccion,
        )
    return ActorAsociacionOut(
        **data,
        tipo      = "asociacion",
        direccion = direccion,
    )


# =============================================================
# GET /actores/
# =============================================================
@router.get("/", response_model=list[ActorOut])
async def obtener_actores(db: DB):
    result = await db.execute(
        select(ActoresDerechos)
        .options(joinedload(ActoresDerechos.direccion))
    )
    actores = result.unique().scalars().all()

    if not actores:
        raise HTTPException(status_code=404, detail="No se encontraron actores")

    actores_out = []
    for actor in actores:
        pf_result = await db.execute(
            select(ActorPersonaFisica).where(ActorPersonaFisica.id_actor == actor.id)
        )
        pf = pf_result.scalar_one_or_none()

        direccion = DireccionOut.model_validate(actor.direccion) if actor.direccion else None
        data = actor_to_dict(actor)

        if pf:
            actores_out.append(
                ActorPersonaFisicaOut(
                    **data,
                    tipo           = "persona_fisica",
                    persona_fisica = pf,
                    direccion      = direccion,
                )
            )
        else:
            actores_out.append(
                ActorAsociacionOut(
                    **data,
                    tipo      = "asociacion",
                    direccion = direccion,
                )
            )
    return actores_out


# =============================================================
# PUT /actores/{actor_id}
# =============================================================
@router.put("/{actor_id}", response_model=ActorOut)
async def actualizar_actor(actor_id: int, payload: ActorCreate, db: DB):
    try:
        # 1. Verificar que el actor existe
        result = await db.execute(
            select(ActoresDerechos).where(ActoresDerechos.id == actor_id)
        )
        actor = result.scalar_one_or_none()
        if not actor:
            raise HTTPException(status_code=404, detail="Actor no encontrado")

        # 2. Actualizar o crear dirección
        if payload.direccion:
            dir_data = payload.direccion.model_dump(exclude_none=True)
            if actor.direccion_id:
                # Ya tiene dirección → actualizar
                await db.execute(
                    update(Direcciones)
                    .where(Direcciones.id == actor.direccion_id)
                    .values(**dir_data)
                )
            else:
                # No tenía dirección → crear nueva
                nueva_dir = Direcciones(**dir_data)
                db.add(nueva_dir)
                await db.flush()
                actor.direccion_id = nueva_dir.id
        else:
            # Payload sin dirección → dejar la existente intacta
            pass

        # 3. Actualizar campos base del actor
        actor.nombre                 = payload.nombre
        actor.tipo_actor_id          = payload.tipo_actor_id
        actor.tiene_registro_oficial = payload.tiene_registro_oficial
        actor.registro_oficial_num   = payload.registro_oficial_num
        actor.horario_atencion       = payload.horario_atencion
        actor.responsable_contacto   = payload.responsable_contacto
        actor.observaciones          = payload.observaciones
        await db.flush()

        # 4. Actualizar persona física si aplica
        if isinstance(payload, ActorPersonaFisicaCreate):
            pf_result = await db.execute(
                select(ActorPersonaFisica).where(ActorPersonaFisica.id_actor == actor_id)
            )
            pf = pf_result.scalar_one_or_none()
            pf_data = payload.persona_fisica.model_dump()
            if pf:
                # Actualizar la existente
                for key, val in pf_data.items():
                    setattr(pf, key, val)
            else:
                # Crearla si por alguna razón no existía
                db.add(ActorPersonaFisica(id_actor=actor_id, **pf_data))
            await db.flush()

        # 5. Sincronizar contactos
        # Eliminar los existentes y reinsertar
        await db.execute(
            delete(Contactos).where(Contactos.actor_id == actor_id)
        )
        for c in payload.contactos:
            db.add(Contactos(actor_id=actor_id, **c.model_dump(
                exclude={"enlace_id"} if not hasattr(Contactos, "enlace_id") else set()
            )))
        await db.flush()

        # 6. Sincronizar programas
        await db.execute(
            delete(ActorPrograma).where(ActorPrograma.actor_id == actor_id)
        )
        for p in payload.programas:
            db.add(ActorPrograma(actor_id=actor_id, **p.model_dump()))
        await db.flush()

        # 7. Sincronizar enlaces
        await db.execute(
            delete(ActorEnlace).where(ActorEnlace.actor_id == actor_id)
        )
        for e in payload.enlaces:
            db.add(ActorEnlace(actor_id=actor_id, **e.model_dump()))
        await db.flush()

        await db.commit()

        # 8. Recargar actor con dirección para construir el Out
        result = await db.execute(
            select(ActoresDerechos)
            .options(joinedload(ActoresDerechos.direccion))
            .where(ActoresDerechos.id == actor_id)
        )
        actor_db = result.scalar_one()
        direccion = DireccionOut.model_validate(actor_db.direccion) if actor_db.direccion else None
        data = actor_to_dict(actor_db)

        if isinstance(payload, ActorPersonaFisicaCreate):
            pf_result = await db.execute(
                select(ActorPersonaFisica).where(ActorPersonaFisica.id_actor == actor_id)
            )
            pf_db = pf_result.scalar_one_or_none()
            return ActorPersonaFisicaOut(
                **data,
                tipo           = "persona_fisica",
                persona_fisica = pf_db,
                direccion      = direccion,
            )

        return ActorAsociacionOut(
            **data,
            tipo      = "asociacion",
            direccion = direccion,
        )

    except HTTPException:
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar el actor: {str(exc)}",
        )