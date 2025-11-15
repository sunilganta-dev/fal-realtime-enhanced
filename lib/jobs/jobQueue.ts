
type JobStatus = "queued" | "processing" | "completed" | "failed";

interface Job {
  id: string;
  prompt: string;
  seed: number;
  mode: string;
  status: JobStatus;
  result?: any;
  error?: string;
}

class JobQueue {
  private queue: Job[] = [];
  private processing = false;

  addJob(prompt: string, seed: number, mode: string): string {
    const id = "job-" + Date.now() + "-" + Math.floor(Math.random() * 99999);
    this.queue.push({ id, prompt, seed, mode, status: "queued" });
    this.processJobs();
    return id;
  }

  getJob(id: string): Job | undefined {
    return this.queue.find((j) => j.id === id);
  }

  async processJobs() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.some((job) => job.status === "queued")) {
      const job = this.queue.find((job) => job.status === "queued");
      if (!job) break;

      try {
        job.status = "processing";
        const result = await this.runFalJob(job);
        job.status = "completed";
        job.result = result;
      } catch (err: any) {
        job.status = "failed";
        job.error = err.message;
      }
    }

    this.processing = false;
  }

  async runFalJob(job: Job) {

    const input = {
      prompt: job.prompt,
      seed: job.seed,
      num_inference_steps:
        job.mode === "fast" ? "1" : job.mode === "hq" ? "4" : "2",
      image_size:
        job.mode === "fast"
          ? { width: 512, height: 512 }
          : job.mode === "hq"
          ? { width: 1024, height: 1024 }
          : { width: 768, height: 768 },
      enable_safety_checker: false,
      sync_mode: true,
      num_images: 1,
    };

    const fal = require("@fal-ai/serverless-client");

    fal.config({
      proxyUrl: "/api/proxy",
    });

    const result = await fal.invoke("fal-ai/flux-schnell", input);
    return result;
  }
}

export const jobQueue = new JobQueue();
