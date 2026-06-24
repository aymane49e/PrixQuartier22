/* src/components/Login.jsx */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset, verifyOtp, getUserIdByEmail, updatePasswordAdmin } from '../data/services/authService';
import { ShoppingBag, Eye, EyeOff, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const Login = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'verify', 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (mode === 'login' || mode === 'register') {
      let result;
      if (mode === 'login') result = await login(email, password);
      else result = await register(name, email, password);

      if (!result.success) setError(result.message || 'Une erreur est survenue.');
      else window.location.href = '/admin.html';
    }
    else if (mode === 'forgot') {
      const { error } = await requestPasswordReset(email);
      if (error) setError(error.message);
      else { setSuccess('Un code a été envoyé.'); setMode('verify'); }
    }
    else if (mode === 'verify') {
      const { success, error } = await verifyOtp(email, otp);
      if (error) setError(error);
      else { setSuccess('Code vérifié.'); setMode('reset'); }
    }
    else if (mode === 'reset') {
      const { userId, error: userError } = await getUserIdByEmail(email);
      if (userError) setError(userError);
      else {
        const { error } = await updatePasswordAdmin(userId, password);
        if (error) setError(error.message);
        else { setSuccess('Mot de passe mis à jour !'); setTimeout(() => setMode('login'), 2000); }
      }
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: 'radial-gradient(circle at 10% 20%, hsla(156, 72%, 38%, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 45%), #f8fafc', padding: '24px' }}>
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, hsla(156, 72%, 38%, 0.15) 0%, transparent 70%)', top: '-10%', left: '20%', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)', bottom: '-10%', right: '15%', zIndex: 0, pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: '420px', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.6)', borderRadius: '24px', padding: '40px 32px', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-dark)' }}>
          <ShoppingBag style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>PrixQuartier</span>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['login', 'register'].includes(mode) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>{mode === 'login' ? 'Connexion' : 'Inscription'}</div>
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>{mode === 'login' ? 'Créer un compte' : 'Se connecter'}</button>
            </div>
          )}

          {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.1)' }}><AlertCircle width="16" height="16" /><span>{error}</span></div>}
          {success && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.15)' }}><span>{success}</span></div>}

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nom complet</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ayman EL Ajmi" style={{ width: '100%', backgroundColor: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-dark)' }} />
            </div>
          )}

          {mode !== 'verify' && mode !== 'reset' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Adresse Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@prixquartier.ma" style={{ width: '100%', backgroundColor: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-dark)' }} />
            </div>
          )}

          {mode === 'verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Code OTP</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" style={{ width: '100%', backgroundColor: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-dark)' }} />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}</label>
                {mode === 'login' && <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer' }}>Oublié ?</button>}
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', backgroundColor: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 42px 12px 16px', fontSize: '0.9rem', color: 'var(--text-dark)' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{showPassword ? <EyeOff width="16" height="16" /> : <Eye width="16" height="16" />}</button>
              </div>
            </div>
          )}

         <button type="submit" disabled={submitting} style={{ width: '100%', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 700, padding: '14px', borderRadius: '12px', border: 'none', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} className="btn-primary">
            {submitting ? 'En cours...' : (
              mode === 'forgot' ? 'Envoyer le code' :
              mode === 'verify' ? 'Vérifier' :
              mode === 'reset' ? 'Mettre à jour' :
              mode === 'login' ? (
                <>
                  <span>Se connecter</span>
                  <ArrowRight width="20" height="20" /> 
                </>
              ) : 'Créer mon compte'
            )}
          </button>
          
          {(mode === 'forgot' || mode === 'verify' || mode === 'reset') && (
            <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Retour à la connexion </button>
          )}
          
          <button type="button" onClick={() => window.location.href = '/'} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ArrowLeft width="16" height="16" />
            <span>Retour à l'accueil</span>
          </button>
        </form>
      </div>
    </div>
  );
};