# Plan de implementacion de calificaciones (tipo Uber/InDrive) - 28 Ene 2026

## Objetivo
Habilitar calificaciones mutuas post-trueque para elevar confianza y visibilidad de calidad.

## Alcance
- Calificacion 1-5 estrellas + comentario opcional.
- Ambas partes califican tras estado `COMPLETED`.
- Promedio y conteo visibles en perfil de usuario y en cada servicio.
- Notificaciones/recordatorios para cerrar el ciclo.

## Fases
1) Reglas de producto  
   - Definir ventana para calificar (p.ej. 48h), obligatoriedad y visibilidad de textos.  
   - Politicas de edicion/eliminacion y lenguaje ofensivo.

2) Modelo de datos (Prisma)  
   - Nueva entidad `Rating`: id, tradeId FK, raterId, rateeId, score (1-5), comment, createdAt.  
   - Restriccion unica (tradeId, raterId); indices por rateeId.  
   - Campos agregados en `User` (avgRating, ratingCount) o vista/materializacion.

3) Migracion + logica de datos  
   - Crear migracion Prisma.  
   - Helper que al crear rating recalcula promedio/conteo en transaccion.

4) API backend  
   - POST `/ratings`: solo participantes, trade `COMPLETED`, una vez por usuario.  
   - GET `/users/:id/ratings` (paginado) y `/users/:id/rating-summary`.  
   - Eventos/notificaciones: recordatorio al completar y aviso al recibir rating.

5) Frontend  
   - Modal/form para calificar tras completar trueque.  
   - Mostrar promedio/conteo en tarjetas de servicio y perfil; lista de comentarios recientes.  
   - Manejo de carga/errores y prevencion de doble envio.

6) Tags por defecto (chips)  
   - Catalogo de motivos predefinidos por score:  
     - 1-2 estrellas: "Incumplio lo acordado", "No se presento", "Mala comunicacion", "Calidad baja", "Tiempo de entrega".  
     - 3 estrellas: "Aceptable", "Retraso leve", "Comunicacion media", "Calidad regular".  
     - 4-5 estrellas: "Gran comunicacion", "Entrega puntual", "Alta calidad", "Volveria a intercambiar".  
   - Texto libre opcional; guardar seleccion de tags junto al rating (tabla pivote rating_tags).  
   - Tags sirven para analitica y feedback rapido tipo Uber/Indrive.

7) Controles y moderacion  
   - Rate limit por user/IP, filtro de lenguaje, flags y posible ocultar comentarios.  
   - Logs de auditoria para cambios/eliminaciones.

8) Tests y QA  
   - Unit de reglas (no participante, doble rating, trade no completado).  
   - Integracion de endpoints y recomputo de promedio.  
   - UI tests para flujo de calificar y visualizacion.

## Entregables
- Schema de Prisma + migracion.  
- Servicios y rutas Express para ratings.  
- Componentes UI y llamadas API integradas.  
- Documentacion breve de flujo y politicas.
