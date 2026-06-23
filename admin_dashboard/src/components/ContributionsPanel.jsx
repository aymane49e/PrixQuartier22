/* src/components/ContributionsPanel.jsx */
import React, { useState, useEffect } from 'react';
import { Check, X, FileText, Loader2 } from 'lucide-react';
import { ConfirmModal } from './Common/ConfirmModal';
import { getContributions, updateContributionStatus, approveContribution } from '../data/services/productService';

export const ContributionsPanel = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Confirm Reject State
  const [contributionToReject, setContributionToReject] = useState(null);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // جلب البيانات من Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContributions();
        setContributions(data);
      } catch (error) {
        console.error("Erreur lors du chargement des contributions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

 const handleApprove = async (contribution) => {
  try {
    if (!contribution.product_id) {
       console.error("Product ID is missing!");
       return;
    }

    await approveContribution(
      contribution.id, 
      contribution.product_id,
      contribution.submitted_price
    );
    
    // تحديث الواجهة
    setContributions(contributions.map(c => 
      c.id === contribution.id ? { ...c, status: 'approved' } : c
    ));
    showToast("Contribution validée et prix mis à jour ! ✨", "success");
  } catch (error) {
    console.error("Erreur:", error);
    showToast("Une erreur est survenue lors de la validation.", "danger");
  }
};

  const handleRejectClick = (contribution) => {
    setContributionToReject(contribution);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
  if (contributionToReject) {
    try {
      await updateContributionStatus(contributionToReject.id, 'rejected');
      setContributions(contributions.map(c => 
        c.id === contributionToReject.id ? { ...c, status: 'rejected' } : c
      ));
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
    } finally {
      setIsConfirmRejectOpen(false);
      setContributionToReject(null);
    }
  }
};

  const filteredContributions = contributions.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
          Modération des contributions citoyennes
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Validez les prix partagés par les membres de la communauté pour maintenir une base de données de haute qualité.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-main)', padding: '4px', borderRadius: '12px', alignSelf: 'flex-start' }}>
        {['pending', 'approved', 'rejected', 'all'].map(status => {
          const labels = { pending: 'En attente', approved: 'Validés', rejected: 'Rejetés', all: 'Tous' };
          const isActive = filter === status;
          return (
            <button key={status} onClick={() => setFilter(status)} style={{
              fontSize: '0.8rem', fontWeight: 700, padding: '6px 16px', borderRadius: '8px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-card-solid)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s ease'
            }}>
              {labels[status]}
            </button>
          );
        })}
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Magasin</th>
              <th>Prix Soumis</th>
              <th>Contributeur</th>
              <th>Date de Saisie</th>
              <th>Statut</th>
              {filter === 'pending' && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredContributions.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FileText width="24" height="24" />
                    <span>Aucune contribution dans cette catégorie.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredContributions.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{item.productName}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.store}</td>
                  <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.submittedPrice?.toFixed(2)} MAD</td>
                  <td style={{ fontWeight: 600 }}>{item.submittedBy}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge badge-${item.status}`}>{item.status}</span>
                  </td>
                  {filter === 'pending' && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleApprove(item)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}>
                          <Check width="16" height="16" />
                        </button>
                        <button onClick={() => handleRejectClick(item)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                          <X width="16" height="16" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={isConfirmRejectOpen}
        onClose={() => { setIsConfirmRejectOpen(false); setContributionToReject(null); }}
        onConfirm={handleConfirmReject}
        title="Rejeter le signalement"
        message="Êtes-vous sûr de vouloir rejeter cette contribution de prix ?"
        itemName={contributionToReject ? `${contributionToReject.productName}` : ""}
        confirmText="Rejeter"
        cancelText="Annuler"
        type="danger"
      />

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: toast.type === 'success' ? 'var(--primary)' : 'var(--color-danger)',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease',
          fontWeight: 700,
          fontSize: '0.85rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};