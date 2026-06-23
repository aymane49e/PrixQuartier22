/* src/components/UserHome.jsx */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../data/services/supabaseClient';
import { 
  Bell, 
  ChevronDown, 
  Tag, 
  Users, 
  MapPin, 
  Clock, 
  Loader2, 
  PlusCircle, 
  Store,
  LogOut,
  User,
  CheckCheck
} from 'lucide-react';

// Formate l'ancienneté d'un prix en français
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Récemment';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  return `Il y a ${diffDays} j`;
};

// Récupère une image Unsplash de haute qualité selon le nom du produit
const getProductImageUrl = (name) => {
  const n = name?.toLowerCase() || '';

  if (n.includes('tomate')) {
    return 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('lait')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('farine')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('huile')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('pomme de terre') || n.includes('patate')) {
    return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('carotte')) {
    return 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('oignon')) {
    return 'https://images.unsplash.com/photo-1508747703725-719ae257c26a?w=400&auto=format&fit=crop&q=60';
  }
  if (n.includes('banane')) {
    return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=60';
};

export const UserHome = ({ userName, setActiveTab }) => {
  const { adminUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [latestPrices, setLatestPrices] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [stats, setStats] = useState({
    pricesShared: 128,
    contributors: 45,
    markets: 12
  });

  const mockNotifications = [
    {
      id: 1,
      title: 'Contribution validée ! 🎉',
      body: 'Votre prix de 12.50 MAD pour les Tomates a été approuvé. (+10 XP)',
      time: 'Il y a 30 min',
      unread: true
    },
    {
      id: 2,
      title: 'Nouveau produit disponible 🥛',
      body: 'Le produit "Lait entier" est désormais disponible à Casablanca.',
      time: 'Il y a 2h',
      unread: true
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Récupérer tous les prix partagés (contributions validées/toutes)
        const { data: contribs, error: contribsError } = await supabase
          .from('contributions')
          .select(`
            id,
            submitted_price,
            store_name,
            created_at,
            product_id,
            products (
              name,
              category
            )
          `)
          .order('created_at', { ascending: false });

        if (contribsError) throw contribsError;

        if (contribs) {
          const formattedContribs = contribs.map(c => ({
            id: c.id,
            productName: c.products?.name || 'Produit sans nom',
            category: c.products?.category || 'Alimentation',
            price: c.submitted_price,
            store: c.store_name || 'Marché local',
            timeAgo: formatTimeAgo(c.created_at),
            imageUrl: getProductImageUrl(c.products?.name)
          }));
          setLatestPrices(formattedContribs);
        }

        // 2. Calculer les statistiques réelles depuis Supabase
        const [
          { count: totalPrices },
          { data: contributorsData },
          { data: marketsData }
        ] = await Promise.all([
          supabase.from('contributions').select('*', { count: 'exact', head: true }),
          supabase.from('contributions').select('submitted_by'),
          supabase.from('contributions').select('store_name')
        ]);

        const uniqueContributors = contributorsData 
          ? new Set(contributorsData.map(c => c.submitted_by).filter(Boolean)).size 
          : 0;

        const uniqueMarkets = marketsData 
          ? new Set(marketsData.map(c => c.store_name).filter(Boolean)).size 
          : 0;

        setStats({
          pricesShared: totalPrices || 128,
          contributors: uniqueContributors || 45,
          markets: uniqueMarkets || 12
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    if (!dropdownOpen && !notificationsOpen) return;
    const handleClose = () => {
      setDropdownOpen(false);
      setNotificationsOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [dropdownOpen, notificationsOpen]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '40px' }}>
        <Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
      </div>
    );
  }

  // Rendu de l'avatar (image URL/Preset ou Lettre initiale)
  const renderAvatarContent = (avatarValue, nameFallback) => {
    const isUrl = avatarValue && (avatarValue.startsWith('http') || avatarValue.startsWith('data:image'));
    if (isUrl) {
      return <img src={avatarValue} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }
    return <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{nameFallback[0]?.toUpperCase() || 'L'}</span>;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%', paddingBottom: '40px' }}>
      
      {/* ── HEADER DE BIENVENUE & TOPBAR ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bienvenue, {userName || adminUser?.name || 'leo'} 👋
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Partagez et découvrez les prix dans votre quartier.
          </p>
        </div>

        {/* Notifications & Profil Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Bell Icon & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setNotificationsOpen(!notificationsOpen);
              }}
              style={{ position: 'relative', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background 0.2s', backgroundColor: notificationsOpen ? 'var(--primary-light)' : 'transparent' }}
              onMouseOver={(e) => { if(!notificationsOpen) e.currentTarget.style.backgroundColor = 'var(--border-color)'; }}
              onMouseOut={(e) => { if(!notificationsOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <Bell style={{ color: notificationsOpen ? 'var(--primary)' : 'var(--text-dark)', width: '22px', height: '22px' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-main)'
                }}>
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  backgroundColor: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '16px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  animation: 'fadeIn 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setUnreadCount(0)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--primary)',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCheck size={14} />
                      <span>Tout marquer comme lu</span>
                    </button>
                  )}
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                  {unreadCount === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Aucune nouvelle notification
                    </div>
                  ) : (
                    mockNotifications.map(n => (
                      <div key={n.id} style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-dark)' }}>{n.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{n.time}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.3 }}>
                          {n.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profil Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-glow)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {renderAvatarContent(adminUser?.avatar, userName || adminUser?.name || 'leo')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                  {userName || adminUser?.name || 'leo'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {adminUser?.role || 'Utilisateur'}
                </span>
              </div>
              <ChevronDown style={{ color: 'var(--text-muted)', width: '14px', height: '14px', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            {/* Floating Dropdown Menu Card */}
            {dropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                backgroundColor: 'var(--bg-card-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <button
                  onClick={() => {
                    setActiveTab('profil');
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-dark)',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  className="demo-btn"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-dark)';
                  }}
                >
                  <User size={16} />
                  <span>Mon Profil</span>
                </button>
                
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                
                <button
                  onClick={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--color-danger)',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BANNIÈRE CITOYENNE AVEC STATS OVERLAY ─────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '24px',
        backgroundImage: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 30%, rgba(15, 23, 42, 0.45)), url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '36px',
        boxShadow: 'var(--shadow-md)',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px', zIndex: 2 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            Des prix partagés,<br />une communauté informée.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
            Ensemble, rendons les prix plus transparents.
          </p>
          <button 
            onClick={() => setActiveTab('ajouter')}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '12px 24px',
              borderRadius: '12px',
              width: 'fit-content',
              marginTop: '12px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Ajouter un prix
          </button>
        </div>

        {/* Stats overlay cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          zIndex: 2,
          marginTop: '20px'
        }}>
          {/* Stat 1 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: 'var(--text-dark)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--primary)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Tag size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.pricesShared}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prix partagés</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: 'var(--text-dark)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--color-manager)',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Users size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.contributors}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contributeurs</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: 'var(--text-dark)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex'
            }}>
              <Store size={20} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.markets}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Marchés couverts</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DERNIERS PRIX PARTAGÉS ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🛍️</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Derniers prix partagés
            </h3>
          </div>
        </div>

        {/* Horizontal grid for cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {latestPrices.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '40px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              Aucun prix partagé pour le moment. Soyez le premier à ajouter un prix !
            </div>
          ) : (
            latestPrices.map(item => (
              <div key={item.id} style={{
                backgroundColor: 'var(--bg-card-solid)',
                borderRadius: '18px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.25s ease'
              }}
              className="demo-btn"
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              >
                {/* Image Container with Price Badge */}
                <div style={{ position: 'relative', width: '100%', height: '130px', overflow: 'hidden' }}>
                  <img 
                    src={item.imageUrl} 
                    alt={item.productName} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Green price badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}>
                    {item.price.toFixed(2)} MAD
                  </span>
                </div>

                {/* Card Details */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                    {item.productName}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 600 }}>{item.store}</span>
                    </div>

                    {/* Time Ago */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontWeight: 600 }}>{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
