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

class Features(BaseModel):
    atrPct: float = Field(..., description="ATR porcentual (ATR / precio).")
    ret1: float = Field(..., description="Retorno relativo de la última vela (close/prevClose - 1).")

    volScore: Optional[float] = Field(None, description="Score de volumen normalizado.")
    ofImb: Optional[float] = Field(None, description="Order-flow imbalance normalizado.")


class PredictRequest(BaseModel):
    features: Features


class PredictResponse(BaseModel):
    p: float
    meta: dict


@app.get("/health")
def health():
    return {"ok": True, "service": "ml", "version": "1.0.0"}


def base_score_from_features(f: Features) -> float:
    atr = max(0.0, min(0.02, f.atrPct))
    ret1 = max(-0.02, min(0.02, f.ret1))

    mom_component = 0.10 * math.tanh(ret1 * 100)

    if atr < 0.0005:
        vol_component = -0.02
    elif atr < 0.001:
        vol_component = 0.00
    elif atr < 0.003:
        vol_component = 0.04
    else:
        vol_component = -0.01

    of_component = 0.0
    if f.volScore is not None:
        vs = max(-1.0, min(1.0, f.volScore))
        of_component += 0.05 * vs

    if f.ofImb is not None:
        oi = max(-1.0, min(1.0, f.ofImb))
        of_component += 0.05 * oi

    p_raw = 0.55 + mom_component + vol_component + of_component

    p_clamped = max(0.40, min(0.95, p_raw))
    return p_clamped


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
            "info": "Heuristic model ready for replacement with trained model (LSTM/Transformer) reading MODEL_PATH."
        }
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

