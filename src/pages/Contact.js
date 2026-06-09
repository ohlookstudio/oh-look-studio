import { setMeta } from "../utils/seo.js";
import { SOCIAL } from "../data/social.js";

/**
 * WEATHER CODES WMO
 * 0, 1: Clear
 * 2, 3: Cloudy
 * 45, 48: Fog
 * 51-67, 80-82: Rain
 * 71-77, 85-86: Snow
 * 95-99: Storm
 */

const WEATHER_FALLBACK = {
  temp: "--",
  label: "Calm",
  phrase: "A sky that keeps its thoughts to itself.",
  config: { count: 100, speed: 0.2, driftX: 0, driftY: 0, size: 1.2, opacity: 0.2, type: 'float' }
};

const getWeatherPhrase = (current) => {
  if (!current) return "A sky that keeps its thoughts to itself.";
  const { weather_code: code, wind_speed_10m, is_day } = current;
  // Priority: storm > snow > rain > fog > night > strong wind > cloudy > clear
  if (code >= 95) return "The sky rehearsing something bigger.";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "Silence, made visible.";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Everything listening to the same sound.";
  if (code === 45 || code === 48) return "The world, softened at the edges.";
  if (!is_day) return "The hours when the place stops performing.";
  if (wind_speed_10m > 25) return "The air with somewhere to be.";
  if (code >= 2) return "A sky that keeps its thoughts to itself.";
  return "Where the light has nowhere to hide.";
};

const mapWeatherToConfig = (current, zone) => {
  if (!current) return WEATHER_FALLBACK;

  const { weather_code, wind_speed_10m, is_day, temperature_2m } = current;
  
  // Base visual presence
  let config = { 
    countMultiplier: 1.2, 
    opacity: 0.5, 
    size: 1.3, 
    speed: 0.2, 
    glow: 0.3,
    driftX: 0.1, 
    driftY: 0.1,
    type: 'float'
  };

  let label = "Clear";
  const code = weather_code;

  if (code <= 1) {
    label = is_day ? "Sunny" : "Clear night";
    config = { countMultiplier: 1.15, opacity: 0.55, size: 1.4, speed: 0.2, glow: 0.45, driftX: 0.15, driftY: -0.1 };
  } else if (code <= 3) {
    label = "Cloudy";
    config = { countMultiplier: 1.35, opacity: 0.42, size: 1.8, speed: 0.1, glow: 0.25, driftX: 0.08, driftY: 0.02 };
  } else if (code === 45 || code === 48) {
    label = "Foggy";
    config = { countMultiplier: 1.8, opacity: 0.3, size: 2.5, speed: 0.05, glow: 0.15, driftX: 0.02, driftY: 0.02 };
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    label = "Raining";
    config = { countMultiplier: 1.5, opacity: 0.5, size: 1.1, speed: 1.1, glow: 0.2, driftX: 0.2, driftY: 1.3, type: 'rain' };
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    label = "Snowing";
    config = { countMultiplier: 1.6, opacity: 0.6, size: 2.0, speed: 0.35, glow: 0.4, driftX: 0.3, driftY: 0.4, type: 'snow' };
  } else if (code >= 95) {
    label = "Stormy";
    config = { countMultiplier: 1.8, opacity: 0.65, size: 1.2, speed: 1.8, glow: 0.5, driftX: 0.4, driftY: 1.8, type: 'rain' };
  }

  // Wind influence
  const windFactor = Math.min(wind_speed_10m / 35, 1.2);
  config.driftX += windFactor * 1.8;
  config.speed += windFactor * 0.3;

  // Personality by location
  if (zone === 'sitges') {
    config.driftX += 0.05;
    config.speed *= 0.95;
    config.glow = (config.glow || 0) + 0.05;
  } else {
    config.driftX += (Math.random() > 0.5 ? 0.1 : -0.05);
    config.speed *= 1.05;
  }

  // Night influence (Atenuar, no eliminar)
  if (!is_day) {
    config.opacity *= 0.7;
    config.countMultiplier *= 0.85;
  }

  return {
    temp: Math.round(temperature_2m),
    label,
    isNight: !is_day,
    phrase: getWeatherPhrase(current),
    config: {
      ...config,
      count: Math.floor(200 * config.countMultiplier)
    }
  };
};

