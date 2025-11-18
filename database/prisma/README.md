# Prisma Database

Esquema y utilidades para la base de datos PostgreSQL del proyecto TradingBot.

## Archivos
- `schema.prisma`: definición completa de modelos (usuarios, afiliados, credenciales, SaaS, trading).
- `seed.ts`: script opcional para poblar datos iniciales de prueba.
- `migrations/`: se genera automáticamente con `prisma migrate`.

## Comandos útiles
Desde `backend/`:

- `npm run db:generate`: genera el cliente de Prisma.
- `npm run db:migrate`: crea/aplica migraciones en desarrollo.
- `npm run db:studio`: abre Prisma Studio para inspeccionar datos.

Antes de ejecutar, asegúrate de tener la variable `DATABASE_URL` configurada en `.env` apuntando a PostgreSQL.
