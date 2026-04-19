'use client';

import Sidebar from '@/components/Sidebar';
import { mockPatients } from '@/lib/mockData';
import { Users, Activity, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="main-container">
      <Sidebar />
      <main className="content-area fade-in">
        <header className="section-title">
          <div>
            <h1>Practitioner Dashboard</h1>
            <p className="stat-label">Welcome back, Dr. Anderson</p>
          </div>
          <button className="btn-primary">New Session</button>
        </header>

        <section className="grid-3">
          <div className="card stat-card">
            <div className="stat-label flex items-center gap-2">
              <Users size={16} /> Total Patients
            </div>
            <div className="stat-value">24</div>
            <div className="badge badge-green" style={{marginTop: '8px', display: 'inline-block'}}>+3 this month</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label flex items-center gap-2">
              <TrendingUp size={16} /> Avg. Adherence
            </div>
            <div className="stat-value">78%</div>
            <div className="badge badge-yellow" style={{marginTop: '8px', display: 'inline-block'}}>-2% vs last week</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label flex items-center gap-2">
              <Activity size={16} /> Recovery Score Avg
            </div>
            <div className="stat-value">B-</div>
            <div className="badge badge-green" style={{marginTop: '8px', display: 'inline-block'}}>Improving</div>
          </div>
        </section>

        <section style={{ marginTop: '40px' }}>
          <div className="section-title">
            <h2>Upcoming Sessions</h2>
            <Link href="/sessions" className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Patient</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Time</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Recovery Score</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px' }}></th>
                </tr>
              </thead>
              <tbody>
                {mockPatients.map((patient) => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600 }}>{patient.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Last: {patient.last_session}</div>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '0.875rem' }}>
                      {patient.next_session}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{patient.recovery_score}</span>
                        <span className={`badge ${patient.recovery_score > 80 ? 'badge-green' : 'badge-yellow'}`}>{patient.recovery_grade}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${patient.status === 'Recovering' ? 'badge-green' : 'badge-yellow'}`}>{patient.status}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Link href={`/clients/${patient.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <style jsx>{`
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
      `}</style>
    </div>
  );
}
