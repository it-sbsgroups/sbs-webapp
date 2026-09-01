"use client";

import Link from "next/link";
import { ChevronRight, Home, Settings, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── ⚙️ DEFAULT SETTINGS CONFIGURATION ⚙️ ───
// Is object ko change karein aur yeh "Default" ban jayega.
const DEFAULT_CONFIG = {
  title: "About Us",
  items: [{ label: "Home", href: "/" }],
  overlayOpacity: 0.2,      // Banner ke upar black overlay ki intensity
  enableDotGrid: false,      // Dots on/off
  animateDots: false,        // Dots animation on/off
  dotColor: "rgba(255,255,255,0.2)",
  dotSpacing: 20,            // Dots ke beech ka gap
  dotBaseSize: 4,
  dotCenterScale: 1.5,
  dotHoverScale: 1.8,
  titleOpacity: 0.5,         // Title ka opacity (0.8 = 80%)
  navBottomPosition: 5,      // Breadcrumb bottom se kitne pixel upar rahega
};

export default function Breadcrumb({
  items = DEFAULT_CONFIG.items,
  title = DEFAULT_CONFIG.title,
  gradient = "from-blue-950 via-blue-900 to-slate-900",
  backgroundImage,
  overlayOpacity = DEFAULT_CONFIG.overlayOpacity,
  className = "",
  enableDotGrid = DEFAULT_CONFIG.enableDotGrid,
  animateDots = DEFAULT_CONFIG.animateDots,
  dotColor = DEFAULT_CONFIG.dotColor,
  dotSpacing = DEFAULT_CONFIG.dotSpacing,
  dotBaseSize = DEFAULT_CONFIG.dotBaseSize,
  dotCenterScale = DEFAULT_CONFIG.dotCenterScale,
  dotHoverScale = DEFAULT_CONFIG.dotHoverScale,
  titleOpacity = DEFAULT_CONFIG.titleOpacity,
  navBottomPosition = DEFAULT_CONFIG.navBottomPosition,
}) {
  const containerRef = useRef(null);
  const [dots, setDots] = useState([]);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Dots Grid Calculation ──────────────────────────────────────────
  useEffect(() => {
    if (!enableDotGrid || !containerRef.current) return;

    const updateGrid = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;

      const cols = Math.floor(w / dotSpacing);
      const rows = Math.floor(h / dotSpacing);
      const offsetX = (w - cols * dotSpacing) / 2 + dotSpacing / 2;
      const offsetY = (h - rows * dotSpacing) / 2 + dotSpacing / 2;
      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);

      const newDots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = offsetX + c * dotSpacing;
          const baseY = offsetY + r * dotSpacing;
          const dist = Math.sqrt((baseX - centerX) ** 2 + (baseY - centerY) ** 2);
          const t = 1 - Math.min(dist / maxDist, 1);
          const baseScale = 1 + t * dotCenterScale;
          newDots.push({ baseX, baseY, baseScale });
        }
      }
      setDots(newDots);
    };

    updateGrid();
    const observer = new ResizeObserver(updateGrid);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [enableDotGrid, dotSpacing, dotCenterScale]);

  // ── Dots Animation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enableDotGrid || !animateDots) {
      cancelAnimationFrame(animFrameRef.current);
      if (!animateDots) {
        setDots(prev => prev.map(d => ({ ...d, offsetX: 0, offsetY: 0 })));
      }
      return;
    }

    const speed = 0.0015;
    const amplitude = dotSpacing * 0.45;
    const wavelengthX = dotSpacing * 6;
    const wavelengthY = dotSpacing * 6;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      setDots(prev =>
        prev.map(dot => {
          const offsetX = amplitude * Math.sin((dot.baseX / wavelengthX) - elapsed * speed * 2);
          const offsetY = amplitude * Math.cos((dot.baseY / wavelengthY) - elapsed * speed);
          return { ...dot, offsetX, offsetY };
        })
      );
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [enableDotGrid, animateDots, dotSpacing]);

  // ── Render Breadcrumb ─────────────────────────────────────────────
  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Background */}
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-fill"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Dot grid */}
      {enableDotGrid && (
        <div className="absolute inset-0 z-[1] pointer-events-none" aria-hidden="true">
          {dots.map((dot, idx) => {
            const left = dot.baseX + (dot.offsetX ?? 0);
            const top = dot.baseY + (dot.offsetY ?? 0);
            const size = dotBaseSize * dot.baseScale;
            return (
              <span
                key={idx}
                className="absolute rounded-full transition-transform duration-200 hover:scale-[--hover-scale] pointer-events-auto"
                style={{
                  left,
                  top,
                  width: size,
                  height: size,
                  backgroundColor: dotColor,
                  transform: "translate(-50%, -50%)",
                  "--hover-scale": dotHoverScale,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full min-h-[280px] md:min-h-[380px]">
        
        {/* Title: Horizontally & Vertically Centered + Configurable Opacity */}
        {/* {title && (
          <h1 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl md:text-3xl font-black tracking-tight text-center"
            style={{ color: `rgba(255, 255, 255, ${titleOpacity})` }}
          >
            {title}
          </h1>
        )} */}

        {/* Nav: Bottom from config + Left Aligned */}
        <nav 
          className="absolute left-4 sm:left-6 lg:left-8 flex flex-wrap items-center gap-1.5 text-xs md:text-sm font-semibold"
          style={{ bottom: `${navBottomPosition}vh` }}
        >
          <Link href="/" className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
            <Home size={13} />
            Home
          </Link>

          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
                <ChevronRight size={13} className="text-white/40" />
                {item.href && !isLast ? (
                  <Link href={item.href} className="text-white/70 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-white" : "text-white/70"} aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// ─── 🎛️ LIVE CUSTOMIZER / SETTINGS PANEL 🎛️ ───
// Is component ko main page mein call karke aap real-time settings change kar sakte hain!
export function BreadcrumbWithSettings(props) {
  const [showPanel, setShowPanel] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_CONFIG);

  // Handle slider changes
  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative">
      {/* Render the Breadcrumb with current settings */}
      <Breadcrumb {...props} {...settings} />

      {/* Toggle Button for Settings Panel */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 z-50 bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg transition-all"
      >
        {showPanel ? <X size={20} /> : <Settings size={20} />}
      </button>

      {/* Floating Settings Panel */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 z-50 bg-gray-900/95 backdrop-blur-md border border-gray-700 p-5 rounded-xl shadow-2xl w-72 text-white">
          <h3 className="text-sm font-bold mb-4 text-orange-400 border-b border-gray-700 pb-2">
            🎨 Design Settings
          </h3>
          
          <div className="space-y-4">
            {/* Title Opacity */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Title Opacity: {settings.titleOpacity}</label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={settings.titleOpacity} 
                onChange={(e) => handleChange('titleOpacity', parseFloat(e.target.value))}
                className="w-full accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Overlay Opacity */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Overlay Opacity: {settings.overlayOpacity}</label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={settings.overlayOpacity} 
                onChange={(e) => handleChange('overlayOpacity', parseFloat(e.target.value))}
                className="w-full accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Nav Bottom Position */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nav Bottom (px): {settings.navBottomPosition}px</label>
              <input 
                type="range" min="0" max="50" step="1" 
                value={settings.navBottomPosition} 
                onChange={(e) => handleChange('navBottomPosition', parseInt(e.target.value))}
                className="w-full accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Dot Grid Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-400">Enable Dot Grid</span>
              <button 
                onClick={() => handleChange('enableDotGrid', !settings.enableDotGrid)}
                className={`w-10 h-5 rounded-full transition-colors ${settings.enableDotGrid ? 'bg-orange-600' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.enableDotGrid ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Animate Dots Toggle */}
            {settings.enableDotGrid && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Animate Dots</span>
                <button 
                  onClick={() => handleChange('animateDots', !settings.animateDots)}
                  className={`w-10 h-5 rounded-full transition-colors ${settings.animateDots ? 'bg-orange-600' : 'bg-gray-600'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.animateDots ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            )}

            {/* Dot Color Picker */}
            {settings.enableDotGrid && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Dot Color</span>
                <input 
                  type="color" 
                  value={settings.dotColor} 
                  onChange={(e) => handleChange('dotColor', e.target.value)}
                  className="w-8 h-8 rounded-full border border-gray-600 cursor-pointer bg-transparent p-0"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}