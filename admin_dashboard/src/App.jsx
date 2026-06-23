import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { DashboardHome } from './components/DashboardHome';
import { ProductsPanel } from './components/ProductsPanel';
import { ContributionsPanel } from './components/ContributionsPanel';
import { UsersPanel } from './components/UsersPanel';
import { ManagersPanel } from './components/ManagersPanel';
import { StatsPanel } from './components/StatsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { Loader2 } from 'lucide-react';
import { getProducts } from './data/services/productService'; 
import { UserDashboard } from './components/UserDashboard';
import { UpdatePassword } from './components/UpdatePassword';

const MainAppContent = () => {
  const { adminUser, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [appLoading, setAppLoading] = useState(true);

  // التحقق من الرابط لعرض صفحة إعادة تعيين كلمة المرور
  if (window.location.pathname === '/update-password') {
    return <UpdatePassword />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodData = await getProducts();
        setProducts(prodData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setAppLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || appLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '48px', height: '48px' }} />
      </div>
    );
  }

  if (!adminUser) return <Login />;

  if (adminUser.role === 'Utilisateur') {
    return <UserDashboard userName={adminUser.name} />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="dashboard-viewport">
        {activeTab === 'dashboard' && <DashboardHome />}
        {activeTab === 'products' && <ProductsPanel products={products} setProducts={setProducts} />}
        {activeTab === 'contributions' && <ContributionsPanel />}
        {activeTab === 'users' && <UsersPanel title="Membres Citoyens" />}
        {activeTab === 'managers' && <ManagersPanel />}
        {activeTab === 'stats' && <StatsPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
};

function App() {
  return <AuthProvider><MainAppContent /></AuthProvider>;
}

export default App;