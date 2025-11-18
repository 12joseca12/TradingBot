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

## Desarrollo

1. Copia `.env.example` → `.env`  
2. Rellena JWT_SECRET y ENC_KEY_HEX
3. Ejecuta:



docker compose up -d --build


4. Accede:

- Backend: http://localhost:3000
- CryptoSignal: http://localhost:3001
- PiggyBank: http://localhost:3002
- ML API: http://localhost:8000/health
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

El proyecto se completará con los siguientes bloques:
1. Infraestructura  
2. Base de datos + Prisma  
3. Backend API  
4. Worker  
5. ML  
6. Dashboards  
7. Scripts  

🔥 Bloque 1 completado. mas adelante te ire pasando bloques para que los añadas
