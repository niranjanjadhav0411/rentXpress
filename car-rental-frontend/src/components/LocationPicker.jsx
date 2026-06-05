import { useState, useEffect, useRef } from "react";

export default function LocationPicker({
  value,
  onChange,
  placeholder = "Pickup Location",
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("type");
  const [inputVal, setInputVal] = useState(value || "");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const wrapRef = useRef(null);

  // Sync external value
  useEffect(() => { setInputVal(value || ""); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Init map when map tab opens
  useEffect(() => {
    if (tab !== "map" || !open) return;

    const buildMap = () => {
      if (!window.L || !mapRef.current || mapInstanceRef.current) return;

      const map = window.L.map(mapRef.current, { zoomControl: true }).setView(
        [18.6298, 73.7997], 13,
      );
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const icon = window.L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#e8c97a,#c9a84c);border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.3)"></div>`,
        iconAnchor: [14, 28],
      });

      const marker = window.L.marker([18.6298, 73.7997], {
        draggable: true,
        icon,
      }).addTo(map);

      const reverseGeocode = async (lat, lng) => {
        marker.setLatLng([lat, lng]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );
          const data = await res.json();
          const short = data.address
            ? [
                data.address.suburb,
                data.address.city || data.address.town || data.address.village,
                data.address.state,
              ]
                .filter(Boolean)
                .join(", ")
            : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setInputVal(short);
          onChange(short);
        } catch {
          const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setInputVal(coords);
          onChange(coords);
        }
      };

      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        reverseGeocode(lat, lng);
      });
      map.on("click", (e) => reverseGeocode(e.latlng.lat, e.latlng.lng));

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setTimeout(() => map.invalidateSize(), 120);
    };

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = buildMap;
      document.head.appendChild(script);
    } else {
      buildMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [tab, open]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 15);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        );
        const data = await res.json();
        const short = data.address
          ? [
              data.address.suburb,
              data.address.city || data.address.town || data.address.village,
              data.address.state,
            ]
              .filter(Boolean)
              .join(", ")
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setInputVal(short);
        onChange(short);
      } catch {
        const coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setInputVal(coords);
        onChange(coords);
      }
    });
  };

  const confirm = () => { onChange(inputVal); setOpen(false); };

  const suggestions = [
    "Pimpri, Pune",
    "Pune Station",
    "Hinjewadi",
    "Kothrud, Pune",
    "Viman Nagar",
    "Shivajinagar",
  ];

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Trigger ── */}
      <div
        onClick={() => setOpen((o) => !o)}
        className="input-premium"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          cursor: "pointer", userSelect: "none", paddingLeft: "2.25rem",
          position: "relative",
        }}
      >
        <span style={{ position: "absolute", left: 14, color: "var(--gold)", pointerEvents: "none" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </span>
        <span style={{
          fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: inputVal ? "var(--text-primary)" : "var(--text-muted)",
          flex: 1,
        }}>
          {inputVal || placeholder}
        </span>
        {inputVal && (
          <span
            onClick={(e) => { e.stopPropagation(); setInputVal(""); onChange(""); }}
            style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1, flexShrink: 0, cursor: "pointer" }}
          >
            ×
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* ── Dropdown ── */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "var(--surface-1)", border: "1px solid var(--border)",
          borderRadius: 16, zIndex: 9999, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          minWidth: 300,
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            {[
              { key: "type", icon: "✏️", label: "Type Location" },
              { key: "map",  icon: "🗺️", label: "Pick on Map"   },
            ].map(({ key, icon, label }) => (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, padding: "11px 0", fontSize: 11, fontWeight: 700,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                background: tab === key ? "rgba(201,168,76,0.08)" : "transparent",
                color: tab === key ? "var(--gold)" : "var(--text-muted)",
                borderBottom: `2px solid ${tab === key ? "var(--gold)" : "transparent"}`,
                fontFamily: "inherit", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6,
              }}>
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* ── TYPE tab ── */}
          {tab === "type" && (
            <div style={{ padding: 14 }}>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gold)", pointerEvents: "none" }}
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={inputVal}
                  onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); }}
                  onKeyDown={(e) => e.key === "Enter" && confirm()}
                  placeholder="Type your pickup location..."
                  className="input-premium"
                  style={{ paddingLeft: "2.25rem" }}
                />
              </div>

              {/* Suggestions */}
              <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                Quick Pick
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => { setInputVal(s); onChange(s); setOpen(false); }}
                    style={{
                      padding: "5px 11px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      border: "1px solid var(--border)", background: "var(--surface-2)",
                      color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 4,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; e.currentTarget.style.background = "rgba(201,168,76,0.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--surface-2)"; }}
                  >
                    <span style={{ fontSize: 10 }}>📍</span> {s}
                  </button>
                ))}
              </div>

              {/* GPS button */}
              <button
                onClick={() => { setTab("map"); setTimeout(useMyLocation, 600); }}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  border: "1px solid var(--border)", background: "var(--surface-2)",
                  color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  <path d="M12 8a4 4 0 100 8 4 4 0 000-8z"/>
                </svg>
                Use My Current Location
              </button>
            </div>
          )}

          {/* ── MAP tab ── */}
          {tab === "map" && (
            <div>
              <div style={{ padding: "10px 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={useMyLocation} style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: "1px solid var(--gold)", background: "rgba(201,168,76,0.1)",
                  color: "var(--gold)", cursor: "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                  </svg>
                  My Location
                </button>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  Tap map or drag the pin to set location
                </span>
              </div>

              {/* Map container */}
              <div
                ref={mapRef}
                style={{
                  height: 240, margin: "10px 14px",
                  borderRadius: 12, overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              />

              {inputVal && (
                <div style={{ padding: "0 14px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, flex: 1 }}>
                    {inputVal}
                  </span>
                </div>
              )}

              <div style={{ padding: "8px 14px 14px" }}>
                <button onClick={confirm} style={{
                  width: "100%", padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 800,
                  border: "none", background: "linear-gradient(135deg,#e8c97a,#c9a84c)",
                  color: "#0a0a0f", cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(201,168,76,0.3)",
                }}>
                  ✓ Confirm This Location
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
