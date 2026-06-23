/* src/components/Common/SuccessModal.jsx */
import React, { useEffect } from 'react';
import { Check, X, Award } from 'lucide-react';

export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Succès !", 
  message = "L'opération a été effectuée avec succès.",
  productName = "",
  submittedBy = "",
  points = 100,
  buttonText = "Continuer"
}) => {
  
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card-solid)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          width: '90%',
          maxWidth: '420px',
          padding: '32px 28px 28px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          animation: 'modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            padding: '4px',
            borderRadius: '8px',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="demo-btn"
          title="Fermer"
        >
          <X width="18" height="18" />
        </button>

        {/* Success Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: 'var(--primary)',
          boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.05)',
          position: 'relative'
        }}>
          <Check width="32" height="32" strokeWidth="2.5" />
          {points > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: 'var(--color-admin)',
              color: '#fff',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              border: '2px solid var(--bg-card-solid)'
            }} title="Points attribués">
              <Award width="12" height="12" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: '1.35rem', 
          fontWeight: 800, 
          color: 'var(--text-dark)',
          marginBottom: '12px',
          letterSpacing: '-0.3px'
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ 
          fontSize: '0.9rem', 
          color: 'var(--text-main)', 
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {message}
          
          {(productName || submittedBy) && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px 16px',
              backgroundColor: 'var(--bg-main)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {productName && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Produit : <strong style={{ color: 'var(--text-dark)' }}>{productName}</strong>
                </div>
              )}
              {submittedBy && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Contributeur : <strong style={{ color: 'var(--text-dark)' }}>{submittedBy}</strong>
                </div>
              )}
              {points > 0 && (
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--color-admin)', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  paddingTop: '6px',
                  borderTop: '1px dashed var(--border-color)'
                }}>
                  ✨ +{points} Points de réputation attribués !
                </div>
              )}
            </div>
          )}
        </p>

        {/* Confirm Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px var(--primary-glow)',
            transition: 'all 0.15s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px var(--primary-glow)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px var(--primary-glow)';
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
