"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdPhone, MdEmail, MdLocationOn, MdCalendarMonth, MdVerified } from "react-icons/md";
import { getEmployeeBySlug, generateEmployeeSlug, employees } from "@/data/employee";
import { api } from "@/lib/employees/api";

function toEmpCard(e) {
  const name = e.name || [e.firstName, e.middleName, e.lastName].filter(Boolean).join(" ");
  return { ...e, name, tag: e.tag || e.designation || e.department || "Team" };
}

function telParts(raw) {
  if (!raw) return null;
  const display = raw.replace(/^tel:/, "").trim();
  if (!display) return null;
  return { display, href: `tel:${display.replace(/\s+/g, "")}` };
}

function mailParts(raw) {
  if (!raw) return null;
  const display = raw.replace(/^mailto:/, "").trim();
  if (!display || !display.includes("@")) return null;
  return { display, href: `mailto:${display}` };
}

export default function PublicEmployeeProfileDetail() {
  const params = useParams();
  const [profile, setProfile] = useState(() => getEmployeeBySlug(params.slug) || null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getEmployees();
        const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
        const match = (list || []).map(toEmpCard).find((e) => generateEmployeeSlug(e) === params.slug);
        if (alive && match) setProfile(match);
      } catch { /* keep fallback */ }
    })();
    return () => { alive = false; };
  }, [params.slug]);

  if (!profile) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm text-center space-y-4 max-w-md">
          <p className="text-4xl">🔍</p>
          <h1 className="text-lg font-black text-slate-900">Employee Not Found</h1>
          <p className="text-xs text-slate-500 font-medium">
            No team member exists at <span className="font-mono text-amber-700">/employees/{params.slug}</span>
          </p>
          <Link href="/employees" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-700 px-4 py-2.5 rounded-xl transition-colors">
            <MdArrowBack size={14} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const phone = telParts(profile.phone);
  const email = mailParts(profile.email);

  return (
    <div className="bg-white min-h-screen p-4 md:p-12 font-sans text-slate-800 antialiased">
      <div className="max-w-3xl mx-auto space-y-6">

        <Link href="/employees" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-900 transition-colors">
          <MdArrowBack size={14} /> Back to Team Directory
        </Link>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">

          {/* IDENTITY HEADER */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left border-b border-slate-100 pb-6">
            <div className={`shrink-0 w-28 h-28 rounded-3xl bg-gradient-to-br ${profile.bgGradient || "from-slate-100 to-slate-200"} p-1 shadow-sm`}>
              <img loading="lazy" src={profile.avatar} alt={profile.name} className="w-full h-full object-cover object-top rounded-[1.25rem] bg-slate-100" />
            </div>
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <MdVerified size={14} className="text-blue-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{profile.id}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile.name}</h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                {profile.role} — <span className="text-blue-900 font-black">{profile.tag}</span>
              </p>
            </div>
          </div>

          {/* SHORT DESCRIPTION */}
          {profile.description && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Summary</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* BIOGRAPHY */}
          {profile.biography && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Biography</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{profile.biography}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5">
              <span className="text-[9px] font-black uppercase text-slate-400">Direct Contact</span>

              {phone && (
                <a href={phone.href} className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 hover:text-blue-900 transition-colors">
                  <MdPhone size={14} className="text-slate-400 shrink-0" />
                  {phone.display}
                </a>
              )}

              {email && (
                <a href={email.href} className="flex items-start gap-2 text-xs font-mono font-bold text-blue-900 hover:underline break-all">
                  <MdEmail size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{email.display}</span>
                </a>
              )}

              {!phone && !email && (
                <p className="text-xs text-slate-400 font-medium">No contact details available.</p>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400">Station &amp; Tenure</span>
              {profile.officeLocation && (
                <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MdLocationOn size={14} className="text-slate-400 shrink-0" /> {profile.officeLocation}
                </p>
              )}
              {profile.joiningDate && (
                <p className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MdCalendarMonth size={14} className="text-slate-400 shrink-0" /> Joined {profile.joiningDate}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">More From The Team</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {employees.filter((other) => other.id !== profile.id).slice(0, 4).map((other) => (
              <Link key={other.id} href={`/employees/${generateEmployeeSlug(other.name, other.role)}`}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-slate-400 hover:-translate-y-0.5 transition-all duration-200 space-y-0.5 shadow-sm">
                <p className="text-xs font-black text-slate-900 truncate">{other.name}</p>
                <p className="text-[9px] font-extrabold text-blue-900 uppercase tracking-wider truncate">{other.role}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}