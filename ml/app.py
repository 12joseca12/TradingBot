from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
import math
import os

app = FastAPI(
    title="TradingBot ML Service",
    version="1.0.0",
    description="Servicio de IA para señales de trading (atrPct, ret1 → p)."
)

# ---------------------------------------------------------
# MODELOS Pydantic
# ---------------------------------------------------------
class Features(BaseModel):
    atrPct: float = Field(..., description="ATR porcentual (ATR / precio).")
    ret1: float = Field(..., description="Retorno relativo de la última vela (close/prevClose - 1).")

    # Campos opcionales para futura extensión (orden de flujo, volumen, etc.)
    volScore: Optional[float] = Field(None, description="Score de volumen normalizado.")
    ofImb: Optional[float] = Field(None, description="Order-flow imbalance normalizado.")


class PredictRequest(BaseModel):
    features: Features


class PredictResponse(BaseModel):
    p: float
    meta: dict


# ---------------------------------------------------------
# HEALTHCHECK
# ---------------------------------------------------------
@app.get("/health")
def health():
    return {"ok": True, "service": "ml", "version": "1.0.0"}


# ---------------------------------------------------------
# MODELO "HEURÍSTICO" (placeholder para futuro LSTM/Transformer)
# ---------------------------------------------------------
def base_score_from_features(f: Features) -> float:
    """
    Genera una probabilidad base p usando una función suave sobre:
      - atrPct: volatilidad relativa
      - ret1: momentum
      - volScore / ofImb opcionales
    Esto es un placeholder: más adelante podemos sustituirlo por un modelo real.
    """

    atr = max(0.0, min(0.02, f.atrPct))  # cap a 2% para no distorsionar
    ret1 = max(-0.02, min(0.02, f.ret1))  # cap a ±2%

    # 1) Momentum: favorece retornos ligeramente positivos
    mom_component = 0.10 * math.tanh(ret1 * 100)

    # 2) Volatilidad: muy baja volatilidad → menos edge; volatilidad moderada → más edge.
    #    Si atr ~ 0.001–0.005 (0.1%–0.5%), subimos un poco p.
    if atr < 0.0005:
        vol_component = -0.02
    elif atr < 0.001:
        vol_component = 0.00
    elif atr < 0.003:
        vol_component = 0.04
    else:
        vol_component = -0.01  # demasiada locura → penalizamos

    # 3) Volumen / order flow si están presentes
    of_component = 0.0
    if f.volScore is not None:
        # Asumimos volScore ~ [-1,1]
        vs = max(-1.0, min(1.0, f.volScore))
        of_component += 0.05 * vs

    if f.ofImb is not None:
        # Asumimos ofImb ~ [-1,1] (compradores vs vendedores)
        oi = max(-1.0, min(1.0, f.ofImb))
        of_component += 0.05 * oi

    # Probabilidad base alrededor de 0.55 (ligeramente mejor que random)
    p_raw = 0.55 + mom_component + vol_component + of_component

    # Empujamos a rango razonable
    p_clamped = max(0.40, min(0.95, p_raw))
    return p_clamped


# ---------------------------------------------------------
# ENDPOINT PRINCIPAL: /predict
# ---------------------------------------------------------
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    f = req.features

    p = base_score_from_features(f)

    return PredictResponse(
        p=p,
        meta={
            "atrPct": f.atrPct,
            "ret1": f.ret1,
            "volScore": f.volScore,
            "ofImb": f.ofImb,
            "model": "heuristic_v1",
            "info": "Placeholder heurístico. Listo para sustituir por modelo entrenado (LSTM/Transformer) leyendo MODEL_PATH."
        }
    )


# ---------------------------------------------------------
# Si quieres ejecutarlo directamente: uvicorn app:app --reload
# ---------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
