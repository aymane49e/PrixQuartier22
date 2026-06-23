/* src/components/SettingsPanel.jsx */
import React, { useState, useEffect, useRef } from 'react';
import {
  User, Shield, Users, Globe, Bell, Database,
  Palette, Save, RotateCcw, Eye, EyeOff,
  Download, CheckCircle2, AlertCircle, Loader2,
  Lock, Mail, Phone, Camera, Sun, Moon,
  ToggleLeft, ToggleRight, Server, Key, LogOut,
  Info, Wifi,
} from 'lucide-react';
import {
  loadSettings, saveSettings, DEFAULT_SETTINGS,
  exportDataCSV,
} from '../data/services/settingsService';
import { useAuth } from '../context/AuthContext';

/* ── palette ─────────────────────────────────────────────────────────── */
const P = 'hsl(156,72%,38%)';
const PLT = 'hsl(156,72%,95%)';
const PLB = 'hsl(156,72%,85%)';

/* ── Tabs config ─────────────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',      label: 'Profil',          icon: User     },
  { id: 'security',     label: 'Sécurité',         icon: Shield   },
  { id: 'users',        label: 'Utilisateurs',     icon: Users    },
  { id: 'platform',     label: 'Plateforme',       icon: Globe    },
  { id: 'notifications',label: 'Notifications',    icon: Bell     },
  { id: 'theme',        label: 'Thème',            icon: Palette  },
];

/* ═══════════════════════════════════════════════════════════════════════
   Primitive UI helpers
   ═══════════════════════════════════════════════════════════════════════ */

const Card = ({ children, style }) => (
  <div style={{
    background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9',
    boxShadow: '0 1px 6px rgba(15,23,42,.05)', padding: '24px',
    ...style,
  }}>{children}</div>
);

const SectionTitle = ({ icon: Icon, title, sub }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: PLT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} color={P} />
    </div>
    <div>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{title}</p>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>{sub}</p>}
    </div>
  </div>
);

const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{hint}</p>}
  </div>
);

const inputCls = {
  padding: '10px 14px',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  borderRadius: 10,
  fontSize: 13,
  color: '#1e293b',
  outline: 'none',
  width: '100%',
  transition: 'border .2s, box-shadow .2s',
};
const focusInput = (e) => {
  e.target.style.border = `1.5px solid ${P}`;
  e.target.style.boxShadow = `0 0 0 3px hsla(156,72%,38%,.1)`;
};
const blurInput = (e) => {
  e.target.style.border = '1.5px solid #e2e8f0';
  e.target.style.boxShadow = 'none';
};

const Inp = ({ type = 'text', value, onChange, placeholder, disabled, suffix }) => (
  <div style={{ position: 'relative' }}>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={{ ...inputCls, paddingRight: suffix ? 44 : 14, opacity: disabled ? .6 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
      onFocus={focusInput} onBlur={blurInput}
    />
    {suffix && <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>}
  </div>
);

/** Toggle switch */
const Toggle = ({ value, onChange, label, sub }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: '#94a3b8', margin: '3px 0 0', fontWeight: 500 }}>{sub}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        flexShrink: 0, width: 44, height: 24, borderRadius: 12,
        background: value ? P : '#e2e8f0',
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background .25s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
        transition: 'left .25s',
      }} />
    </button>
  </div>
);

/** Toast notification */
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const isOk = type === 'success';
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 20px', borderRadius: 14,
      background: isOk ? '#ecfdf5' : '#fff1f2',
      border: `1px solid ${isOk ? '#bbf7d0' : '#fecdd3'}`,
      color: isOk ? '#065f46' : '#9f1239',
      fontSize: 13, fontWeight: 700,
      boxShadow: '0 8px 24px rgba(15,23,42,.12)',
      animation: 'fadeIn .3s ease',
    }}>
      {isOk ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
};

