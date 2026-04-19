'use client';

import Sidebar from '@/components/Sidebar';
import { Calendar, Clock, ChevronRight, Play } from 'lucide-react';
import { mockPatients } from '@/lib/mockData';

export default function SessionsPage() {
  return (
    <div className="main-container">
      <Sidebar />
      <main className="content-area fade-in">
        <header className="section-title">
          <div>
            <h1>Session Manager</h1>
            <p className="stat-label">Schedule and run practitioner-led sessions</p>
          </div>
          <button className="btn-primary">Schedule Session</button>
        </header>

        <section className="layout-grid">
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Ongoing / Next Up</h3>
            <div style={{ padding: '24px', background: 'var(--accent-muted)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>JR</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Jordan Smith</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Shoulder ROM Assessment • Starts in 15 mins</div>
                </div>
              </div>
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} fill="white" /> Start Session
              </button>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Upcoming Today</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockPatients.slice(0, 3).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)', width: '60px' }}>2:30 PM</div>
                    <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                  </div>
                  <ChevronRight size={18} color="var(--muted)" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
