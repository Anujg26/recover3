import Link from 'next/link';
import { Home, Users, Calendar, Settings, BarChart2, Zap } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Recover<span>3</span></h1>
      </div>
      <nav className="sidebar-nav">
        <Link href="/" className="nav-item active">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/clients" className="nav-item">
          <Users size={20} />
          <span>Clients</span>
        </Link>
        <Link href="/sessions" className="nav-item">
          <Calendar size={20} />
          <span>Sessions</span>
        </Link>
        <Link href="/analytics" className="nav-item">
          <BarChart2 size={20} />
          <span>Analytics</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: var(--primary);
          color: white;
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 48px;
          padding-left: 12px;
        }
        .logo span {
          color: var(--accent);
        }
        .sidebar-nav {
          flex: 1;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          color: #a0aec0;
          margin-bottom: 4px;
          transition: all 0.2s;
        }
        .nav-item:hover, .nav-item.active {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .nav-item.active {
          background: var(--accent);
          color: var(--primary);
        }
        .sidebar-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
