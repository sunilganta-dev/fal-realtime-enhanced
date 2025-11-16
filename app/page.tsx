"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import PerformanceSelect from "@/components/ui/performance-select";
import { ModelIcon } from "@/components/icons/model-icon";
import { toast } from "sonner";

const DEFAULT_PROMPT =
  "A cinematic shot of a baby raccoon wearing an intricate Italian priest robe";

function randomSeed() {
  return Math.floor(Math.random() * 10_000_000).toFixed(0);
}

export default function Lightning() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [seed, setSeed] = useState(randomSeed());
  const [mode, setMode] = useState("balanced");

  const [image, setImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setImage(null);
    setLoading(true);
    toast.info("Submitting job…");

    const res = await fetch("http://localhost:8000/submit-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        seed: Number(seed),
        mode,
      }),
    });

    if (!res.ok) {
      toast.error("Failed to submit job");
      setJobStatus("failed");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setJobId(data.jobId);
    setJobStatus("queued");
    toast.success("Job queued!");
  };

  // Polling backend
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await fetch(
        `http://localhost:8000/job-status?id=${jobId}`
      );
      const data = await res.json();

      setJobStatus(data.status);

      if (data.status === "completed") {
        try {
          setImage(data.result.url);
          toast.success("Image generated!");
        } catch (e) {
          toast.error("Image formatting error");
        }
        setLoading(false);
        clearInterval(interval);
      }

      if (data.status === "failed") {
        toast.error("Image generation failed");
        setLoading(false);
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0b0b0e] via-[#13131a] to-[#0c0c11] text-white">

      {/* CENTER SECTION */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 pt-10">

        {/* CARD */}
        <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 shadow-2xl relative">

          {/* Header */}
          <h2 className="text-center text-4xl font-extrabold mb-10 text-purple-300 tracking-wide drop-shadow-lg">
            AI Image Generator
          </h2>

          {/* INPUT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Prompt */}
            <div className="flex flex-col">
              <label className="text-sm opacity-70 mb-1">Prompt</label>
              <Input
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                className="bg-black/30 border-white/20"
              />
            </div>

            {/* Seed */}
            <div className="flex flex-col">
              <label className="text-sm opacity-70 mb-1">Seed</label>
              <Input
                type="number"
                onChange={(e) => setSeed(e.target.value)}
                value={seed}
                className="bg-black/30 border-white/20"
              />
            </div>

            {/* Mode */}
            <div className="flex flex-col">
              <label className="text-sm opacity-70 mb-1">Performance Mode</label>
              <PerformanceSelect value={mode} onChange={setMode} />
            </div>

          </div>

          {/* BUTTON */}
          <button
            onClick={handleGenerate}
            className={`mt-10 w-full py-4 rounded-2xl font-semibold text-lg
            bg-purple-600 hover:bg-purple-700 active:scale-95 transition 
            disabled:bg-gray-700 disabled:cursor-not-allowed shadow-xl`}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Image"}
          </button>

          {/* Status */}
          <p className="mt-4 text-center text-neutral-400">
            Status: {jobStatus}
          </p>
        </div>

        {/* IMAGE DISPLAY */}
        {image && (
          <div className="mt-12 flex flex-col items-center animate-fadeIn">

            <img
              src={image}
              alt="Generated"
              className="max-w-xl rounded-3xl shadow-2xl border border-white/10"
            />

            {/* Extra Features */}
            <div className="flex gap-4 mt-6">

              {/* Download */}
              <button
                onClick={() => window.open(image, "_blank")}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/20"
              >
                Download
              </button>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(image);
                  toast.success("Image URL copied!");
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/20"
              >
                Copy Link
              </button>

            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="mt-10 animate-pulse text-purple-400 text-lg">
            Generating your image…
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-neutral-500 bg-black/20 backdrop-blur-md border-t border-white/10">
        powered by <ModelIcon />
      </footer>
    </main>
  );
}
