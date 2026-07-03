export default function PinnedHotlines({ hotlines }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-black uppercase text-slate-400 tracking-widest">Direct Command Coordinates</h2>
      <div className="space-y-3">
        {hotlines.map((contact, idx) => (
          <div key={idx} className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm flex justify-between items-center gap-4 hover:border-slate-900 transition-all group hover:shadow-md">
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-blue-900 transition-colors">{contact.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{contact.designation}</p>
            </div>
            <div className="text-right text-[10px] font-mono font-bold text-slate-600 space-y-1">
              <p className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">📞 {contact.phone}</p>
              <p className="underline text-slate-400 font-sans font-medium hover:text-slate-900 transition-colors">{contact.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}