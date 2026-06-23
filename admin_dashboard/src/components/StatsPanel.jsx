/* src/components/StatsPanel.jsx */
import React, { useState, useEffect } from 'react';
import {
  Users, Package, DollarSign, Shield,
  TrendingUp, BarChart2, PieChart, Activity,
  Loader2, ArrowUpRight, UserPlus, PackagePlus, Tag,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
} from 'recharts';
import {
  getGlobalStats,
  getPricesByMonth,
  getProductsByCategory,
  getUsersByCity,
  getTopProducts,
  getRecentActivity,
} from '../data/services/statsService';

/* ── colour palette ──────────────────────────────────────────────────────── */
const PRIMARY   = 'hsl(156,72%,38%)';
const COLORS    = [
  '#10b981','#3b82f6','#8b5cf6','#f59e0b',
  '#ef4444','#06b6d4','#ec4899','#84cc16',
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  n == null ? '—' : Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtPrice = (n) =>
  n == null ? '—' : `${fmt(n)} DH`;

/* ── sub-components ──────────────────────────────────────────────────────── */

/** Animated stat card */
const StatCard = ({ icon: Icon, label, value, sub, color, bg, loading }) => (
  <div style={{
    background: '#fff', borderRadius: 20, padding: '22px 24px',
    border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(15,23,42,.06)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'transform .25s, box-shadow .25s', cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(15,23,42,.10)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(15,23,42,.06)'; }}
  >
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      {loading
        ? <div style={{ height: 36, width: 80, borderRadius: 8, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
        : <p style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1, margin: 0 }}>{fmt(value)}</p>
      }
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 6 }}>{sub}</p>}
    </div>
    <div style={{ width: 54, height: 54, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
  </div>
);

/** Card wrapper for charts */
const ChartCard = ({ title, sub, icon: Icon, children, span = 1 }) => (
  <div style={{
    background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
    boxShadow: '0 1px 6px rgba(15,23,42,.05)', overflow: 'hidden',
    gridColumn: span > 1 ? `span ${span}` : undefined,
  }}>
    <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'hsl(156,72%,95%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={PRIMARY} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</p>
        {sub && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
    <div style={{ padding: '18px 22px 22px' }}>{children}</div>
  </div>
);

/** Loading skeleton */
const ChartSkeleton = ({ height = 260 }) => (
  <div style={{ height, borderRadius: 12, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', animation: 'shimmer 1.8s infinite', backgroundSize: '200% 100%' }} />
);

/** Custom Tooltip for Recharts */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(15,23,42,.12)' }}>
      {label && <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>}
      {payload.map(p => (
        <p key={p.dataKey} style={{ fontSize: 13, fontWeight: 700, color: p.color || PRIMARY, margin: '2px 0' }}>
          {p.name}: {p.value?.toLocaleString('fr-FR')}
        </p>
      ))}
    </div>
  );
};

/** Pie custom label */
const renderPieLabel = ({ name, percent }) =>
  percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

/** Activity type config */
const ACTIVITY_CFG = {
  user:    { icon: UserPlus,   bg: '#eff6ff', border: '#dbeafe', color: '#2563eb' },
  product: { icon: PackagePlus, bg: 'hsl(156,72%,95%)', border: 'hsl(156,72%,85%)', color: PRIMARY },
  price:   { icon: Tag,        bg: '#fefce8', border: '#fde68a', color: '#d97706' },
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export const StatsPanel = () => {
  const [globalStats,   setGlobalStats]   = useState(null);
  const [pricesByMonth, setPricesByMonth] = useState([]);
  const [byCategory,    setByCategory]    = useState([]);
  const [byCity,        setByCity]        = useState([]);
  const [topProducts,   setTopProducts]   = useState([]);
  const [activities,    setActivities]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [gs, pm, bc, bci, tp, act] = await Promise.all([
          getGlobalStats(),
          getPricesByMonth(),
          getProductsByCategory(),
          getUsersByCity(),
          getTopProducts(),
          getRecentActivity(),
        ]);
        setGlobalStats(gs);
        setPricesByMonth(pm);
        setByCategory(bc);
        setByCity(bci);
        setTopProducts(tp);
        setActivities(act);
      } catch (e) {
        console.error(e);
        setError('Erreur de chargement des données Supabase.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, hsl(220,80%,40%) 0%, hsl(250,70%,50%) 100%)',
        borderRadius: 24, padding: '28px 32px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        boxShadow: '0 12px 40px rgba(59,130,246,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', right: 90, bottom: -70, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />
        <div style={{
          width: 54, height: 54, borderRadius: 18,
          background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,.25)', flexShrink: 0,
        }}>
          <BarChart2 size={26} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Statistiques</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: 500, margin: '4px 0 0' }}>
            Tableau de bord analytique — données en temps réel depuis Supabase
          </p>
        </div>
      </div>

      {/* error banner */}
      {error && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, padding: '14px 18px', color: '#be123c', fontSize: 13, fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── GLOBAL STAT CARDS ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px,1fr))', gap: 16 }}>
        <StatCard icon={Users}      label="Utilisateurs"  value={globalStats?.totalUsers}    color="#2563eb"  bg="#eff6ff" loading={loading} sub="membres inscrits" />
        <StatCard icon={Package}    label="Produits"       value={globalStats?.totalProducts}  color={PRIMARY}  bg="hsl(156,72%,95%)" loading={loading} sub="catalogue complet" />
        <StatCard icon={DollarSign} label="Prix enregistrés" value={globalStats?.totalPrices} color="#d97706"  bg="#fefce8" loading={loading} sub="contributions validées" />
        <StatCard icon={Shield}     label="Gestionnaires" value={globalStats?.totalManagers}  color="#7c3aed"  bg="#f5f3ff" loading={loading} sub="équipe d'administration" />
      </div>

      {/* ── CHARTS ROW 1 : Area + Pie ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 20 }}>

        {/* Prix par mois */}
        <ChartCard title="Évolution des prix ajoutés" sub="12 derniers mois" icon={TrendingUp}>
          {loading ? <ChartSkeleton /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={pricesByMonth} margin={{ top: 5, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gradPrix" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={PRIMARY} stopOpacity={.25} />
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="prix" name="Prix" stroke={PRIMARY} strokeWidth={2.5} fill="url(#gradPrix)" dot={{ r: 3, fill: PRIMARY, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Produits par catégorie */}
        <ChartCard title="Produits par catégorie" sub="Répartition du catalogue" icon={PieChart}>
          {loading ? <ChartSkeleton /> : byCategory.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingTop: 80 }}>Aucune donnée disponible.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RechartsPie>
                <Pie
                  data={byCategory} cx="50%" cy="50%" outerRadius={95}
                  dataKey="value" label={renderPieLabel} labelLine={false}
                  stroke="none"
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(val) => <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{val}</span>}
                  iconSize={9} iconType="circle"
                />
              </RechartsPie>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── CHARTS ROW 2 : Bar city + Bar top-products ────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px,1fr))', gap: 20 }}>

        {/* Utilisateurs par ville */}
        <ChartCard title="Utilisateurs par rôle" sub="Répartition des rôles" icon={BarChart2}>
          {loading ? <ChartSkeleton height={280} /> : byCity.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingTop: 80 }}>Aucune donnée de rôle disponible.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCity} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} width={58} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" name="Utilisateurs" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {byCity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Top produits bar */}
        <ChartCard title="Top 10 produits" sub="Par nombre de contributions" icon={TrendingUp}>
          {loading ? <ChartSkeleton height={280} /> : topProducts.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', paddingTop: 80 }}>Aucune donnée disponible.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topProducts.slice(0, 8).map(p => ({ ...p, shortName: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name }))}
                margin={{ top: 5, right: 8, bottom: 40, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="shortName" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="consultations" name="Contributions" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {topProducts.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── TOP PRODUCTS TABLE ──────────────────────────────────────── */}
      <ChartCard title="Tableau des produits populaires" sub="Prix min / max / moyen par produit" icon={BarChart2}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 44, borderRadius: 10, background: '#f8fafc', animation: 'shimmer 1.8s infinite', backgroundSize: '200% 100%' }} />
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Aucun produit populaire pour l'instant.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                  {['#', 'Produit', 'Catégorie', 'Contributions', 'Prix min', 'Prix max', 'Prix moyen'].map((h, i) => (
                    <th key={h} style={{
                      padding: '10px 14px', fontSize: 11, fontWeight: 700,
                      color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em',
                      textAlign: i >= 3 ? 'right' : 'left', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={p.id}
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', color: '#94a3b8', fontWeight: 700, fontSize: 11 }}>
                      {idx === 0
                        ? <span style={{ fontSize: 16 }}>🥇</span>
                        : idx === 1
                          ? <span style={{ fontSize: 16 }}>🥈</span>
                          : idx === 2
                            ? <span style={{ fontSize: 16 }}>🥉</span>
                            : `#${idx + 1}`}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b', maxWidth: 180 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999,
                        background: 'hsl(156,72%,95%)', color: 'hsl(156,72%,32%)',
                        border: '1px solid hsl(156,72%,85%)',
                      }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#1e293b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ArrowUpRight size={12} color={PRIMARY} />
                        {p.consultations}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#10b981', fontWeight: 700 }}>{fmtPrice(p.minPrice)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>{fmtPrice(p.maxPrice)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <span style={{
                        background: '#eff6ff', color: '#2563eb',
                        borderRadius: 8, padding: '3px 10px', fontWeight: 800, fontSize: 12,
                      }}>{fmtPrice(p.avgPrice)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* ── ACTIVITÉS RÉCENTES ──────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(15,23,42,.05)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'hsl(156,72%,95%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color={PRIMARY} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>Activité récente</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Utilisateurs, produits et prix — triés par date</p>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 10px' }}>
            12 dernières
          </span>
        </div>

        <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <Loader2 size={22} color={PRIMARY} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : activities.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Aucune activité récente.</p>
          ) : (
            activities.map((act, i) => {
              const cfg = ACTIVITY_CFG[act.type] || ACTIVITY_CFG.price;
              const Icon = cfg.icon;
              const isLast = i === activities.length - 1;
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  paddingBottom: isLast ? 0 : 14, marginBottom: isLast ? 0 : 14,
                  borderBottom: isLast ? 'none' : '1px dashed #f1f5f9',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <p style={{ fontSize: 13, color: '#475569', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{act.text}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                      <Clock size={11} /> {act.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
      `}</style>
    </div>
  );
};
