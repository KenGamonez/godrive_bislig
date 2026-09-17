import { useEffect, useState } from 'react';

/** Bislig City, Surigao del Sur. */
const LAT = 9.22;
const LON = 126.35;

interface Current {
  temp: number;
  feelsLike: number;
  code: number;
  precipitation: number;
}

type Tone = 'cool' | 'warm' | 'hot' | 'severe' | 'rain' | 'idle';

function describe(code: number): { label: string; glyph: string } {
  if (code === 0) return { label: 'Clear', glyph: '☀' };
  if (code === 1) return { label: 'Mostly clear', glyph: '☀' };
  if (code === 2) return { label: 'Partly cloudy', glyph: '⛅' };
  if (code === 3) return { label: 'Overcast', glyph: '☁' };
  if (code === 45 || code === 48) return { label: 'Fog', glyph: '☁' };
  if (code >= 51 && code <= 67) return { label: 'Rain', glyph: '☂' };
  if (code >= 71 && code <= 77) return { label: 'Showers', glyph: '☂' };
  if (code >= 80 && code <= 82) return { label: 'Showers', glyph: '☂' };
  if (code === 95) return { label: 'Storm', glyph: '⚡' };
  if (code >= 96) return { label: 'Severe storm', glyph: '⚡' };
  return { label: '—', glyph: '☁' };
}

function toneFor(c: Current): Tone {
  const severe = c.code >= 95;
  if (severe) return 'severe';
  const raining = c.precipitation > 0 || (c.code >= 51 && c.code <= 82);
  if (raining) return 'rain';
  if (c.temp >= 34) return 'severe';
  if (c.temp >= 32) return 'hot';
  if (c.temp >= 26) return 'warm';
  return 'cool';
}

export function WeatherWidget() {
  const [current, setCurrent] = useState<Current | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
          `&current=temperature_2m,apparent_temperature,weather_code,precipitation&timezone=Asia%2FManila`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`weather ${res.status}`);
        const data = (await res.json()) as {
          current?: {
            temperature_2m: number;
            apparent_temperature: number;
            weather_code: number;
            precipitation: number;
          };
        };
        if (!live || !data.current) return;
        setCurrent({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          code: data.current.weather_code,
          precipitation: data.current.precipitation,
        });
        setFailed(false);
      } catch {
        if (live) setFailed(true);
      }
    };
    load();
    const t = window.setInterval(load, 10 * 60 * 1000);
    return () => {
      live = false;
      window.clearInterval(t);
    };
  }, []);

  if (!current && !failed) {
    return (
      <div className="wx wx-idle" aria-label="Loading Bislig weather">
        <span className="wx-city">Bislig City</span>
        <span className="wx-sub">Checking sky…</span>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="wx wx-idle" role="status">
        <span className="wx-city">Bislig City</span>
        <span className="wx-sub">Weather unavailable</span>
      </div>
    );
  }

  const info = describe(current.code);
  return (
    <div className={`wx wx-${toneFor(current)}`} role="status" aria-label={`Bislig City weather: ${current.temp} degrees, feels like ${current.feelsLike}, ${info.label}`}>
      <span className="wx-glyph" aria-hidden="true">{info.glyph}</span>
      <span className="wx-main">
        <b>{current.temp}°</b>
        <small>Feels {current.feelsLike}° · {info.label}</small>
      </span>
      <span className="wx-city">Bislig City</span>
    </div>
  );
}
