import React from 'react';

export default function DbFallback({ error }: { error: any }) {
  return (
    <main className="p-6 max-w-2xl mx-auto mt-20 text-center space-y-6 bg-slate-900/40 border border-white/10 rounded-2xl backdrop-blur-md">
      <div className="text-5xl">⚠️</div>
      <h1 className="text-2xl font-bold text-rose-400">Database Connection Required</h1>
      <p className="text-sm text-slate-300 leading-relaxed">
        Your Kakeibo app is successfully deployed on Netlify, but it cannot connect to your database yet.
      </p>
      
      <div className="p-5 bg-slate-950/60 border border-white/5 rounded-xl text-left space-y-3 text-xs leading-relaxed text-slate-400">
        <p className="font-bold text-slate-200">How to fix this in Netlify:</p>
        <ol className="list-decimal pl-4 space-y-1.5">
          <li>Go to your <strong>Netlify Dashboard</strong> &gt; <strong>Site Configuration</strong> &gt; <strong>Environment variables</strong>.</li>
          <li>Ensure you have added the keys exactly as:
            <ul className="list-disc pl-4 mt-1 space-y-1">
              <li><strong>TURSO_URL</strong> (e.g. `libsql://money-tracker-siddu.aws-ap-south-1.turso.io`)</li>
              <li><strong>TURSO_TOKEN</strong> (your generated token)</li>
            </ul>
          </li>
          <li>Check for any accidental spaces or quotes around the values.</li>
          <li>Go to <strong>Deploys</strong> and click <strong>Trigger deploy</strong> &gt; <strong>Deploy site</strong> to apply changes.</li>
        </ol>
        <p className="text-[10px] text-rose-400 mt-3 font-mono border-t border-white/5 pt-2">
          Error details: {error.message || String(error)}
        </p>
      </div>
      
      <a href="/" className="inline-block px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-all">
        Retry Connection
      </a>
    </main>
  );
}
