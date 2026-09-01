"use client";

import Card from "@/components/shared/Card";
import { isValidLink } from "@/data/employee";

export default function EmployeeCard({ employee }) {
  const emp = employee;
  const hasEmail = isValidLink(emp.email) && emp.email.includes("@");

  return (
    <Card hover className="rounded-3xl p-6 flex flex-col items-center text-center group hover:shadow-lg">
      {/* Avatar */}
      <div className="relative mb-3">
        <img
          loading="lazy"
          src={emp.image}
          alt={emp.name}
          className="w-28 h-28 rounded-full object-cover border-2 border-slate-100"
        />
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-slate-900 leading-tight">{emp.name}</h3>

      {/* Designation & Department */}
      <div className="mt-1 space-y-0.5">
        <p className="text-blue-600 font-semibold text-sm">{emp.designation}</p>
        {(emp.department || emp.tag) && (
          <p className="text-slate-500 text-xs uppercase tracking-wide">
            {emp.department || emp.tag}
          </p>
        )}
      </div>

      {/* Email */}
      {hasEmail && (
        <a
          href={`mailto:${emp.email}`}
          className="mt-4 text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5 justify-center"
        >
          <span>✉</span> {emp.email}
        </a>
      )}
    </Card>
  );
}
