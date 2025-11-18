# TradingBot — Arquitectura Global

Este proyecto contiene:

- API Backend (Next.js)
- Servicio IA (FastAPI + PyTorch)
- Worker de trading (WebSocket Kraken + ejecución)
- Dashboards:
  - CryptoSignal (SaaS público)
  - PiggyBank (privado, trading real)
- Base de datos PostgreSQL
- Redis (colas + caché)

## Requisitos

- Docker
- Docker Compose
- Node.js 20+
- Python 3.10+
- OpenSSL

## Puesta en marcha rápida

1. Copia `.env.example` → `.env` y rellena `JWT_SECRET` + `ENC_KEY_HEX` (usa `openssl rand -hex 32`).
2. Lanza los contenedores base:

   ```bash
   docker compose up -d --build
   ```

3. URLs locales útiles:
   - Backend: http://localhost:3000
   - CryptoSignal: http://localhost:3001
   - PiggyBank: http://localhost:3002
   - ML API: http://localhost:8000/health
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

## Base de datos (Prisma)

Dentro de `backend/` o `worker/` puedes ejecutar Prisma sin indicar el esquema:

```bash
npm install
npm run db:generate
npm run db:migrate
```

Para inspeccionar datos:

```bash
npm run db:studio
```

## Cómo probar cada servicio

### Backend API

1. En `backend/`, instala dependencias y arranca en local (requiere `ENC_KEY_HEX` y `JWT_SECRET` en `.env` raíz o variables de entorno):

   ```bash
   npm install
   npm run dev
   ```

2. Registra y autentica un usuario:

   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "content-type: application/json" \
     -d '{"email":"test@example.com","password":"hash123"}'
   ```

3. Usa el token para consultar endpoints protegidos (overview, posiciones, órdenes, suscripción):

   ```bash
   curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/me/overview
   ```

### Servicio ML

1. En `ml/` instala dependencias y arranca el API:

   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app:app --reload --port 8000
   ```

2. Comprueba salud y predicción:

   ```bash
   curl http://localhost:8000/health
   curl -X POST http://localhost:8000/predict -H "content-type: application/json" \
     -d '{"features": {"atrPct": 0.002, "ret1": 0.001}}'
   ```

### Worker

1. En `worker/`, instala dependencias y ejecuta con las variables adecuadas:

   ```bash
   npm install
   ENC_KEY_HEX="<tu_clave_hex>" ML_URL="http://localhost:8000" node src/index.js
   ```

2. Verifica en consola que abre websockets y crea posiciones/órdenes PAPER en la BD.

### Dashboards

Ambos dashboards son Next.js (puertos 3001 y 3002). Para cada uno:

```bash
cd dashboards/cryptosignal   # o dashboards/piggybank
npm install
npm run dev
```

- Regístrate/inicia sesión desde la landing para guardar el JWT en el store.
- CryptoSignal: revisa señales de ejemplo y cambia el plan (llamadas a `/api/signals/sample` y `/api/subscription`).
- PiggyBank: revisa overview, posiciones y órdenes (usa `/api/me/overview`, `/api/me/positions`, `/api/me/orders`).

## Scripts y contenedores

- `docker compose up -d --build` levanta postgres, redis, backend, worker, ml y dashboards.
- Scripts en `scripts/` (`deploy.sh`, `healthcheck.sh`, `logs.sh`) sirven de base para automatizar despliegues y diagnóstico.

## Estado del proyecto

Infraestructura, base de datos, backend API, worker, servicio ML y dashboards básicos están operativos. Puedes iterar módulos adicionales (modelo entrenado, lógica real de exchanges, dashboards avanzados) sobre esta base estable.
