import React from 'react';

const History = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="glass-morphism p-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-200">
        <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Recent Conversions
      </h2>
      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
            <div className="flex flex-col">
              <span className="text-slate-200 font-medium truncate max-w-[200px]">{item.original_name}</span>
              <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <a
              href={item.dxfUrl}
              download
              className="text-primary-400 hover:text-primary-300 flex items-center gap-2 text-sm font-bold group-hover:translate-x-1 transition-transform"
            >
              Download DXF
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
