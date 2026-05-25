'use client';

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, CloudSnow, Loader2 } from 'lucide-react';

const engToBdNum = (numStr: string) => {
  const bdNumbers = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return numStr.replace(/[0-9]/g, (w) => bdNumbers[+w]);
};

export function WeatherWidget() {
  const [temp, setTemp] = useState<string | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Coordinates for Kachua, Chandpur (Approx: 23.35, 90.89)
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=23.3506&longitude=90.8928&current_weather=true');
        if (!res.ok) throw new Error('Weather API failed');
        const data = await res.json();
        
        const tempC = Math.round(data.current_weather.temperature);
        setTemp(engToBdNum(tempC.toString()));
        setWeatherCode(data.current_weather.weathercode);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="flex items-center gap-1 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /></div>;
  }

  if (temp === null) return null;

  let Icon = Sun;
  let iconColor = "text-orange-500";
  
  if ([1, 2, 3, 45, 48].includes(weatherCode)) {
    Icon = Cloud;
    iconColor = "text-gray-500";
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    Icon = CloudRain;
    iconColor = "text-blue-500";
  }
  if ([71, 73, 75, 85, 86].includes(weatherCode)) {
    Icon = CloudSnow;
    iconColor = "text-blue-300";
  }
  if ([95, 96, 99].includes(weatherCode)) {
    Icon = CloudLightning;
    iconColor = "text-yellow-500";
  }

  return (
    <div className="flex items-center gap-1.5 text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <span className="text-[13px] font-bangla font-bold">{temp}° সে.</span>
      <span className="hidden sm:inline text-[12px] font-bangla text-gray-500 ml-1 border-l border-gray-300 pl-1.5">কচুয়া</span>
    </div>
  );
}
