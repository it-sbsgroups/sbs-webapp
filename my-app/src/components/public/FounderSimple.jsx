// src/components/public/FounderSimple.jsx
import Image from "next/image";

export default function FounderSimple({ person }) {
  if (!person?.name) return null;

  return (
    <div className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-md border border-slate-200">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 mb-4">
        {person.photoUrl ? (
          <img
            src={person.photoUrl}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-400">
            👤
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{person.name}</h3>
      <p className="text-sm text-blue-700 font-semibold">{person.designation}</p>
    </div>
  );
}