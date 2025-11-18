// worker/src/index.js
import prisma from "./prismaClient.js";
import { decryptFromB64 } from "./crypto.js";
import { startUserSession } from "./userSession.js";

async function boot() {
  console.log("Worker iniciando...");

  const users = await prisma.user.findMany({
    include: {
      settings: true,
      credentials: {
        where: { exchange: "kraken" }
      }
    }
  });

  console.log(`Encontrados ${users.length} usuarios.`);

  for (const user of users) {
    let settings = user.settings;
    if (!settings) {
      settings = await prisma.strategySetting.create({
        data: {
          userId: user.id
        }
      });
    }

    const cred = user.credentials?.[0] || null;
    let credsDecrypted = null;

    if (cred) {
      try {
        credsDecrypted = {
          apiKey: decryptFromB64(cred.apiKeyEnc),
          apiSecret: decryptFromB64(cred.apiSecEnc)
        };
      } catch (e) {
        console.error(
          `Error desencriptando credenciales para user=${user.email}:`,
          e?.message || e
        );
      }
    }

    startUserSession(user, settings, credsDecrypted);
  }

  // Simple watcher para nuevos usuarios cada 60s (muy básico)
  setInterval(async () => {
    const count = await prisma.user.count();
    console.log(`[Watcher] Usuarios actuales en BD: ${count}`);
  }, 60000);
}

boot().catch((err) => {
  console.error("Worker boot error:", err);
  process.exit(1);
});
