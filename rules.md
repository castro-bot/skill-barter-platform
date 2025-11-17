# Contrato Social del Equipo

Este documento contiene las reglas del equipo ("Social Contract"). Son normas simples y no negociables para trabajar de forma colaborativa, coherente y predecible.

## Estrategia de ramas (Branching Strategy)
- Usamos **GitHub Flow**. Es simple y efectivo.
- La rama `main` es la rama de **producción** y debe estar siempre estable.
- Todo trabajo nuevo (por ejemplo: `feature/add-user-login`, `bugfix/fix-trade-endpoint`) se hace en una rama de feature/bugfix separada.
- Los nombres de rama deben ser descriptivos y usar prefijos: `feature/`, `bugfix/`, `chore/`, `hotfix/`.

## Pull Requests (PR)
- Todo merge hacia `main` se hace únicamente vía Pull Request.
- Cada PR debe incluir una descripción clara del cambio, el problema que resuelve y los pasos para probarlo.
- No se permite merge directo a `main` sin PR.

## Definición de Hecho (Definition of Done - DoD)
Un ticket / tarea se considera **hecho** sólo cuando se cumplen todos estos puntos:
1. El código está escrito y compilable.
2. Las pruebas relevantes (unitarias/integración, si aplica) pasan.
3. El código ha sido revisado y **aprobado por otro desarrollador** (regla no negociable).
4. La rama de feature fue mergeada a `main` mediante PR y los checks de CI pasan.
5. Cualquier cambio en la base de datos incluye migraciones revisadas.

Nota: "Funciona en mi máquina" NO es suficiente.

## Estilo de código
- El estilo es **no negociable**.
- Usar **Prettier** y **ESLint** en frontend y backend.
- Configurar un hook de pre-commit (por ejemplo `husky`) que ejecute formateo automático y linter (y corrija lo posible) antes de permitir commit.
- Tener reglas consistentes reduce debates y facilita revisiones.

## Hooks y CI
- Configurar hooks locales para formateo y lint (`pre-commit` o `husky` + `lint-staged`).
- El pipeline de CI debe ejecutar lint, format check, tests y migraciones (o al menos validación de migraciones).
- No se permite aprobar/mergear un PR si alguno de los checks falla.

## Revisión de código
- Las revisiones son obligatorias: al menos **una aprobación de otro desarrollador**.
- Los comentarios en PR deben ser respetuosos y centrados en el código; si hay desacuerdo técnico, documentarlo y, si hace falta, llevarlo a una discusión técnica fuera del PR.

## Bases de datos y migraciones
- `prisma/schema.prisma` es la fuente de verdad para el esquema de la base de datos.
- Las migraciones deben incluirse en el repositorio y revisarse junto al PR.

## Responsabilidades generales
- Cada autor se asegura de que su PR tenga pruebas básicas y documentación mínima (README o comentarios en el PR si el cambio no es trivial).
- Mantener `main` desplegable en todo momento.

-----
Si algo no está cubierto aquí o surge una excepción crítica, discutirlo antes de aplicar cambios en `main`.

Gracias por seguir estas reglas — ayudan a que el equipo trabaje con confianza y velocidad.
