"use client";

import { useState } from "react";

const modes = [
  { label: "Fast", value: "fast" },
  { label: "Balanced", value: "balanced" },
  { label: "High Quality", value: "hq" },
];

export default function PerformanceSelect({ value, onChange }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-300">Performance Mode</label>
      <select
        className="bg-black border border-gray-700 rounded px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {modes.map((mode) => (
          <option key={mode.value} value={mode.value}>
            {mode.label}
          </option>
        ))}
      </select>
    </div>
  );
}
