from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import asyncio
import fal_client

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Job store
jobs = {}

class JobRequest(BaseModel):
    prompt: str
    seed: int
    mode: str


@app.post("/submit-job")
async def submit_job(req: JobRequest):
    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "status": "queued",
        "result": None,
        "error": None
    }

    asyncio.create_task(process_job(job_id, req))

    return {"jobId": job_id}


async def process_job(job_id: str, req: JobRequest):
    try:
        jobs[job_id]["status"] = "processing"

        # Call fal.ai model
        result = fal_client.run(
            "fal-ai/flux-schnell",
            {
                "prompt": req.prompt,
                "seed": req.seed,
                "num_inference_steps": 4
            }
        )

        image_url = result["images"][0]["url"]

        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = {"url": image_url}

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@app.get("/job-status")
async def job_status(id: str = Query(...)):
    if id not in jobs:
        return {"status": "not_found"}

    return jobs[id]
