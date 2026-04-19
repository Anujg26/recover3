'use client';

import Sidebar from '@/components/Sidebar';
import { mockPatients } from '@/lib/mockData';
import { ArrowLeft, Save, Plus, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const CATEGORIES = ['Stretch', 'Mobility', 'Recovery', 'Breathwork', 'Rest'];
const TIMES = ['Morning', 'Pre-Workout', 'Post-Workout', 'Evening'];

export default function TrackBuilder() {
  const { id } = useParams();
  const patient = mockPatients.find(p => p.id === id) || mockPatients[0];
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Controlled Articular Rotations', category: 'Mobility', time: 'Morning', isRequired: true, duration: '5 min' },
    { id: '2', title: 'Shoulder Activation', category: 'Mobility', time: 'Pre-Workout', isRequired: true, duration: '8 min' }
  ]);

  const addTask = () => {
    const newTask = {
      id: Math.random().toString(),
      title: 'New Task',
      category: 'Stretch',
      time: 'Morning',
      isRequired: true,
      duration: '5 min'
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  return (
    <div className="main-container">
      <Sidebar />
      <main className="content-area fade-in">
        <header style={{ marginBottom: '32px' }}>
          <Link href={`/clients/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)', marginBottom: '16px' }}>
            <ArrowLeft size={16} /> Back to Client Profile
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Recovery Track Builder</h1>
              <p className="stat-label">Designing plan for {patient.full_name}</p>
            </div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={18} /> Save Track
            </button>
          </div>
        </header>

        <section className="layout-grid">
          <div className="card">
            <h3 style={{ marginBottom: '24px' }}>Daily Tasks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', backgroundColor: '#f9fafb', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="text" 
                      defaultValue={task.title} 
                      style={{ fontSize: '1rem', fontWeight: 700, width: '100%', border: 'none', background: 'transparent', marginBottom: '8px', outline: 'none' }} 
                    />
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <select style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {CATEGORIES.map(c => <option key={c} selected={c === task.category}>{c}</option>)}
                      </select>
                      <select style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {TIMES.map(t => <option key={t} selected={t === task.time}>{t}</option>)}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                        <Clock size={12} />
                        <input type="text" defaultValue={task.duration} style={{ width: '50px', border: 'none', background: 'transparent', outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={task.isRequired} style={{ width: '16px', height: '16px' }} />
                      Required
                    </label>
                    <button onClick={() => removeTask(task.id)} style={{ color: 'var(--error)', padding: '4px' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={addTask}
              style={{ width: '100%', marginTop: '24px', padding: '16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--muted)', fontWeight: 600 }}
            >
              <Plus size={18} /> Add Task
            </button>
          </div>

          <div className="card" style={{ background: 'var(--accent-muted)' }}>
            <h3 style={{ marginBottom: '16px' }}>Track Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Track Title</label>
                <input type="text" defaultValue="Post-Surgical Phase 2" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Start Date</label>
                <input type="date" defaultValue="2024-04-05" style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Estimated Weekly Adherence</span>
                  <span style={{ fontWeight: 700 }}>88%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '88%', height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
