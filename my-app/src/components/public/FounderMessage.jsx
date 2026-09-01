// components/public/FounderMessage.jsx
// =============================================================================
// Reusable "Founder / Co-Founder Message" block.
//
// Design reference: the leadership-message pages used by schools/institutions
// like nmajs.edu.in — a portrait beside a warm, first-person letter, closed
// with a signature block (name + designation). Two people are laid out as
// alternating rows so the page doesn't feel like a repeated template.
//
// Data shape (matches the "founders" site-config section — see
// components/admin/site-config FoundersSection / FounderCard):
//   {
//     founder:   { name, designation, message, photoUrl, emails: [{value}], phones: [{value}] },
//     coFounder: { name, designation, message, photoUrl, emails: [{value}], phones: [{value}] },
//   }
//
// Usage:
//   <FounderMessage founders={founders} />
// =============================================================================

import Image from "next/image";

const Icon = ({ n, cls = "" }) => (
  <span className={`material-symbols-outlined leading-none ${cls}`}>{n}</span>
);

function Portrait({ name, photoUrl }) {
  return (
    <div className="relative shrink-0 mx-auto md:mx-0">
      <div className="w-40 h-48 md:w-52 md:h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-100">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name || "Leadership portrait"}
            width={320}
            height={384}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon n="person" cls="text-5xl text-slate-300" />
          </div>
        )}
      </div>
      {/* Accent tab, echoes the institutional "message" page motif */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 bg-blue-950 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
        Leadership
      </div>
    </div>
  );
}

function OneFounderMessage({ person, roleLabel, reverse }) {
  if (!person?.name) return null;

  const email = person.emails?.[0]?.value;
  const phone = person.phones?.[0]?.value;

  return (
    <div
      className={`flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      <Portrait name={person.name} photoUrl={person.photoUrl} />

      <div className="flex-1 text-center md:text-left">
        <span className="inline-block text-[10px] font-black text-blue-900 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full uppercase tracking-widest mb-3">
          Message from the {roleLabel}
        </span>

        {person.message ? (
          <blockquote className="relative text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-line">
            <span className="absolute -left-1 -top-3 text-5xl text-blue-100 font-serif select-none hidden md:inline">
              &ldquo;
            </span>
            <p className="relative">{person.message}</p>
          </blockquote>
        ) : (
          <p className="text-sm text-slate-400 italic">
            A message from {person.name} will appear here soon.
          </p>
        )}

        <div className="mt-6">
          <p className="text-sm font-black text-slate-900">{person.name}</p>
          <p className="text-[11px] text-blue-800 font-bold uppercase tracking-wide">
            {person.designation || roleLabel}
          </p>
          {(email || phone) && (
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="text-xs text-slate-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Icon n="mail" cls="text-sm" /> {email}
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="text-xs text-slate-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <Icon n="call" cls="text-sm" /> {phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FounderMessage({ founders = {}, className = "" }) {
  const { founder, coFounder } = founders;
  const hasAny = founder?.name || coFounder?.name;
  if (!hasAny) return null;

  return (
    <section className={`space-y-14 ${className}`}>
      <div className="text-center">
        <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">
          In Their Own Words
        </h2>
        <p className="text-lg font-black text-slate-900 mt-1">
          Messages From Our Leadership
        </p>
      </div>

      <OneFounderMessage person={founder} roleLabel="Founder" reverse={false} />

      {founder?.name && coFounder?.name && (
        <div className="border-t border-slate-100 pt-14">
          <OneFounderMessage person={coFounder} roleLabel="Co-Founder" reverse={true} />
        </div>
      )}
    </section>
  );
}
