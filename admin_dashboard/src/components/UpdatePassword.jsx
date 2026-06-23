/* src/components/UpdatePassword.jsx */
import React, { useState } from 'react';
import { supabase } from '../data/services/supabaseClient';
import { ShoppingBag, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(16px)', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
          <ShoppingBag style={{ color: 'var(--primary)', width: '32px', height: '32px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>Nouveau mot de passe</span>
        </div>

        {message ? (
          <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{message}</div>
        ) : (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {error && <div style={{ color: 'var(--color-danger)' }}>{error}</div>}
            
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              required
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
            />
            
            <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: 'var(--primary)', color: '#fff', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}>
              {loading ? 'En cours...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};