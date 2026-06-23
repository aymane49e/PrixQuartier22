/* src/components/Common/ConfirmModal.jsx */
import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Supprimer l'élément ?", 
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  itemName = "", 
  confirmText = "Supprimer", 
  cancelText = "Annuler",
  type = "danger" // danger, warning
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

  const isDanger = type === "danger";

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
        zIndex: 1100,
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
          padding: '28px',
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

        {/* Icon Header */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: isDanger ? 'var(--color-danger-bg)' : 'hsl(45, 100%, 95%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: isDanger ? 'var(--color-danger)' : 'hsl(45, 100%, 35%)',
          boxShadow: isDanger 
            ? '0 0 0 8px rgba(239, 68, 68, 0.05)' 
            : '0 0 0 8px rgba(245, 158, 11, 0.05)',
        }}>
          {isDanger ? (
            <Trash2 width="24" height="24" strokeWidth="2.2" />
          ) : (
            <AlertTriangle width="24" height="24" strokeWidth="2.2" />
          )}
        </div>

        {/* Title */}
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 800, 
          color: 'var(--text-dark)',
          marginBottom: '10px'
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ 
          fontSize: '0.9rem', 
          color: 'var(--text-main)', 
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          {message}
          {itemName && (
            <span style={{ 
              display: 'block', 
              marginTop: '10px', 
              padding: '6px 12px',
              backgroundColor: 'var(--bg-main)',
              borderRadius: '8px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              fontSize: '0.85rem',
              border: '1px solid var(--border-color)',
              wordBreak: 'break-word'
            }}>
              {itemName}
            </span>
          )}
        </p>

        {/* Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          width: '100%',
          marginTop: '4px'
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card-solid)',
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease'
            }}
            className="demo-btn"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: isDanger ? 'var(--color-danger)' : 'hsl(45, 100%, 35%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: isDanger 
                ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
                : '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isDanger 
                ? '0 6px 16px rgba(239, 68, 68, 0.3)' 
                : '0 6px 16px rgba(245, 158, 11, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = isDanger 
                ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
                : '0 4px 12px rgba(245, 158, 11, 0.2)';
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
