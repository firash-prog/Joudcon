"use client";
import { useRef, useState } from 'react';
import { sbBrowser } from '@/lib/supabase-browser';

// Real device upload with genuine XHR progress (supabase-js upload lacks progress events).
export default function Uploader({ bucket, onUploaded, fixedPath, label = 'Upload from device', accept }: {
  bucket: string; onUploaded: (path: string, file: File) => void; fixedPath?: string; label?: string; accept?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pct, setPct] = useState(0); const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function upload(file: File) {
    setState('uploading'); setPct(0); setErr('');
    const { data: { session } } = await sbBrowser().auth.getSession();
    if (!session) { setState('error'); setErr('Session expired — sign in again.'); return; }
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const path = fixedPath ?? `${Date.now()}-${safe}`;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURI(path)}`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setPct(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) { setState('idle'); onUploaded(path, file); }
      else { setState('error'); setErr(`Upload failed (${xhr.status}). Check file type/size.`); }
    };
    xhr.onerror = () => { setState('error'); setErr('Network error during upload.'); };
    xhr.send(file);
  }

  return (
    <div>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
      <button type="button" onClick={() => input.current?.click()} disabled={state === 'uploading'}
        className="btn btn-ghost !py-2 !px-4 text-xs">
        {state === 'uploading' ? `Uploading… ${pct}%` : `↑ ${label}`}
      </button>
      {state === 'uploading' && <div className="mt-2 h-1.5 rounded-full bg-black/10 w-48 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--amber)' }} /></div>}
      {state === 'error' && <span className="block text-red-600 text-xs mt-2">{err}</span>}
    </div>
  );
}
