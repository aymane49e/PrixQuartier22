/* src/components/ManagersPanel.jsx */
import React, { useState, useEffect } from 'react';
import {
  Shield, Users, UserCheck, UserX, Search, Plus, Edit2,
  Trash2, X, Eye, MapPin, Phone, Mail, Calendar, Activity,
  Loader2, AlertCircle, Info, ChevronRight, Clock, TrendingUp
} from 'lucide-react';
import {
  getManagers, addManager, updateManager, deleteManager, getRecentActivities
} from '../data/services/managerService';

/* ─────────────────────────────── helpers ─────────────────────────────── */
const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
};

const ROLE_CONFIG = {
  'Administrateur': { color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe', dot: '#8b5cf6' },
  'Superviseur':    { color: '#1d4ed8', bg: '#eff6ff', border: '#dbeafe', dot: '#3b82f6' },
  'Validateur':     { color: '#b45309', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  'Modérateur':     { color: '#065f46', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
};

const VILLES = ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès', 'Agadir', 'Oujda', 'Kénitra'];
const ROLES  = ['Modérateur', 'Validateur', 'Superviseur', 'Administrateur'];

/* avatar gradient pools */
const AVATAR_GRADIENTS = [
  ['#10b981', '#059669'], ['#3b82f6', '#2563eb'], ['#8b5cf6', '#7c3aed'],
  ['#f59e0b', '#d97706'], ['#ef4444', '#dc2626'], ['#06b6d4', '#0891b2'],
];
const avatarGradient = (name) => {
  const i = (name || '').charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[i];
};

/* ─────────────────────────── StatCard ─────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, color, bg, loading }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #f1f5f9',
    borderRadius: 20,
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 6px rgba(15,23,42,.06)',
    transition: 'box-shadow .25s, transform .25s',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(15,23,42,.06)'; e.currentTarget.style.transform = 'none'; }}
  >
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color: loading ? '#e2e8f0' : color, lineHeight: 1, transition: 'color .3s' }}>
        {loading ? '—' : value}
      </p>
    </div>
    <div style={{ width: 52, height: 52, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
  </div>
);

/* ─────────────────────────── RoleBadge ─────────────────────────────────── */
const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG['Modérateur'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 9999, border: `1px solid ${cfg.border}`,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {role}
    </span>
  );
};

/* ─────────────────────────── StatusBadge ───────────────────────────────── */
const StatusBadge = ({ statut }) => {
  const isActive = statut === 'Actif';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 9999,
      background: isActive ? '#ecfdf5' : '#fff1f2',
      border: `1px solid ${isActive ? '#bbf7d0' : '#fecdd3'}`,
      color: isActive ? '#065f46' : '#9f1239',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isActive ? '#10b981' : '#f43f5e',
        boxShadow: isActive ? '0 0 0 2px #d1fae5' : 'none',
        animation: isActive ? 'pulse 2s infinite' : 'none',
      }} />
      {statut}
    </span>
  );
};

/* ─────────────────────────── AvatarCell ────────────────────────────────── */
const AvatarCell = ({ manager }) => {
  const [from, to] = avatarGradient(manager.nom);
  const initials = getInitials(manager.nom);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,.12)',
      }}>
        {manager.photo_url ? (
          <img src={manager.photo_url} alt={manager.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${from}, ${to})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 800,
          }}>
            {initials}
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: 1.3 }}>{manager.nom}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>
          #{manager.id.substring(0, 8).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────── FormField ─────────────────────────────────── */
