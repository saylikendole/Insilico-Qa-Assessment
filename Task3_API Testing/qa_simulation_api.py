from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np

app = FastAPI()

class Model:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def simulate(self, i1, i2):
        o1 = self.a * i1 + self.b * i2
        o2 = np.sin(self.a * i1) + np.cos(self.b * i2)
        o3 = np.exp(-self.a * i1) + np.log1p(abs(self.b * i2 - 2))
        return {"o1": o1, "o2": o2, "o3": o3}

model_instance = Model(a=1.0, b=1.0)

class ModelParams(BaseModel):
    a: float
    b: float

class SimulationInput(BaseModel):
    i1: float
    i2: float

@app.post("/simulate/")
async def simulate(input_data: SimulationInput, model_params: ModelParams):
    model_instance = Model(a=model_params.a, b=model_params.b)
    results = model_instance.simulate(input_data.i1, input_data.i2)
    return {"inputs": input_data.dict(), "outputs": results}
