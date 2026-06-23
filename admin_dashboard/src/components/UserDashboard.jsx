/* src/components/UserDashboard.jsx */
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { AddPriceForm } from './AddPriceForm';
import { UserHome } from './UserHome';
import { UserProfile } from './UserProfile';
import { supabase } from '../data/services/supabaseClient';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const UserDashboard = ({ userName }) => {
  const { adminUser } = useAuth();
  const [activeTab, setActiveTab] = useState('accueil');
  const [myPrices, setMyPrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Fetch the user's own contributions from Supabase
  const fetchMyPrices = async () => {
    if (!adminUser?.email) return;
    setLoadingPrices(true);
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select(`
          id,
          submitted_price,
          status,
          created_at,
          store_name,
          products (name)
        `)
        .eq('submitted_by', adminUser.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyPrices(data || []);
    } catch (error) {
      console.error('Error fetching user prices:', error);
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'prices') {
      fetchMyPrices();
    }
  }, [activeTab, adminUser]);

  return (
    <div className="dashboard-layout" style={{ display: 'flex' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="Utilisateur" />
      
      <main className="dashboard-viewport" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        {activeTab === 'accueil' && (
          <UserHome userName={userName} setActiveTab={setActiveTab} />
        )}
        
        {activeTab === 'ajouter' && (
          <AddPriceForm />
        )}

        {activeTab === 'prices' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>Mes prix partagés</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Historique de vos contributions citoyennes.
                </p>
              </div>
              <button 
                onClick={fetchMyPrices} 
                className="demo-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={14} className={loadingPrices ? 'spin-animation' : ''} />
                <span>Actualiser</span>
              </button>
            </div>

            {loadingPrices ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
              </div>
            ) : myPrices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertCircle size={32} />
                <span>Vous n'avez pas encore partagé de prix. Commencez dès maintenant !</span>
                <button 
                  onClick={() => setActiveTab('ajouter')}
                  className="btn-primary"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    marginTop: '8px'
                  }}
                >
                  Ajouter un prix
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Magasin / Marché</th>
                      <th>Prix soumis</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myPrices.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700 }}>{item.products?.name || 'Produit inconnu'}</td>
                        <td>{item.store_name || 'Marché local'}</td>
                        <td style={{ fontWeight: 800 }}>{item.submitted_price?.toFixed(2)} MAD</td>
                        <td>{item.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR') : 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${
                            item.status?.toLowerCase().includes('attente') || item.status === 'pending'
                              ? 'badge-pending'
                              : item.status?.toLowerCase().includes('valid') || item.status === 'approved'
                              ? 'badge-approved'
                              : 'badge-rejected'
                          }`}>
                            {item.status || 'En attente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profil' && (
          <UserProfile />
        )}
      </main>
    </div>
  );
};