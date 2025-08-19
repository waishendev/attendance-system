"use client";

import { useEffect, useState } from "react";
import { user } from "@/data/user";

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const isPinValid = pin === user.pin;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClock = (type: "in" | "out") => {
    if (!isPinValid) return;
    setPinMessage(`${user.name} clocked ${type}.`);
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location unavailable.");
            break;
          case error.TIMEOUT:
            setGeoError("Location request timed out.");
            break;
          default:
            setGeoError("An unknown error occurred.");
        }
      }
    );
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div className="text-6xl font-bold">{now.toLocaleTimeString()}</div>
      <div className="text-xl">{now.toLocaleDateString()}</div>
      {coords && (
        <div className="text-lg">
          📍 {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
        </div>
      )}
      {geoError && <div className="text-red-600">{geoError}</div>}
      <div className="mt-4 flex flex-col items-center gap-4">
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="rounded border px-2 py-1"
        />
        {pin && !isPinValid && <div className="text-red-600">Invalid PIN</div>}
        {isPinValid && <div className="text-green-600">PIN validated</div>}
        {pinMessage && <div className="text-green-600">{pinMessage}</div>}
        <div className="flex gap-4">
          <button
            disabled={!isPinValid}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            onClick={() => handleClock("in")}
          >
            🟢 Clock In
          </button>
          <button
            disabled={!isPinValid}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            onClick={() => handleClock("out")}
          >
            🔴 Clock Out
          </button>
        </div>
      </div>
    </div>
  );
}

