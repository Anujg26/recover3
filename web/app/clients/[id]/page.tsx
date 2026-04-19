'use client';

import Sidebar from '@/components/Sidebar';
import { mockPatients, mockAdherence } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClientDetail() {
  const { id } = useParams();
  const patient = mockPatients.find(p => p.id === id) || mockPatients[0];

  return (
    <div className="main-container">
      <Sidebar />
      <main className="content-area fade-in">
        <header style={{ marginBottom: '32px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{patient.full_name}</h1>
              <p className="stat-label">Patient ID: #REC-{patient.id}092</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-secondary">Edit Profile</button>
              <button className="btn-primary">Start New Session</button>
            </div>
          </div>
        </header>

        {/* Since Last Session Summary - CRITICAL FEATURE */}
        <section className="card" style={{ background: 'var(--primary)', color: 'white', marginBottom: '32px', border: 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={24} color="var(--accent)" /> Since Last Session Summary
            </h2>
            <span className="badge badge-green">Last 7 Days</span>
          </div>
          
          <div className="grid-3" style={{ gap: '40px' }}>
            <div>
              <div className="stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Adherence</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{patient.adherence}%</div>
              <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                <span className="text-green" style={{ color: '#4ade80' }}>85%</span> of required tasks completed
              </div>
            </div>
            <div>
              <div className="stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>ROM Progress</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>+12°</div>
              <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                Shoulder Abduction improved by 8.5%
              </div>
            </div>
            <div>
              <div className="stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Key Insight</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '8px', lineHeight: 1.4 }}>
                Soreness peaks 4h post-lift. Suggest moving cold therapy earlier.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} color="#4ade80" />
              <span>Completed: 18 tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={18} color="#f87171" />
              <span>Missed: 3 tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent)" />
              <span>Score Trend: +4 pts</span>
            </div>
          </div>
        </section>

        <div className="grid-2">
          {/* Main Content Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Body Visualization */}
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}>Body-Zone Visualization</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '300px', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                {/* Mock Body Map Overlay */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: patient.zones.shoulder === 'red' ? '#fee2e2' : '#d1fae5', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 12px', border: `3px solid ${patient.zones.shoulder === 'red' ? '#ef4444' : '#10b981'}` }}>
                    <Activity size={30} color={patient.zones.shoulder === 'red' ? '#ef4444' : '#10b981'} style={{margin: '0 auto'}} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Shoulder</div>
                  <div className="badge badge-red">{patient.zones.shoulder === 'red' ? 'Needs Attention' : 'Stable'}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 12px', border: '3px solid #f59e0b' }}>
                    <Activity size={30} color="#f59e0b" style={{margin: '0 auto'}} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Hip / Knee</div>
                  <div className="badge badge-yellow">Improving</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 12px', border: '3px solid #10b981' }}>
                    <Activity size={30} color="#10b981" style={{margin: '0 auto'}} />
                  </div>
                  <div style={{ fontWeight: 600 }}>Ankle</div>
                  <div className="badge badge-green">Stable</div>
                </div>
              </div>
            </div>

            {/* ROM Progress */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Shoulder Abduction ROM</h3>
                <span className="stat-label">Last checked: Today</span>
              </div>
              <div style={{ height: '200px', background: '#f8fafc', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px' }}>
                {[45, 60, 55, 75, 82, 95, 110, 132].map((val, i) => (
                  <div key={i} style={{ flex: 1, background: 'var(--primary)', height: `${(val/180) * 100}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem', fontWeight: 600 }}>{val}°</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
                {['Apr 1', 'Apr 3', 'Apr 5', 'Apr 8', 'Apr 10', 'Apr 12', 'Apr 15', 'Today'].map(label => (
                  <span key={label} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{label}</span>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="card" style={{ background: 'var(--accent-muted)' }}>
              <h3 style={{ marginBottom: '16px' }}>Current Recovery Track</h3>
              <div style={{ background: 'white', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700 }}>Post-Surgical Phase 2</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Started Apr 05 • 3 weeks left</div>
              </div>
              <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', border: '1px solid var(--accent)' }}>
                <Plus size={16} /> Adjust Track
              </button>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Recent Sessions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { date: 'Apr 12, 2024', focus: 'Mobility & Range', outcome: 'Improved' },
                  { date: 'Apr 05, 2024', focus: 'Initial Assessment', outcome: 'Baseline set' }
                ].map((s, i) => (
                  <div key={i} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600 }}>{s.date}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{s.focus} • {s.outcome}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '16px' }}>Recent Recovery Logs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { type: 'Sauna', time: 'Yesterday, 6:30 PM', duration: '20 min' },
                  { type: 'Cold Plunge', time: 'Yesterday, 7:00 PM', duration: '3 min' },
                  { type: 'Breathwork', time: 'Today, 8:15 AM', duration: '10 min' }
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{l.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{l.time}</div>
                    </div>
                    <div className="badge badge-green">{l.duration}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
