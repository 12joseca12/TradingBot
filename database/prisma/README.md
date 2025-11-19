# Prisma Database Schema

Este directorio contiene el esquema de base de datos de Prisma para el TradingBot.

## Estructura

- `schema.prisma` - Esquema completo de la base de datos
- `migrations/` - Migraciones de base de datos (generadas automáticamente)
- `seed.ts` - Script opcional para poblar la base de datos con datos iniciales

## Modelos

### User
Datos de usuario + afiliación + relación con todo el sistema.

### Affiliate + Commission
Sistema completo para afiliados:
- Generación de código único
- Usuarios referidos
- Comisiones del 30% por suscripción

### StrategySetting
Configuración IA + riesgo por usuario.
Incluye:
- Riesgo dinámico
- Escalado automático
- Parámetros trading
- Symbols adaptables
- Control de fuerza bruta

### ApiCredential
Claves cifradas de Kraken/Binance (AES-256-GCM).

### Subscription + Invoice
Sistema SaaS completo.

### Position + Order
Todo lo necesario para PiggyBank (trading real).

## Comandos

Desde el directorio `backend/`:

```bash
# Generar el cliente de Prisma
npm run db:generate

# Crear y aplicar migraciones
npm run db:migrate

# Abrir Prisma Studio (interfaz visual)
npm run db:studio
```

## Seed

Para ejecutar el seed (opcional):

```bash
npx tsx database/prisma/seed.ts
```

