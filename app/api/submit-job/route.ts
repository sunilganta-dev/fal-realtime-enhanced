import { NextResponse } from "next/server";
import { jobQueue } from "@/lib/jobs/jobQueue";

export async function POST(req: Request) {
  try {
    const { prompt, seed, mode } = await req.json();

    if (!prompt || !seed) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const jobId = jobQueue.addJob(prompt, seed, mode);
    return NextResponse.json({ jobId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Submit job error" },
      { status: 500 }
    );
  }
}