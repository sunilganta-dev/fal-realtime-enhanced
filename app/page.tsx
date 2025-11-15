"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import PerformanceSelect from "@/components/ui/performance-select";
import { ModelIcon } from "@/components/icons/model-icon";
import Link from "next/link";

const DEFAULT_PROMPT =
  "A cinematic shot of a baby raccoon wearing an intricate italian priest robe";

function randomSeed() {
  return Math.floor(Math.random() * 10000000).toFixed(0);
}

export default function Lightning() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [seed, setSeed] = useState(randomSeed());
  const [mode, setMode] = useState("balanced");

  const [image, setImage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState("idle");

 
  const handleOnChange = async (text: string) => {
    setPrompt(text);
    setImage(null);

    const res = await fetch("/api/proxy/submit-job", {
      method: "POST",
      body: JSON.stringify({
        prompt: text,
        seed: Number(seed),
        mode,
      }),
    });

    if (!res.ok) {
      console.error("Submit error:", await res.text());
      return;
    }

    const data = await res.json();
    setJobId(data.jobId);
    setJobStatus("queued");
  };


  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/proxy/job-status?id=${jobId}`);
      const data = await res.json();

      setJobStatus(data.status);

      if (data.status === "completed") {
        try {
          const blob = new Blob([data.result.images[0].content], {
            type: "image/jpeg",
          });
          setImage(URL.createObjectURL(blob));
        } catch (e) {
          console.error("Image parse error:", e);
        }
        clearInterval(interval);
      }

      if (data.status === "failed") {
        console.error("Job failed:", data.error);
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId]);


  return (
    <main>
      <div className="flex flex-col justify-between h-[calc(100vh-56px)]">
        <div>
          <div className="py-4 md:py-10 px-0 space-y-4 lg:space-y-8 mx-auto w-full max-w-xl">
            <div className="container px-3 md:px-0 flex flex-col space-y-2">
              <div className="flex flex-col max-md:space-y-4 md:flex-row md:space-x-4 max-w-full">

                {/* PROMPT */}
                <div className="flex-1 space-y-1">
                  <label>Prompt</label>
                  <Input
                    onChange={(e) => handleOnChange(e.target.value)}
                    className="font-light w-full"
                    placeholder="Type something..."
                    value={prompt}
                  />
                </div>

                {/* SEED */}
                <div className="space-y-1">
                  <label>Seed</label>
                  <Input
                    onChange={(e) => setSeed(e.target.value)}
                    className="font-light w-28"
                    placeholder="random"
                    type="number"
                    value={seed}
                  />
                </div>

                {/* PERFORMANCE MODE */}
                <div className="space-y-1">
                  <PerformanceSelect value={mode} onChange={setMode} />
                </div>
              </div>
            </div>

            <div className="container flex flex-col space-y-6 lg:flex-row lg:space-y-0 p-3 md:p-0">
              <div className="flex-1 flex-col flex items-center justify-center">
                <p className="text-sm text-neutral-400 mb-2">
                  Status: {jobStatus}
                </p>

                {image && (
                  <img
                    src={image}
                    alt="Generated"
                    className="rounded-md shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="container flex flex-col items-center justify-center my-4">
            <p className="text-sm text-neutral-400 text-center">
              This playground is hosted on{" "}
              <strong>
                <a href="https://fal.ai" className="underline" target="_blank">
                  fal.ai
                </a>
              </strong>{" "}
              for demo purposes.
            </p>
            <div className="flex flex-row items-center space-x-2">
              <span className="text-xs font-mono">powered by</span>
              <Link href="https://fal.ai" target="_blank">
                <ModelIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
