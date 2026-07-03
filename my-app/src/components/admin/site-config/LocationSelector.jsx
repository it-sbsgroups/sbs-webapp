"use client";

import { useState, useEffect, useCallback } from "react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";

function Spinner() {
  return (
    <span className="inline-block w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin align-middle" />
  );
}

export default function LocationSelector({ value = {}, onChange }) {
  const [states,   setStates]   = useState([]);
  const [cities,   setCities]   = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [loadingStates,   setLoadingStates]   = useState(true);
  const [loadingCities,   setLoadingCities]   = useState(false);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [pincodeInput,    setPincodeInput]    = useState(value.pincode || "");
  const [pincodeOptions,  setPincodeOptions]  = useState([]); // multiple cities for same pincode

  useEffect(() => {
    siteConfigApi.location.getStates()
      .then(setStates)
      .finally(() => setLoadingStates(false));
  }, []);

  useEffect(() => {
    if (!value.stateId) { setCities([]); return; }
    setLoadingCities(true);
    siteConfigApi.location.getCities(value.stateId)
      .then(setCities)
      .finally(() => setLoadingCities(false));
  }, [value.stateId]);

  useEffect(() => {
    if (!value.cityId) { setPincodes([]); return; }
    setLoadingPincodes(true);
    siteConfigApi.location.getPincodes(value.cityId)
      .then(setPincodes)
      .finally(() => setLoadingPincodes(false));
  }, [value.cityId]);

  const handleStateChange = (e) => {
    const selected = states.find((s) => s.id === Number(e.target.value));
    onChange({ stateId: selected?.id || null, stateName: selected?.name || "", cityId: null, cityName: "", pincode: "" });
    setPincodeInput("");
    setPincodeOptions([]);
  };

  const handleCityChange = async (e) => {
    const selected = cities.find((c) => c.id === Number(e.target.value));
    onChange({ ...value, cityId: selected?.id || null, cityName: selected?.name || "", pincode: "" });
    setPincodeInput("");
    if (selected) {
      const pc = await siteConfigApi.location.getPincodes(selected.id);
      setPincodes(pc);
      if (pc.length === 1) {
        onChange({ ...value, cityId: selected.id, cityName: selected.name, pincode: pc[0].code });
        setPincodeInput(pc[0].code);
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const code = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincodeInput(code);
    onChange({ ...value, pincode: code });

    if (code.length === 6) {
      const results = await siteConfigApi.location.lookupByPincode(code);
      if (results.length === 1) {
        const r = results[0];
        onChange({ stateId: r.stateId, stateName: r.stateName, cityId: r.cityId, cityName: r.cityName, pincode: code });
        setPincodeOptions([]);
      } else if (results.length > 1) {
        // Multiple matches — let user pick
        setPincodeOptions(results);
      }
    } else {
      setPincodeOptions([]);
    }
  };

  const handlePincodeSelect = (e) => {
    const sel = pincodeOptions.find((o) => o.cityId === Number(e.target.value));
    if (sel) {
      onChange({ stateId: sel.stateId, stateName: sel.stateName, cityId: sel.cityId, cityName: sel.cityName, pincode: sel.code });
      setPincodeOptions([]);
    }
  };

  const inputCls = "w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Pincode — first so typing it auto-fills the rest */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
          Pincode {loadingPincodes && <Spinner />}
        </label>
        <input
          type="text"
          value={pincodeInput}
          onChange={handlePincodeChange}
          placeholder="e.g. 226001"
          maxLength={6}
          className={inputCls}
        />
        {pincodeOptions.length > 1 && (
          <div className="mt-1">
            <p className="text-[10px] text-amber-700 font-semibold mb-1">
              Multiple cities found — select one:
            </p>
            <select onChange={handlePincodeSelect} className={inputCls} defaultValue="">
              <option value="" disabled>Select city…</option>
              {pincodeOptions.map((o) => (
                <option key={o.cityId} value={o.cityId}>
                  {o.cityName}, {o.stateName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* State */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
          State {loadingStates && <Spinner />}
        </label>
        <select
          value={value.stateId || ""}
          onChange={handleStateChange}
          className={inputCls}
        >
          <option value="">Select state…</option>
          {states.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
          City {loadingCities && <Spinner />}
        </label>
        <select
          value={value.cityId || ""}
          onChange={handleCityChange}
          disabled={!value.stateId}
          className={`${inputCls} disabled:opacity-50`}
        >
          <option value="">Select city…</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}