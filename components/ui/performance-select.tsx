"use client";

interface PerfProps {
  value: string;
  onChange: (v: string) => void;
}

export default function PerformanceSelect({ value, onChange }: PerfProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded-md p-2 bg-black text-white"
    >
      <option value="balanced">Balanced</option>
      <option value="fast">Fast</option>
      <option value="hq">High Quality</option>
    </select>
  );
}