export async function Contact() {
  setMeta({ 
    title: "Oh, hello!", 
    description: "Let's build something that feels alive. Connecting Sitges and Talairan.",
    url: "/hello" 
  });

  return `
    <main class="contact-page js-contact-page">
      <div class="contact-bg js-contact-bg">
        <div class="contact-half">
          <canvas class="contact-canvas js-canvas-sitges"></canvas>
        </div>
        <div class="contact-half">
          <canvas class="contact-canvas js-canvas-talairan"></canvas>
        </div>
      </div>

      <div class="contact-divider-v"></div>

      <header class="contact-header">
        <p class="eyebrow">HELLO</p>
        <h1 class="contact-display">
          Let's build something<br>that feels alive.
        </h1>
      </header>

      <div class="contact-details">
        <div class="contact-details__location">
          Between Sitges & Talairan<br>
          Working worldwide
        </div>
        <a class="contact-details__email" href="mailto:hello@ohlook.studio">
          hello@ohlook.studio
        </a>
        <div class="contact-details__social">
          <a href="${SOCIAL.instagram}" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="${SOCIAL.linkedin}"  target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="${SOCIAL.behance}"   target="_blank" rel="noopener noreferrer">Behance</a>
        </div>
      </div>

      <div class="weather-labels js-weather-labels">
        <div class="weather-label js-weather-sitges">
          <span class="weather-label__name">Sitges</span>
          <span class="weather-label__val js-weather-val">Loading...</span>
          <span class="weather-label__phrase js-weather-phrase"></span>
        </div>
        <div class="weather-label weather-label--talairan js-weather-talairan">
          <span class="weather-label__name">Talairan</span>
          <span class="weather-label__val js-weather-val">Loading...</span>
          <span class="weather-label__phrase js-weather-phrase"></span>
        </div>
      </div>
    </main>
  `;
}

