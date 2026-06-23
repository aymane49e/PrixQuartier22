/* src/components/UserProfile.jsx */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../data/services/supabaseClient';
import { User, Mail, Award, Save, Loader2, CheckCircle2, Shield, Lock, Eye, EyeOff } from 'lucide-react';

export const UserProfile = () => {
  const { adminUser, saveSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    reputation_points: 0,
    avatar_url: '',
    role: 'Utilisateur'
  });

  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // États pour le changement de mot de passe
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');

  // Liste d'avatars prédéfinis (illustrations d'utilisateurs modernes)
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!adminUser?.email) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, email, role, reputation_points')
          .ilike('email', adminUser.email)
          .single();

        if (error) throw error;

        // Charger l'avatar depuis localStorage
        const savedAvatar = localStorage.getItem(`pq_avatar_${adminUser.email}`) || '';

        if (data) {
          setProfileData({
            name: data.name || '',
            email: data.email || '',
            reputation_points: data.reputation_points || 0,
            avatar_url: savedAvatar,
            role: data.role || 'Utilisateur'
          });
          setSelectedAvatarPreset(savedAvatar);
        }
      } catch (err) {
        console.error('Erreur de chargement du profil :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [adminUser]);

  const handlePresetSelect = (url) => {
    setSelectedAvatarPreset(url);
    setProfileData(prev => ({ ...prev, avatar_url: url }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // 1. Mettre à jour uniquement le nom dans Supabase (car la colonne avatar_url n'existe pas dans la table users)
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name.trim()
        })
        .eq('email', adminUser.email);

      if (error) throw error;

      // 2. Sauvegarder l'avatar choisi localement dans localStorage
      localStorage.setItem(`pq_avatar_${adminUser.email}`, profileData.avatar_url);

      // 3. Mettre à jour la session locale
      const updatedUser = {
        ...adminUser,
        name: profileData.name.trim(),
        avatar: profileData.avatar_url || profileData.name.trim()[0].toUpperCase()
      };
      saveSession(updatedUser);

      setSuccessMsg('Votre profil a été mis à jour avec succès.');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du profil :', err);
      setErrorMsg('Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdSuccessMsg('');
    setPwdErrorMsg('');

    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdErrorMsg('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPwdSuccessMsg('Votre mot de passe a été modifié avec succès.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Erreur de changement de mot de passe :', err);
      setPwdErrorMsg(err.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '40px' }}>
        <Loader2 className="pulse-animation" style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
      </div>
    );
  }

  // Calcul du grade/niveau basé sur les points
  const getReputationBadge = (points) => {
    if (points >= 1000) return { title: 'Légende Locale 👑', color: '#8B5CF6' };
    if (points >= 500) return { title: 'Contributeur Élite 🌟', color: '#3B82F6' };
    if (points >= 100) return { title: 'Citoyen Actif 🥦', color: '#10B981' };
    return { title: 'Nouveau Citoyen 🌱', color: 'var(--text-muted)' };
  };

  const badge = getReputationBadge(profileData.reputation_points);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto', paddingBottom: '40px', width: '100%' }}>
      
      {/* En-tête */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-dark)' }}>Mon Profil Citoyen</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Gérez vos informations personnelles et suivez votre contribution.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          borderRadius: '16px',
          fontSize: '0.9rem',
          fontWeight: 700,
          border: '1px solid var(--primary-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger)',
          borderRadius: '16px',
          fontSize: '0.9rem',
          fontWeight: 700,
          border: '1px solid rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Col 1: Photo & Points */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card Avatar */}
          <div style={{
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                border: '3px solid var(--primary)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)',
                margin: '0 auto 12px auto'
              }}>
                {selectedAvatarPreset ? (
                  <img src={selectedAvatarPreset} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {profileData.name[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-dark)' }}>{profileData.name}</h3>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: badge.color,
                backgroundColor: `${badge.color}15`,
                padding: '4px 12px',
                borderRadius: '999px',
                marginTop: '6px',
                display: 'inline-block'
              }}>
                {badge.title}
              </span>
            </div>
          </div>

          {/* Card Gamification / Points */}
          <div style={{
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                color: '#FBBF24',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex'
              }}>
                <Award size={20} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                Score de réputation
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#FBBF24' }}>
                {profileData.reputation_points}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                XP
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4 }}>
              Gagnez des points en publiant des prix validés et en aidant votre communauté !
            </div>
          </div>

        </div>

        {/* Col 2: Infos & Changement Mot de Passe */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Formulaire Informations */}
          <form onSubmit={handleSave} style={{
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)' }}>
              Informations du compte
            </h3>

            {/* Nom */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Nom complet
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            {/* Email (Lecture seule) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Adresse Email
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Rôle (Lecture seule) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={14} /> Rôle
              </label>
              <input
                type="text"
                value={profileData.role}
                disabled
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Sélection d'avatars recommandés */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Choisissez un avatar recommandé
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {avatarPresets.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetSelect(url)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: selectedAvatarPreset === url ? 'var(--primary)' : 'transparent',
                      padding: 0,
                      boxShadow: 'var(--shadow-sm)',
                      transform: selectedAvatarPreset === url ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <img src={url} alt={`Preset ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                boxShadow: 'var(--shadow-glow)',
                transition: 'all 0.2s',
                marginTop: '10px'
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </form>

          {/* Formulaire Sécurisé Changement Mot de Passe */}
          <form onSubmit={handlePasswordChange} style={{
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} style={{ color: 'var(--primary)' }} />
              Sécurité et mot de passe
            </h3>

            {pwdSuccessMsg && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid var(--primary-glow)'
              }}>
                {pwdSuccessMsg}
              </div>
            )}

            {pwdErrorMsg && (
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid rgba(239, 68, 68, 0.1)'
              }}>
                {pwdErrorMsg}
              </div>
            )}

            {/* Nouveau Mot de passe */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 42px 12px 16px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: 'var(--text-dark)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-dark)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: changingPassword ? 'not-allowed' : 'pointer',
                opacity: changingPassword ? 0.7 : 1,
                boxShadow: 'var(--shadow-glow)',
                transition: 'all 0.2s',
                marginTop: '6px'
              }}
            >
              {changingPassword ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>Modification en cours...</span>
                </>
              ) : (
                <span>Modifier le mot de passe</span>
              )}
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
