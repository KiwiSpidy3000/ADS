from fastapi import FastAPI
from database import engine, Base
#from rutas import usuarios, catalogos, equipos_router,nna_router, tutores, catalogos_router, actores_router
from rutas import catalogos

from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# from rutas.catalogos_router import (
#     router_tipo_vivienda,
#     router_vivienda_nna,
#     router_estatus_escolar,
#     router_idioma,
#     router_enfermedad,
#     router_discapacidad,
# )

# app.include_router(router_tipo_vivienda)
# app.include_router(router_vivienda_nna)
# app.include_router(router_estatus_escolar)
# app.include_router(router_idioma)
# app.include_router(router_enfermedad)
# app.include_router(router_discapacidad)

from rutas.actores_router import router as actores_router
app.include_router(actores_router)

# app.include_router(usuarios.router)
app.include_router(catalogos.router)
# app.include_router(equipos_router.router)
# app.include_router(nna_router.router)
# app.include_router(tutores.router)




