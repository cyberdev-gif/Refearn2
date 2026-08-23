import React from 'react';

type Props = {
  progress: number; // in currency (e.g., 10000)
  target?: number; // default 75000
};

const formatCurrency = (n: number) => `₦${n.toLocaleString()}`;

export const TaskProgressBar: React.FC<Props> = ({ progress, target = 75000 }) => {
  const pct = Math.max(0, Math.min(100, Math.round((progress / target) * 100)));
  const completed = progress >= target;
  const remaining = Math.max(0, target - progress);

  return (
    <div style={{ padding: '14px', borderRadius: 12, background: completed ? 'linear-gradient(135deg, rgba(18,184,134,0.12), rgba(16,185,129,0.06))' : 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: completed ? '1px solid rgba(18,184,134,0.25)' : '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>{completed ? '🎉' : '💰'}</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: completed ? '#bbf7d0' : '#e6eef8' }}>{completed ? 'Upgrade Unlocked!' : 'Earn to Upgrade'}</div>
        </div>
        <div style={{ fontSize: 13, color: completed ? '#bbf7d0' : '#94a3b8', fontWeight: 700 }}>{formatCurrency(progress)} / {formatCurrency(target)}</div>
      </div>

      <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ width: `${pct}%`, height: '100%', transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)', background: completed ? 'linear-gradient(90deg, #12b886, #16a34a)' : 'linear-gradient(90deg, #7c3aed, #a78bfa)', boxShadow: completed ? '0 0 10px rgba(18,184,134,0.5)' : '0 0 10px rgba(124,58,237,0.4)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: completed ? '#bbf7d0' : '#94a3b8', fontWeight: 600 }}>{pct}%{!completed && ` • ${formatCurrency(remaining)} left`}</div>
        {completed ? <div style={{ fontSize: 12, color: '#bbf7d0', fontWeight: 700 }}>Target reached ✅ Eligible to withdraw</div> : <div style={{ fontSize: 11, color: '#64748b' }}>Earn {formatCurrency(target)} via tasks to upgrade</div>}
      </div>
    </div>
  );
};

export default TaskProgressBar;
