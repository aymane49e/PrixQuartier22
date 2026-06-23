/* src/components/UsersPanel.jsx */
import React, { useState, useEffect } from 'react';
import { Search, Shield, User, Award, Loader2 } from 'lucide-react';
import { getUsers } from '../data/services/productService'; 

export const UsersPanel = ({ title = "Membres de la communauté" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Gérez les habilitations, suivez les points de réputation et modérez les comptes utilisateurs de la plateforme.
        </p>
      </div>

      {/* Filter and Search actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          maxWidth: '360px',
          width: '100%'
        }}>
          <Search style={{
            position: 'absolute',
            left: '14px',
            color: 'var(--text-muted)',
            width: '16px',
            height: '16px'
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '10px 16px 10px 38px',
              fontSize: '0.85rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'Utilisateur', 'Gestionnaire'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                backgroundColor: roleFilter === role ? 'var(--primary-light)' : 'var(--bg-card-solid)',
                color: roleFilter === role ? 'var(--primary)' : 'var(--text-muted)',
                borderColor: roleFilter === role ? 'var(--primary-glow)' : 'var(--border-color)',
                transition: 'all 0.15s ease'
              }}
            >
              {role === 'all' ? 'Tous' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Rôle</th>
              <th>Contributions</th>
              <th>Points accumulés</th>
              <th style={{ textAlign: 'right' }}>Rang</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <span>Aucun membre ne correspond à votre filtre.</span>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{u.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: u.role === 'Gestionnaire' ? 'var(--color-manager-bg)' : 'var(--color-user-bg)',
                      color: u.role === 'Gestionnaire' ? 'var(--color-manager)' : 'var(--color-user)'
                    }}>
                      {u.role === 'Gestionnaire' ? <Shield width="12" height="12" /> : <User width="12" height="12" />}
                      <span>{u.role}</span>
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-dark)' }}>
                    {u.contributionsCount || 0} saisies
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--primary)' }}>
                      <Award width="14" height="14" />
                      <span>{u.reputationPoints || 0} pts</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};