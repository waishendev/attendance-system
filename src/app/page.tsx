'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { user } from '@/data/user';
import type { CheckType, ClockLog } from '@/data/history';

export default function CheckInPage() {
  const [pin, setPin] = useState('');
  const [checkType, setCheckType] = useState<CheckType>('in');
  const [remarks, setRemarks] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const cachedCoords = useRef<{ latitude: number; longitude: number }>({ latitude: 22.3, longitude: 114.1 });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [address, setAddress] = useState('');
  const [todayLogsVersion, setTodayLogsVersion] = useState(0); // 触发刷新
  const [todayLogs, setTodayLogs] = useState<ClockLog[]>([]);

  const isSubmitDisabled =
    pin.trim().length === 0 ||
    !address || 
    address === 'Unable to retrieve address' || 
    address === 'Loading...';

  // 时钟
  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 初次定位（缓存坐标）
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        cachedCoords.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        console.log(pos.coords.latitude);
      },
      () => {
        console.warn('Failed to get location, fallback to default (22.3, 114.1)');
        console.log(121);
      },
      { timeout: 5000 }
    );
  }, []);


  // 获取地理位置
  useEffect(() => {
    const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
      try {
        const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const cleanAddress = data.display_name?.replace(/[^\x00-\x7F]/g, '').trim();
        return cleanAddress || 'Unable to retrieve address';
      } catch {
          return 'Unable to retrieve address';
        }
      };

      const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = pos.coords;
        setLocation(coords);
        const addr = await getAddressFromCoords(coords.latitude, coords.longitude);
        setAddress(addr);
      },
      () => {
    
        // setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/clock/today?userId=${user.id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setTodayLogs(Array.isArray(data.logs) ? data.logs : []);
        } else {
          setTodayLogs([]);
        }
      } catch {
        setTodayLogs([]);
      }
    };
    fetchLogs();
  }, [todayLogsVersion]);

  const handleSubmit = async () => {
    // 清消息
    setSuccessMessage('');
    setErrorMessages((prev) => prev.filter((m) => m !== 'Wrong PIN'));

    // 校验 PIN
    if (pin.trim() !== user.pin) {
      setErrorMessages((prev) => (prev.includes('Wrong PIN') ? prev : ['Wrong PIN', ...prev]));
      return;
    }

    // 取坐标
    const lat = location?.latitude ?? cachedCoords.current.latitude;
    const lon = location?.longitude ?? cachedCoords.current.longitude;

    const log: ClockLog = {
      id: String(Date.now()),
      userId: user.id,
      check_type: checkType,
      check_time: new Date().toISOString(),
      address: address || undefined,
      latitude: lat,
      longitude: lon,
      remarks: remarks || undefined,
    };

    try {
      await fetch('/api/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
      setSuccessMessage(checkType === 'in' ? 'Clocked In successfully' : 'Clocked Out successfully');
      setRemarks('');
      setPin('');
      setTodayLogsVersion((v) => v + 1); // 刷新历史
    } catch {
      setErrorMessages((prev) => (prev.includes('Submit failed') ? prev : ['Submit failed', ...prev]));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center px-3 sm:px-4 relative">
      <motion.div
        className="w-full max-w-[420px] mx-auto bg-white rounded-2xl shadow-xl md:shadow-2xl p-6 md:p-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 错误条 */}
        {errorMessages.length > 0 && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm"
          >
            {errorMessages.length === 1 ? (
              <div>
                <strong className="font-semibold">Error:</strong> {errorMessages[0]}
              </div>
            ) : (
              <>
                <strong className="font-semibold block mb-1">Errors:</strong>
                {errorMessages.map((msg, idx) => (
                  <div key={idx}>
                    {idx + 1}. {msg}
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* 成功提示 */}
        {successMessage && (
          <motion.div
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-sm"
          >
            {successMessage}
          </motion.div>
        )}

        {/* 时间日期块 */}
        {currentTime && (
          <div className="text-center rounded-2xl px-4 py-5 md:p-6 md:rounded-full md:border-4 md:shadow-lg md:border-indigo-500 bg-white space-y-2">
            <div className="text-4xl md:text-5xl font-semibold tracking-wider text-indigo-700 whitespace-nowrap">
              {currentTime.toLocaleTimeString('en-GB', { hour12: false })}
            </div>
            <div className="text-sm md:text-base text-gray-600">
              {currentTime.toLocaleDateString('en-GB', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        )}

        {/* 位置显示 */}
        <div className="text-sm space-y-1">
          <div className="text-gray-600">📍 Current Location:</div>
          <div
            className={`font-medium break-words leading-relaxed line-clamp-2 ${
              address === '❌ Failed to retrieve location' ? 'text-red-600' : 'text-gray-800'
            }`}
          >
            {address || 'Loading...'}
          </div>
        </div>


        {/* 表单 */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSubmitDisabled) handleSubmit();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Number <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg h-11 px-3 text-base focus:ring-2 focus:ring-blue-400"
              value={pin}
              maxLength={6}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(['in', 'out'] as CheckType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`h-11 px-3 rounded-lg text-center text-lg font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    checkType === type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setCheckType(type)}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg h-11 px-3 text-base focus:ring-2 focus:ring-blue-400"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`hidden md:block w-full h-12 rounded-lg text-2xl font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isSubmitDisabled
                ? 'bg-gray-300 text-gray-500 pointer-events-none opacity-60'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Submit
          </button>
        </form>

        {/* 今日记录 */}
        <div className="mt-4 rounded-xl bg-white/90 border shadow-md p-4">
          <div className="font-semibold text-gray-700 mb-2">Today&apos;s Clock Records</div>
          <div className="space-y-1 max-h-[30vh] md:max-h-20 overflow-y-auto pr-1">
            {todayLogs.length > 0 ? (
              todayLogs
                .slice()
                .reverse()
                .map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center text-sm px-2 py-2 rounded -mx-2 hover:bg-gray-50 active:bg-gray-100"
                  >
                    <span>
                      {log.check_type === 'in' ? '🟢 Clock In' : '🔴 Clock Out'}
                      {log.remarks ? ` · ${log.remarks}` : ''}
                    </span>
                    <span>
                      {new Date(log.check_time).toLocaleTimeString('en-GB', { hour12: false })}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-gray-500 text-sm">No clock records.</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sticky Submit Button */}
      <div className="md:hidden fixed inset-x-0 bottom-[env(safe-area-inset-bottom)] z-30 backdrop-blur bg-white/75 border-t pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[420px] mx-auto px-4 py-3">
          <button
            type="button"
            onClick={() => !isSubmitDisabled && handleSubmit()}
            disabled={isSubmitDisabled}
            className={`w-full h-12 rounded-lg text-2xl font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isSubmitDisabled
                ? 'bg-gray-300 text-gray-500 pointer-events-none opacity-60'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
