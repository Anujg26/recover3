'use client';

import Sidebar from '@/components/Sidebar';
import { mockPatients } from '@/lib/mockData';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  return (
    <div className="main-container">
      <Sidebar />
      <main className="content-area fade-in">
        <header className="section-title">
          <div>
            <h1>Client Directory</h1>
            <p className="stat-label">Manage and track your 24 active patients</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Client
          </button>
        </header>

        <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or condition..." 
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem' }}
              />
            </div>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Score</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Adherence</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted)' }}>Condition</th>
                <th style={{ textAlign: 'right', padding: '16px 24px' }}></th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient) => (
                <tr key={patient.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600 }}>{patient.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>ID: #REC-{patient.id}092</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className={`badge ${patient.status === 'Recovering' ? 'badge-green' : 'badge-yellow'}`}>
                      {patient.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700 }}>{patient.recovery_score}%</span>
                      <span className={`badge ${patient.recovery_score > 80 ? 'badge-green' : 'badge-yellow'}`}>{patient.recovery_grade}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ width: `${patient.adherence}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{patient.adherence}% adherence</span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--muted)', fontSize: '0.875rem' }}>
                    Post-Op Shoulder
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Link href={`/clients/${patient.id}`} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                        View
                      </Link>
                      <button style={{ padding: '8px', color: 'var(--muted)' }}><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
