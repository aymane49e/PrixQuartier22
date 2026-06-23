/* src/components/Sidebar.jsx */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  PlusCircle,
  User,
  Tag,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, role="Admin" }) => {
  const { adminUser, logout } = useAuth();

  const menuItems = role === 'Admin' ?
  [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'contributions', label: 'Contributions', icon: FileText },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'managers', label: 'Gestionnaires', icon: ShieldAlert },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]
  : [
        { id: 'accueil', label: 'Accueil', icon: Home },
        { id: 'ajouter', label: 'Ajouter un prix', icon: PlusCircle },
        { id: 'prices', label: 'Mes prix', icon: Tag },
        { id: 'profil', label: 'Mon Profil', icon: User },
      ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: '#f8fafc',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 20px',
      flexShrink: 0,
      height: '100vh',
      justifyContent: 'space-between'
    }}>
      {/* Top Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-dark)'
        }}>
          <ShoppingBag style={{ color: 'var(--primary)', width: '26px', height: '26px' }} />
          <span>PrixQuartier</span>
        </div>

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                  border: '1px solid transparent',
                  borderColor: isActive ? 'var(--primary-glow)' : 'transparent'
                }}
                className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
              >
                <Icon width="16" height="16" style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section (Admin info + Logout) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Admin profile snippet */}
        {adminUser && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid var(--primary-glow)',
            borderRadius: '14px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              overflow: 'hidden'
            }}>
              {adminUser.avatar && (adminUser.avatar.startsWith('http') || adminUser.avatar.startsWith('data:image')) ? (
                <img src={adminUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                adminUser.avatar
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminUser.name}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {adminUser.email}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--color-danger)',
            transition: 'all var(--transition-fast)',
            textAlign: 'left',
            width: '100%'
          }}
          className="sidebar-logout-btn"
        >
          <LogOut width="16" height="16" style={{ flexShrink: 0 }} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
