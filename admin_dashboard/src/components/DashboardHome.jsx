/* src/components/DashboardHome.jsx */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { KpiCard } from './Common/KpiCard';
import { LineChart, DonutChart } from './Common/SvgCharts';
import { Loader2 } from 'lucide-react';
import { getProducts, getContributions, getUsers } from '../data/services/productService';

export const DashboardHome = () => {
  const { adminUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ products: [], contributions: [], users: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, contributions, users] = await Promise.all([
          getProducts(),
          getContributions(),
          getUsers()
        ]);
        setData({ products, contributions, users });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} /></div>;
  }

  const { products, contributions, users } = data;
  const pendingContributions = contributions.filter(c => c.status === 'pending');
  
  const stats = {
    activeUsersCount: users.length,
    uniqueProductsCount: products.length,
    contributionsCount: contributions.length
  };

  const getMonthlyStats = () => {
    const counts = [0, 0, 0, 0, 0]; // زدنا صفراً إضافياً للخمسة أشهر
    contributions.forEach(c => {
      if (c.created_at) {
        const date = new Date(c.created_at);
        const month = date.getMonth(); 
        // الآن نسمح للمؤشر بالوصول حتى 4 (الذي يمثل شهر مايو)
        if (month >= 0 && month <= 4) {
          counts[month] = (counts[month] || 0) + 1;
        }
      }
    });
    return counts.map(num => (isNaN(num) ? 0 : num));
  };

  const chartData = getMonthlyStats();

  const getDistributionData = () => {
  const statusCounts = {
    'pending': 0,
    'approved': 0, 
    'rejected': 0
  };

  contributions.forEach(c => {
    if (statusCounts.hasOwnProperty(c.status)) {
      statusCounts[c.status]++;
    }
  });

  return [
    { name: 'En attente', value: statusCounts.pending, color: '#FBBF24' },
    { name: 'Approuvés', value: statusCounts.approved, color: '#10B981' },
    { name: 'Rejetés', value: statusCounts.rejected, color: '#EF4444' }
  ].filter(item => item.value > 0); 
};

const distributionData = getDistributionData();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>
          Espace Administrateur • Tableau de bord
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Bonjour, {adminUser?.name || 'Administrateur'} !
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <KpiCard title="Utilisateurs actifs" value={stats.activeUsersCount} />
        <KpiCard title="Produits uniques" value={stats.uniqueProductsCount} />
        <KpiCard title="Contributions totales" value={stats.contributionsCount}/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Évolution globale</span>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LineChart 
              data={chartData} 
              labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai']} // الآن الطول متطابق (5 عناصر)
              color="var(--primary)" 
            />
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
           <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Distribution</span>
           <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <DonutChart data={distributionData} />
           </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Modération rapide</h3>
        <table className="admin-table" style={{ width: '100%', marginTop: '20px' }}>
           <tbody>
             {pendingContributions.slice(0, 3).map(item => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.store}</td>
                  <td>{item.submittedPrice} MAD</td>
                  <td>{item.submittedBy}</td>
                  <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</td>
                </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};