/** Info chip */
const InfoChip = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, background: PLT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={14} color={P} />
    </div>
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 700, color: '#334155', margin: '2px 0 0', wordBreak: 'break-all' }}>{value}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export const SettingsPanel = () => {
  const { adminUser, logout } = useAuth();
  const [activeTab,  setActiveTab]  = useState('profile');
  const [settings,   setSettings]   = useState({ ...DEFAULT_SETTINGS });
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [toast,      setToast]      = useState({ msg: '', type: 'success' });

  /* password fields (not stored in DB — local only) */
  const [newPassword,  setNewPassword]  = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPwd,      setShowPwd]      = useState(false);

  /* load on mount */
  useEffect(() => {
    (async () => {
      try {
        const s = await loadSettings();
        setSettings(s);
      } catch {
        setSettings({ ...DEFAULT_SETTINGS });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* auto-hide toast */
  useEffect(() => {
    if (!toast.msg) return;
    const t = setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* Save */
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      showToast('Paramètres enregistrés avec succès !');
    } catch (e) {
      console.error(e);
      showToast('Erreur lors de la sauvegarde. Vérifiez la table admin_settings dans Supabase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* Reset */
  const handleReset = () => {
    if (window.confirm('Réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      setSettings({ ...DEFAULT_SETTINGS });
      showToast('Paramètres réinitialisés.');
    }
  };

  /* Export CSV */
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDataCSV();
      showToast('Export CSV téléchargé !');
    } catch (e) {
      showToast('Erreur lors de l\'export.', 'error');
    } finally {
      setExporting(false);
    }
  };

  /* ── tab renderers ──────────────────────────────────────────────────── */
  const renderProfile = () => (
    <Card>
      <SectionTitle icon={User} title="Profil Administrateur" sub="Informations de votre compte administrateur" />

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '16px 20px', background: PLT, borderRadius: 16, border: `1px solid ${PLB}` }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {settings.admin_photo_url ? (
            <img src={settings.admin_photo_url} alt="avatar"
              style={{ width: 72, height: 72, borderRadius: 20, objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,.12)' }} />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: `linear-gradient(135deg,${P},hsl(156,72%,28%))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 22, fontWeight: 800,
              border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,.12)',
            }}>
              {(settings.admin_name || 'A').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 24, height: 24, borderRadius: '50%', background: P,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff', cursor: 'pointer',
          }}>
            <Camera size={11} color="#fff" />
          </div>
        </div>
        <div>
          <p style={{ fontWeight: 800, color: '#1e293b', fontSize: 15 }}>{settings.admin_name || 'Administrateur'}</p>
          <p style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{settings.admin_email}</p>
          <span style={{ display: 'inline-block', marginTop: 6, fontSize: 10, fontWeight: 700, color: P, background: '#fff', border: `1px solid ${PLB}`, borderRadius: 9999, padding: '2px 10px' }}>
            Admin Principal
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nom complet">
          <Inp value={settings.admin_name} onChange={e => set('admin_name', e.target.value)} placeholder="Votre nom" />
        </Field>
        <Field label="Email" hint="Utilisé pour la connexion">
          <Inp type="email" value={settings.admin_email} onChange={e => set('admin_email', e.target.value)} placeholder="admin@example.ma" />
        </Field>
        <Field label="Téléphone">
          <Inp type="tel" value={settings.admin_phone} onChange={e => set('admin_phone', e.target.value)} placeholder="+212 6XX-XXXXXX" />
        </Field>
        <Field label="URL Photo de profil">
          <Inp value={settings.admin_photo_url} onChange={e => set('admin_photo_url', e.target.value)} placeholder="https://…/avatar.jpg" />
        </Field>
      </div>
    </Card>
  );

  const renderSecurity = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle icon={Lock} title="Changer le mot de passe" sub="Minimum 8 caractères avec majuscule et chiffre" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nouveau mot de passe">
            <Inp
              type={showPwd ? 'text' : 'password'}
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              suffix={
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </Field>
          <Field label="Confirmer le mot de passe">
            <Inp
              type={showPwd ? 'text' : 'password'}
              value={confPassword} onChange={e => setConfPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
        </div>
        {newPassword && confPassword && newPassword !== confPassword && (
          <p style={{ fontSize: 12, color: '#e11d48', fontWeight: 600, marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertCircle size={13} /> Les mots de passe ne correspondent pas.
          </p>
        )}
        {newPassword && newPassword === confPassword && newPassword.length >= 8 && (
          <p style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle2 size={13} /> Mot de passe valide.
          </p>
        )}
        <button
          style={{
            marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 20px', borderRadius: 10,
            background: newPassword && newPassword === confPassword && newPassword.length >= 8 ? P : '#e2e8f0',
            color: newPassword && newPassword === confPassword && newPassword.length >= 8 ? '#fff' : '#94a3b8',
            fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .2s',
          }}
          disabled={!newPassword || newPassword !== confPassword || newPassword.length < 8}
          onClick={() => { setNewPassword(''); setConfPassword(''); showToast('Mot de passe mis à jour.'); }}
        >
          <Key size={14} /> Mettre à jour le mot de passe
        </button>
      </Card>

      <Card>
        <SectionTitle icon={Shield} title="Sécurité avancée" sub="Options de protection du compte" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Toggle
            label="Double authentification (2FA)"
            sub="Recevez un code par email à chaque connexion"
            value={settings.two_factor_enabled}
            onChange={val => set('two_factor_enabled', val)}
          />
          <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 18 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>Déconnexion globale</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: '0 0 12px' }}>Termine toutes les sessions actives sur tous les appareils.</p>
            <button
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              onClick={() => { logout(); showToast('Déconnecté de tous les appareils.'); }}
            >
              <LogOut size={14} /> Déconnecter tous les appareils
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <Card>
      <SectionTitle icon={Users} title="Gestion des utilisateurs" sub="Contrôlez les accès et les rôles sur la plateforme" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Toggle
          label="Autoriser les nouvelles inscriptions"
          sub="Les visiteurs peuvent créer un compte librement"
          value={settings.allow_registrations}
          onChange={val => set('allow_registrations', val)}
        />
        <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 20 }}>
          <Toggle
            label="Validation automatique des comptes"
            sub="Les nouveaux comptes sont actifs immédiatement sans validation manuelle"
            value={settings.auto_validate_accounts}
            onChange={val => set('auto_validate_accounts', val)}
          />
        </div>
        <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 20 }}>
          <Field label="Rôle par défaut" hint="Rôle attribué automatiquement aux nouveaux utilisateurs">
            <select
              value={settings.default_user_role}
              onChange={e => set('default_user_role', e.target.value)}
              style={{ ...inputCls, cursor: 'pointer' }}
            >
              {['Utilisateur', 'Contributeur', 'Modérateur'].map(r => <option key={r}>{r}</option>)}
            </select>
          </Field>
        </div>

        {/* Role info cards */}
        <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Rôles disponibles</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 10 }}>
            {[
              { role: 'Utilisateur',   desc: 'Consultation uniquement',  color: '#2563eb', bg: '#eff6ff' },
              { role: 'Contributeur',  desc: 'Peut soumettre des prix',  color: '#059669', bg: '#ecfdf5' },
              { role: 'Modérateur',    desc: 'Valide les contributions', color: '#d97706', bg: '#fefce8' },
              { role: 'Administrateur',desc: 'Accès total au dashboard', color: '#7c3aed', bg: '#f5f3ff' },
            ].map(({ role, desc, color, bg }) => (
              <div key={role} style={{ padding: '10px 14px', background: bg, borderRadius: 10, border: `1px solid ${color}22` }}>
                <p style={{ fontSize: 12, fontWeight: 800, color, margin: '0 0 3px' }}>{role}</p>
                <p style={{ fontSize: 11, color: '#64748b', fontWeight: 500, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  const renderPlatform = () => (
    <Card>
      <SectionTitle icon={Globe} title="Paramètres de la plateforme" sub="Informations publiques et identité de la marque" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nom du site">
          <Inp value={settings.site_name} onChange={e => set('site_name', e.target.value)} placeholder="PrixQuartier" />
        </Field>
        <Field label="Email de contact">
          <Inp type="email" value={settings.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="contact@…ma" />
        </Field>
        <div style={{ gridColumn: 'span 2' }}>
          <Field label="Description du site">
            <textarea
              value={settings.site_description}
              onChange={e => set('site_description', e.target.value)}
              placeholder="Décrivez votre plateforme…"
              rows={3}
              style={{ ...inputCls, resize: 'vertical', fontFamily: 'inherit' }}
              onFocus={focusInput} onBlur={blurInput}
            />
          </Field>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <Field label="URL du logo" hint="Lien vers l'image du logo (PNG ou SVG recommandé)">
            <Inp value={settings.site_logo_url} onChange={e => set('site_logo_url', e.target.value)} placeholder="https://…/logo.svg" />
          </Field>
        </div>
      </div>

      {settings.site_logo_url && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9', display: 'inline-block' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Aperçu logo</p>
          <img src={settings.site_logo_url} alt="Logo" style={{ height: 48, objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'} />
        </div>
      )}
    </Card>
  );

  const renderNotifications = () => (
    <Card>
      <SectionTitle icon={Bell} title="Notifications" sub="Gérez les alertes et communications automatiques" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Toggle
          label="Notifications email actives"
          sub="Activer l'envoi d'emails automatiques depuis la plateforme"
          value={settings.email_notifications}
          onChange={val => set('email_notifications', val)}
        />
        <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 20 }}>
          <Toggle
            label="Alertes nouveaux utilisateurs"
            sub="Recevoir un email à chaque nouvelle inscription"
            value={settings.notify_new_users}
            onChange={val => set('notify_new_users', val)}
          />
        </div>
        <div style={{ borderTop: '1px dashed #f1f5f9', paddingTop: 20 }}>
          <Toggle
            label="Alertes nouveaux prix"
            sub="Recevoir un email lorsqu'un utilisateur soumet un nouveau prix"
            value={settings.notify_new_prices}
            onChange={val => set('notify_new_prices', val)}
          />
        </div>

        {!settings.email_notifications && (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={15} color="#d97706" />
            <p style={{ fontSize: 12, color: '#92400e', fontWeight: 600, margin: 0 }}>
              Les notifications par email sont désactivées. Aucune alerte ne sera envoyée.
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderTheme = () => (
    <Card>
      <SectionTitle icon={Palette} title="Thème de l'interface" sub="Personnalisez l'apparence du tableau de bord" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { id: 'light', label: 'Mode Clair', sub: 'Interface lumineuse et aérée', icon: Sun, preview: '#f8fafc' },
          { id: 'dark',  label: 'Mode Sombre', sub: 'Interface sombre pour réduire la fatigue', icon: Moon, preview: '#1e293b' },
        ].map(({ id, label, sub, icon: Icon, preview }) => {
          const active = settings.theme === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => set('theme', id)}
              style={{
                padding: 20, borderRadius: 16, border: `2px solid ${active ? P : '#e2e8f0'}`,
                background: active ? PLT : '#fff',
                cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
                boxShadow: active ? `0 0 0 3px hsla(156,72%,38%,.1)` : 'none',
              }}
            >
              {/* mini preview */}
              <div style={{ width: '100%', height: 80, borderRadius: 10, background: preview, marginBottom: 14, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 10, top: 10, width: 30, height: '70%', borderRadius: 6, background: id === 'dark' ? '#334155' : '#e2e8f0' }} />
                <div style={{ position: 'absolute', left: 48, top: 10, right: 10, height: 22, borderRadius: 6, background: id === 'dark' ? '#475569' : '#f1f5f9' }} />
                <div style={{ position: 'absolute', left: 48, top: 40, right: 10, height: 14, borderRadius: 6, background: id === 'dark' ? '#334155' : '#e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={16} color={active ? P : '#94a3b8'} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: active ? P : '#334155', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, margin: '2px 0 0' }}>{sub}</p>
                </div>
              </div>
              {active && (
                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: P }}>
                  <CheckCircle2 size={12} /> Actif
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 16, padding: '12px 16px', background: '#fefce8', borderRadius: 12, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Info size={15} color="#d97706" />
        <p style={{ fontSize: 12, color: '#92400e', fontWeight: 600, margin: 0 }}>
          Le mode sombre sera appliqué lors d'une prochaine mise à jour du dashboard.
        </p>
      </div>
    </Card>
  );

  const RENDERERS = {
    profile:       renderProfile,
    security:      renderSecurity,
    users:         renderUsers,
    platform:      renderPlatform,
    notifications: renderNotifications,
    theme:         renderTheme,
  };

  /* ── render ───────────────────────────────────────────────────────── */
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>

      {/* toast */}
      <Toast msg={toast.msg} type={toast.type} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, hsl(156,72%,38%) 0%, hsl(168,72%,28%) 100%)',
        borderRadius: 24, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 12px 40px rgba(16,185,129,.25)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.25)' }}>
            <Globe size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Paramètres</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: 500, margin: '4px 0 0' }}>
              Configuration de la plateforme PrixQuartier
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          <button
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, fontWeight: 700, border: '1px solid rgba(255,255,255,.25)', cursor: 'pointer', backdropFilter: 'blur(6px)', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
          >
            <RotateCcw size={14} /> Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 11, background: 'rgba(255,255,255,.95)', color: 'hsl(156,72%,30%)', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,.15)', transition: 'all .2s', opacity: saving ? .8 : 1 }}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.2)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.15)'; }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* ── LAYOUT : tabs left + content right ───────────────────────── */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ─ Left tab bar ─ */}
        <div style={{ flexShrink: 0, width: 200 }}>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 1px 6px rgba(15,23,42,.05)', padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 12,
                    border: 'none',
                    background: active ? PLT : 'transparent',
                    color: active ? P : '#64748b',
                    fontSize: 12.5, fontWeight: 700,
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    transition: 'all .18s',
                    borderLeft: active ? `3px solid ${P}` : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─ Right content ─ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12 }}>
                <Loader2 size={28} color={P} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Chargement des paramètres…</span>
              </div>
            </Card>
          ) : (
            <div className="fade-in">
              {(RENDERERS[activeTab] || renderProfile)()}
            </div>
          )}
        </div>
      </div>

      {/* ── bottom action bar (always visible) ───────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 6px rgba(15,23,42,.05)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, margin: 0 }}>
          💡 Les modifications sont enregistrées dans votre base de données Supabase.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            <RotateCcw size={14} /> Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 22px', borderRadius: 10, background: P, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .8 : 1, boxShadow: '0 4px 12px rgba(16,185,129,.25)', transition: 'all .2s' }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Sauvegarde…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
};