const FormField = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle = {
  padding: '10px 14px',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 13,
  color: '#1e293b',
  outline: 'none',
  transition: 'border .2s, box-shadow .2s',
  width: '100%',
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export const ManagersPanel = () => {
  const [managers, setManagers]         = useState([]);
  const [activities, setActivities]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('all');

  const [isFormOpen, setIsFormOpen]         = useState(false);
  const [isDetailsOpen, setIsDetailsOpen]   = useState(false);
  const [isDeleteOpen, setIsDeleteOpen]     = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [managerToDelete, setManagerToDelete] = useState(null);

  const [nom, setNom]           = useState('');
  const [email, setEmail]       = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille]       = useState('Casablanca');
  const [role, setRole]         = useState('Modérateur');
  const [statut, setStatut]     = useState('Actif');
  const [photoUrl, setPhotoUrl] = useState('');

  /* fetch */
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const [mData, aData] = await Promise.all([
          getManagers(search, roleFilter),
          getRecentActivities(),
        ]);
        setManagers(mData);
        setActivities(aData);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const refresh = async () => {
    const [mData, aData] = await Promise.all([
      getManagers(search, roleFilter),
      getRecentActivities(),
    ]);
    setManagers(mData);
    setActivities(aData);
  };

  /* stats */
  const total    = managers.length;
  const actifs   = managers.filter(m => m.statut === 'Actif').length;
  const inactifs = managers.filter(m => m.statut === 'Inactif').length;

  /* form helpers */
  const openAdd = () => {
    setEditingManager(null);
    setNom(''); setEmail(''); setTelephone('');
    setVille('Casablanca'); setRole('Modérateur'); setStatut('Actif'); setPhotoUrl('');
    setIsFormOpen(true);
  };
  const openEdit = (m) => {
    setEditingManager(m);
    setNom(m.nom); setEmail(m.email); setTelephone(m.telephone || '');
    setVille(m.ville); setRole(m.role); setStatut(m.statut); setPhotoUrl(m.photo_url || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom || !email) return;
    setActionLoading(true);
    try {
      const data = { nom, email, telephone, ville, role, statut, photo_url: photoUrl };
      editingManager ? await updateManager(editingManager.id, data) : await addManager(data);
      await refresh();
      setIsFormOpen(false);
    } catch (err) { console.error(err); alert('Erreur enregistrement'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!managerToDelete) return;
    setActionLoading(true);
    try {
      await deleteManager(managerToDelete.id);
      await refresh();
      setIsDeleteOpen(false);
      setManagerToDelete(null);
    } catch (err) { console.error(err); alert('Erreur suppression'); }
    finally { setActionLoading(false); }
  };

  /* ── render ── */
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* ── HERO HEADER ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, hsl(156,72%,38%) 0%, hsl(160,70%,28%) 100%)',
        borderRadius: 24, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 12px 40px rgba(16,185,129,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div style={{
            width: 54, height: 54, borderRadius: 18,
            background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,.25)',
          }}>
            <Shield size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-.01em' }}>
              Gestionnaires
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: 500, margin: '4px 0 0' }}>
              Modérateurs · Validateurs · Superviseurs · Administrateurs
            </p>
          </div>
        </div>

        <button
          onClick={openAdd}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 12,
            background: 'rgba(255,255,255,.95)', color: 'hsl(156,72%,30%)',
            fontSize: 13, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,.15)',
            transition: 'transform .2s, box-shadow .2s',
            position: 'relative',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.15)'; }}
        >
          <Plus size={16} />
          Ajouter un gestionnaire
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 16 }}>
        <StatCard label="Total Gestionnaires" value={total}    icon={Users}      color="#1e293b"  bg="#f1f5f9" loading={loading} />
        <StatCard label="Actifs"              value={actifs}   icon={UserCheck}  color="#059669"  bg="#ecfdf5" loading={loading} />
        <StatCard label="Inactifs"            value={inactifs} icon={UserX}      color="#e11d48"  bg="#fff1f2" loading={loading} />
      </div>

      {/* ── TOOLBAR ────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18,
        padding: '14px 20px', display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', gap: 12,
        boxShadow: '0 1px 6px rgba(15,23,42,.05)',
      }}>
        {/* search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, ville…"
            style={{ ...inputStyle, paddingLeft: 38, width: '100%' }}
            onFocus={e => { e.target.style.border = '1.5px solid hsl(156,72%,38%)'; e.target.style.boxShadow = '0 0 0 3px hsla(156,72%,38%,.12)'; }}
            onBlur={e  => { e.target.style.border = '1.5px solid #e2e8f0'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* role pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...ROLES].map(r => {
            const active = roleFilter === r;
            return (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 9,
                border: `1.5px solid ${active ? 'hsl(156,72%,38%)' : '#e2e8f0'}`,
                background: active ? 'hsl(156,72%,96%)' : '#fff',
                color: active ? 'hsl(156,72%,32%)' : '#64748b',
                cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap',
              }}>
                {r === 'all' ? 'Tous' : r}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
        boxShadow: '0 1px 6px rgba(15,23,42,.05)', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Loader2 size={36} color="hsl(156,72%,38%)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Chargement depuis Supabase…</span>
          </div>
        ) : managers.length === 0 ? (
          <div style={{ padding: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={28} color="#cbd5e1" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#475569', fontSize: 15 }}>Aucun gestionnaire trouvé</p>
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Modifiez votre recherche ou ajoutez un nouveau compte.</p>
            </div>
            <button onClick={openAdd} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 10,
              background: 'hsl(156,72%,38%)', color: '#fff',
              fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
            }}>
              <Plus size={14} /> Créer un gestionnaire
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['Profil', 'Email · Téléphone', 'Rôle', 'Ville', 'Statut', 'Créé le', 'Actions'].map((h, i) => (
                    <th key={h} style={{
                      padding: '14px 20px', fontSize: 11, fontWeight: 700,
                      color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em',
                      textAlign: i === 6 ? 'right' : 'left', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {managers.map((m, idx) => (
                  <tr key={m.id}
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'hsl(156,72%,98%)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <AvatarCell manager={m} />
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', fontWeight: 600 }}>
                          <Mail size={12} color="#94a3b8" /> {m.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
                          <Phone size={12} color="#94a3b8" /> {m.telephone || '—'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <RoleBadge role={m.role} />
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                        <MapPin size={13} color="#94a3b8" /> {m.ville}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <StatusBadge statut={m.statut} />
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                        <Calendar size={12} color="#94a3b8" />
                        {new Date(m.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <ActionBtn icon={Eye}   title="Voir"      onClick={() => { setSelectedManager(m); setIsDetailsOpen(true); }} color="#64748b" hoverBg="#f1f5f9" />
                        <ActionBtn icon={Edit2} title="Modifier"  onClick={() => openEdit(m)}                                         color="hsl(156,72%,35%)" hoverBg="hsl(156,72%,96%)" />
                        <ActionBtn icon={Trash2} title="Supprimer" onClick={() => { setManagerToDelete(m); setIsDeleteOpen(true); }}  color="#e11d48" hoverBg="#fff1f2" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* footer row count */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                {managers.length} résultat{managers.length > 1 ? 's' : ''} affiché{managers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIVITÉS RÉCENTES ─────────────────────────────────────────── */}
      <div style={{
        background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
        boxShadow: '0 1px 6px rgba(15,23,42,.05)', overflow: 'hidden',
      }}>
        {/* header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'hsl(156,72%,95%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="hsl(156,72%,38%)" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>Activités récentes</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>Dernières mises à jour des comptes gestionnaires</p>
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#64748b',
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '4px 10px',
          }}>
            5 derniers
          </span>
        </div>

        <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {loading ? (
            <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={22} color="hsl(156,72%,38%)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : activities.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>Aucune activité récente.</p>
          ) : (
            activities.map((act, i) => {
              const isActive = act.status === 'Actif';
              const isLast = i === activities.length - 1;
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  paddingBottom: isLast ? 0 : 16, marginBottom: isLast ? 0 : 16,
                  borderBottom: isLast ? 'none' : '1px dashed #f1f5f9',
                }}>
                  {/* timeline dot */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: isActive ? 'hsl(156,72%,95%)' : '#fff1f2',
                      border: `1px solid ${isActive ? 'hsl(156,72%,85%)' : '#fecdd3'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Shield size={15} color={isActive ? 'hsl(156,72%,38%)' : '#e11d48'} />
                    </div>
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    <p style={{ fontSize: 13, color: '#475569', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                      {act.description}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 5,
                      fontSize: 11, color: '#94a3b8', fontWeight: 600,
                    }}>
                      <Clock size={11} /> {act.time}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ══════════════════ MODAL FORM ══════════════════════════════════ */}
      <ModalShell open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth={560}>
        {/* header */}
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'hsl(156,72%,95%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} color="hsl(156,72%,38%)" />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {editingManager ? 'Modifier le compte' : 'Nouveau gestionnaire'}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                {editingManager ? `Modification de ${editingManager.nom}` : 'Remplissez les informations ci-dessous'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(false)} style={closeBtn}>
            <X size={16} />
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 26px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FormField label="Nom complet *">
              <input style={inputStyle} type="text" required value={nom} onChange={e => setNom(e.target.value)} placeholder="Mohamed Alami"
                onFocus={e => Object.assign(e.target.style, { border: '1.5px solid hsl(156,72%,38%)', boxShadow: '0 0 0 3px hsla(156,72%,38%,.1)' })}
                onBlur={e  => Object.assign(e.target.style, { border: '1.5px solid #e2e8f0', boxShadow: 'none' })} />
            </FormField>
            <FormField label="Email *">
              <input style={inputStyle} type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="m.alami@prixquartier.ma"
                onFocus={e => Object.assign(e.target.style, { border: '1.5px solid hsl(156,72%,38%)', boxShadow: '0 0 0 3px hsla(156,72%,38%,.1)' })}
                onBlur={e  => Object.assign(e.target.style, { border: '1.5px solid #e2e8f0', boxShadow: 'none' })} />
            </FormField>
            <FormField label="Téléphone">
              <input style={inputStyle} type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+212 6XX-XXXXXX"
                onFocus={e => Object.assign(e.target.style, { border: '1.5px solid hsl(156,72%,38%)', boxShadow: '0 0 0 3px hsla(156,72%,38%,.1)' })}
                onBlur={e  => Object.assign(e.target.style, { border: '1.5px solid #e2e8f0', boxShadow: 'none' })} />
            </FormField>
            <FormField label="Ville">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={ville} onChange={e => setVille(e.target.value)}>
                {VILLES.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Rôle">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={role} onChange={e => setRole(e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Statut">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={statut} onChange={e => setStatut(e.target.value)}>
                <option>Actif</option>
                <option>Inactif</option>
              </select>
            </FormField>
          </div>

          <FormField label="URL Photo de profil (optionnel)">
            <input style={inputStyle} type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://…/avatar.jpg"
              onFocus={e => Object.assign(e.target.style, { border: '1.5px solid hsl(156,72%,38%)', boxShadow: '0 0 0 3px hsla(156,72%,38%,.1)' })}
              onBlur={e  => Object.assign(e.target.style, { border: '1.5px solid #e2e8f0', boxShadow: 'none' })} />
          </FormField>

          {/* footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 8, borderTop: '1px solid #f1f5f9', marginTop: 4 }}>
            <button type="button" onClick={() => setIsFormOpen(false)} style={secondaryBtn}>Annuler</button>
            <button type="submit" disabled={actionLoading} style={primaryBtn(actionLoading)}>
              {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {editingManager ? 'Enregistrer' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </ModalShell>

      {/* ══════════════════ MODAL DÉTAILS ═══════════════════════════════ */}
      <ModalShell open={isDetailsOpen && !!selectedManager} onClose={() => setIsDetailsOpen(false)} maxWidth={440}>
        {selectedManager && (() => {
          const [from, to] = avatarGradient(selectedManager.nom);
          return (
            <>
              {/* coloured top strip */}
              <div style={{ height: 80, background: `linear-gradient(135deg, ${from}, ${to})`, borderRadius: '16px 16px 0 0', position: 'relative' }}>
                <button onClick={() => setIsDetailsOpen(false)} style={{ ...closeBtn, position: 'absolute', right: 12, top: 12, background: 'rgba(255,255,255,.2)', color: '#fff', border: 'none' }}>
                  <X size={15} />
                </button>
                {/* avatar */}
                <div style={{
                  position: 'absolute', bottom: -26, left: 24,
                  width: 54, height: 54, borderRadius: 16, overflow: 'hidden',
                  border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                }}>
                  {selectedManager.photo_url
                    ? <img src={selectedManager.photo_url} alt={selectedManager.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${from},${to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                        {getInitials(selectedManager.nom)}
                      </div>
                  }
                </div>
              </div>

              {/* body */}
              <div style={{ padding: '38px 24px 24px' }}>
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>{selectedManager.nom}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RoleBadge role={selectedManager.role} />
                    <StatusBadge statut={selectedManager.statut} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: Mail,     label: 'Email',      value: selectedManager.email },
                    { icon: Phone,    label: 'Téléphone',  value: selectedManager.telephone || '—' },
                    { icon: MapPin,   label: 'Ville',      value: selectedManager.ville },
                    { icon: Calendar, label: 'Intégré le', value: new Date(selectedManager.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={15} color="#94a3b8" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: 0 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <button onClick={() => { setIsDetailsOpen(false); openEdit(selectedManager); }} style={primaryBtn(false)}>
                    <Edit2 size={13} /> Modifier
                  </button>
                  <button onClick={() => setIsDetailsOpen(false)} style={secondaryBtn}>Fermer</button>
                </div>
              </div>
            </>
          );
        })()}
      </ModalShell>

      {/* ══════════════════ MODAL DELETE ════════════════════════════════ */}
      <ModalShell open={isDeleteOpen && !!managerToDelete} onClose={() => setIsDeleteOpen(false)} maxWidth={400}>
        {managerToDelete && (
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Trash2 size={20} color="#e11d48" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: 0 }}>Supprimer le compte</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>Cette action est irréversible</p>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 20, border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 13, color: '#475569', fontWeight: 500, margin: 0, lineHeight: 1.6 }}>
                Vous allez supprimer définitivement le compte de{' '}
                <strong style={{ color: '#1e293b' }}>{managerToDelete.nom}</strong>.
                Toutes ses données et affectations seront perdues.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { setIsDeleteOpen(false); setManagerToDelete(null); }} style={secondaryBtn}>Annuler</button>
              <button disabled={actionLoading} onClick={handleDelete} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 20px', borderRadius: 10,
                background: '#e11d48', color: '#fff',
                fontSize: 13, fontWeight: 700, border: 'none', cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? .6 : 1, transition: 'opacity .2s',
              }}>
                {actionLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
};

/* ─── shared button styles ─── */
const secondaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 18px', borderRadius: 10,
  background: '#fff', color: '#475569',
  fontSize: 13, fontWeight: 700,
  border: '1.5px solid #e2e8f0', cursor: 'pointer',
};
const primaryBtn = (loading) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '9px 20px', borderRadius: 10,
  background: 'hsl(156,72%,38%)', color: '#fff',
  fontSize: 13, fontWeight: 700, border: 'none',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? .7 : 1, transition: 'opacity .2s, box-shadow .2s',
});
const closeBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 9,
  background: '#f8fafc', border: '1px solid #f1f5f9',
  color: '#64748b', cursor: 'pointer',
};

/* ─── tiny ActionBtn ─── */
const ActionBtn = ({ icon: Icon, title, onClick, color, hoverBg }) => (
  <button title={title} onClick={onClick} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 32, height: 32, borderRadius: 8,
    border: '1px solid #f1f5f9', background: '#fff',
    cursor: 'pointer', transition: 'background .15s, color .15s', color,
  }}
    onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
  >
    <Icon size={14} />
  </button>
);

/* ─── Modal shell (backdrop + card) ─── */
const ModalShell = ({ open, onClose, children, maxWidth = 520 }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          boxShadow: '0 32px 80px rgba(15,23,42,.20)',
          width: '100%', maxWidth,
          animation: 'modalIn .3s cubic-bezier(.34,1.56,.64,1)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(.92) translateY(16px); } to { opacity:1; transform:scale(1); } }
        @keyframes spin    { to   { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.4);} 50%{box-shadow:0 0 0 4px rgba(16,185,129,0);} }
      `}</style>
    </div>
  );
};