Contact.init = function() {
  const container = document.querySelector('.js-contact-page');
  const canvasS = document.querySelector('.js-canvas-sitges');
  const canvasT = document.querySelector('.js-canvas-talairan');
  if (!container || !canvasS || !canvasT) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) container.classList.add('is-reduced-motion');

  let rafId;
  let weatherData = { sitges: null, talairan: null };
  const abortController = new AbortController();

  async function waitForSize(el, maxMs = 2000) {
    const start = performance.now();
    while (performance.now() - start < maxMs) {
      if (el.clientWidth > 10 && el.clientHeight > 10) return true;
      await new Promise(r => requestAnimationFrame(r));
    }
    return false;
  }

  class WeatherEngine {
    constructor(canvas, zone) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.zone = zone; // 'sitges' | 'talairan'
      this.particles = [];
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
    }

    resize() {
      this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const parent = this.canvas.parentElement;
      this.w = parent.clientWidth  || Math.floor(window.innerWidth / 2);
      this.h = parent.clientHeight || window.innerHeight;

      if (this.w <= 0 || this.h <= 0) return;

      this.canvas.width = Math.floor(this.w * this.dpr);
      this.canvas.height = Math.floor(this.h * this.dpr);
      this.canvas.style.width = `${this.w}px`;
      this.canvas.style.height = `${this.h}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      
      this.initParticles();
    }

    initParticles() {
      if (this.w <= 0 || this.h <= 0) return;
      console.log('[hello canvas]', this.zone, this.canvas.width, this.canvas.height, this.canvas.getBoundingClientRect());
      const data = weatherData[this.zone];
      const count = data?.config.count || WEATHER_FALLBACK.config.count;
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this, true));
      }
    }

    update() {
      if (reduceMotion) return;
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.particles.forEach(p => {
        p.update();
        p.draw();
      });
    }
  }

  class Particle {
    constructor(engine, isInit = false) {
      this.engine = engine;
      this.reset(isInit);
    }

    reset(isInit = false) {
      const data = weatherData[this.engine.zone];
      const config = data?.config || WEATHER_FALLBACK.config;
      const { w, h } = this.engine;

      this.config = config;
      this.x = Math.random() * w;
      
      // Full height distribution on init and ALWAYS for 'float' type to prevent banding
      if (isInit || config.type === 'float') {
        this.y = Math.random() * h;
      } else {
        // Falling types (rain, snow) spawn at edges
        if (config.type === 'rain' || config.type === 'snow') {
          this.y = -50;
        } else if ((config.driftY + config.speed) < 0) {
          this.y = h + 50;
        } else {
          this.y = -50;
        }
      }

      // Movement variability for depth
      const depth = 0.5 + Math.random(); // 0.5 (far) to 1.5 (close)
      this.vx = ((config.driftX || 0) + (Math.random() - 0.5) * 0.3) * depth;
      this.vy = ((config.driftY || 0) + (config.speed || 0.2) + (Math.random() - 0.5) * 0.15) * depth;
      
      // Visuals
      this.size = config.size * depth * (0.6 + Math.random() * 0.4);
      this.opacity = config.opacity * (0.3 + Math.random() * 0.7);
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpd = 0.02 + Math.random() * 0.05;
      
      const accent = getComputedStyle(document.documentElement).getPropertyValue(this.engine.zone === 'sitges' ? '--accent-rgb' : '--accent-alt-rgb').trim() || '243, 243, 243';
      
      if (data?.label.includes("Sunny") || data?.label.includes("Clear")) {
        this.color = `rgba(${accent}, ${this.opacity})`;
      } else {
        this.color = `rgba(243, 243, 243, ${this.opacity})`;
      }

      if (config.type === 'snow') {
        this.swing = Math.random() * Math.PI * 2;
        this.swingSpd = 0.01 + Math.random() * 0.03;
      }
    }

    update() {
      const { w, h } = this.engine;
      const config = this.config;

      if (config.type === 'snow') {
        this.swing += this.swingSpd;
        this.x += Math.sin(this.swing) * 0.4;
      }
      
      this.twinkle += this.twinkleSpd;
      this.x += this.vx;
      this.y += this.vy;

      // Infinite wrap: reappear from the opposite side (toroidal flow, constant density)
      if (this.x > w) this.x = 0;
      else if (this.x < 0) this.x = w;
      if (this.y > h) this.y = 0;
      else if (this.y < 0) this.y = h;
    }

    draw() {
      const ctx = this.engine.ctx;
      const config = this.config;
      
      // Twinkle influence (organic pulsating)
      const t = (Math.sin(this.twinkle) + 1) * 0.5;
      const alpha = this.opacity * (0.5 + t * 0.5);
      
      ctx.save();
      
      if (config.glow && !reduceMotion) {
        ctx.shadowBlur = config.glow * 12;
        ctx.shadowColor = this.color;
      }

      ctx.fillStyle = this.color.replace(/[\d.]+\)$/g, `${alpha})`);
      ctx.beginPath();
      
      if (config.type === 'rain') {
        ctx.rect(this.x, this.y, this.size, this.size * 15);
      } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      }
      
      ctx.fill();
      ctx.restore();
    }
  }

  const engineS = new WeatherEngine(canvasS, 'sitges');
  const engineT = new WeatherEngine(canvasT, 'talairan');

  const loop = () => {
    engineS.update();
    engineT.update();
    rafId = requestAnimationFrame(loop);
  };

  const fetchWeather = async () => {
    const SITGES = { lat: 41.237, lon: 1.811 };
    const TALAIRAN = { lat: 43.052, lon: 2.663 };
    
    const cache = localStorage.getItem('ohlook_weather');
    if (cache) {
      const { data, timestamp } = JSON.parse(cache);
      if (Date.now() - timestamp < 10 * 60 * 1000 && data.sitges?.phrase) {
        applyWeather(data);
        return;
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${SITGES.lat},${TALAIRAN.lat}&longitude=${SITGES.lon},${TALAIRAN.lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day`;
      const res = await fetch(url, { signal: abortController.signal });
      const data = await res.json();
      
      const processed = {
        sitges: mapWeatherToConfig(data[0].current, 'sitges'),
        talairan: mapWeatherToConfig(data[1].current, 'talairan')
      };

      localStorage.setItem('ohlook_weather', JSON.stringify({ data: processed, timestamp: Date.now() }));
      applyWeather(processed);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Weather fetch failed", err);
        applyWeather({ sitges: WEATHER_FALLBACK, talairan: WEATHER_FALLBACK });
      }
    }
  };

  const applyWeather = (data) => {
    weatherData = data;
    const sLabel = document.querySelector('.js-weather-sitges .js-weather-val');
    const tLabel = document.querySelector('.js-weather-talairan .js-weather-val');
    const sPhrase = document.querySelector('.js-weather-sitges .js-weather-phrase');
    const tPhrase = document.querySelector('.js-weather-talairan .js-weather-phrase');

    if (sLabel) {
      const moon = data.sitges.isNight ? ' 🌙' : '';
      sLabel.textContent = `${data.sitges.temp}° ${data.sitges.label}${moon}`;
    }
    if (tLabel) {
      const moon = data.talairan.isNight ? ' 🌙' : '';
      tLabel.textContent = `${data.talairan.temp}° ${data.talairan.label}${moon}`;
    }
    if (sPhrase) sPhrase.textContent = data.sitges.phrase || '';
    if (tPhrase) tPhrase.textContent = data.talairan.phrase || '';
    
    engineS.initParticles();
    engineT.initParticles();
    if (!rafId && !reduceMotion) loop();
  };

  const start = async () => {
    try { await document.fonts?.ready; } catch (_) {}
    
    const ready = await waitForSize(container);
    if (!ready) console.warn("[Weather] Container size timeout");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        engineS.resize();
        engineT.resize();
        fetchWeather();
      });
    });
  };

  start();
  const onResize = () => {
    engineS.resize();
    engineT.resize();
  };
  window.addEventListener('resize', onResize);

  return () => {
    window.removeEventListener('resize', onResize);
    cancelAnimationFrame(rafId);
    abortController.abort();
  };
};
