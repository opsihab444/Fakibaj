import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, LibraryBig, Activity } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
            backdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(10, 10, 15, 0.7)',
            borderBottom: '1px solid var(--glass-border)',
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '4rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        color: 'white'
                    }}>
                        <Activity size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }} className="text-gradient">
                        TrackMaster
                    </h1>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <NavLink
                        to="/"
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            transition: 'color 0.2s'
                        })}
                    >
                        <LibraryBig size={18} />
                        Subjects
                    </NavLink>

                    <NavLink
                        to="/dashboard"
                        style={({ isActive }) => ({
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            transition: 'color 0.2s'
                        })}
                    >
                        <LayoutDashboard size={18} />
                        Dashboard
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="container" style={{ flex: 1, padding: '2rem 1.5rem' }}>
                <Outlet />
            </main>
            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                borderTop: '1px solid var(--glass-border)'
            }}>
                <p>© 2026 TrackMaster. Built with premium aesthetics.</p>
            </footer>
        </div>
    );
};
