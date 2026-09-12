// Fingerprint motif system — derived from the Joudcon swirl (concentric arcs).
export const Contours = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 800 600" fill="none" aria-hidden="true">
    <g stroke="#AEACBF" strokeOpacity=".28" strokeWidth="1.5">
      <path d="M400,240 A60,60 0 1 1 460,300"/><path d="M400,200 A100,100 0 1 1 500,300"/>
      <path d="M400,160 A140,140 0 1 1 540,300"/><path d="M400,120 A180,180 0 1 1 580,300"/>
      <path d="M400,80 A220,220 0 1 1 620,300"/><path d="M400,40 A260,260 0 1 1 660,300"/>
    </g>
    <path d="M162,238 A260,260 0 0 1 260,60" stroke="#F9AE40" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

export const Swirl = ({ size = 64, stroke = '#AEACBF' }: { size?: number; stroke?: string }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <path d="M100,86 A14,14 0 1 1 114,100" stroke={stroke} strokeWidth="5" strokeLinecap="round"/>
    <path d="M100,66 A34,34 0 1 1 134,100" stroke={stroke} strokeWidth="5" strokeLinecap="round"/>
    <path d="M100,46 A54,54 0 1 1 154,100" stroke="#F9AE40" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

export const ProcessPath = ({ stages }: { stages: { name: string }[] }) => {
  const pos = [[156,419],[231,255],[360,161],[509,143],[643,202],[728,313],[740,448]];
  return (
    <svg viewBox="0 0 800 500" className="w-full h-auto" fill="none" role="img"
      aria-label={stages.map(s => s.name).join(', ')}>
      <path d="M156,419 A260,260 0 0 1 643,145" stroke="#AEACBF" strokeWidth="2" strokeDasharray="3 7"/>
      {stages.slice(0, 7).map((s, i) => {
        const [x, y] = pos[i]; const last = i === stages.length - 1;
        return (
          <g key={i} fontFamily="inherit" fontSize="15" fontWeight="700" textAnchor="middle">
            <circle cx={x} cy={y} r="7" fill={last ? '#F9AE40' : '#fff'} stroke="#F9AE40" strokeWidth="3"/>
            <text x={x} y={y + (y > 380 ? 34 : -18)} fill={last ? '#F9AE40' : 'currentColor'}>{s.name}</text>
          </g>
        );
      })}
    </svg>
  );
};
