"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="text-6xl font-bold">{now.toLocaleTimeString()}</div>
      <div className="text-xl">{now.toLocaleDateString()}</div>
      <div className="mt-4 flex gap-4">
        <button className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 font-medium text-white">
          🟢 Clock In
        </button>
        <button className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 font-medium text-white">
          🔴 Clock Out
        </button>
      </div>
    </div>
  );
}

