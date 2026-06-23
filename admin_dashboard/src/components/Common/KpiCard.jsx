/* src/components/Common/KpiCard.jsx */
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const KpiCard = ({ title, value, changeText, subText, isPositive = true }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card-solid)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition-normal)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}
    className="dash-kpi-card"
    >
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </span>
      
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-dark)',
          letterSpacing: '-0.5px',
          lineHeight: 1
        }}>
          {value}
        </span>
        
        {changeText && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '9999px',
            backgroundColor: isPositive ? 'var(--primary-light)' : 'var(--color-danger-bg)',
            color: isPositive ? 'var(--primary)' : 'var(--color-danger)'
          }}>
            {isPositive ? <ArrowUpRight width="12" height="12" /> : <ArrowDownRight width="12" height="12" />}
            <span>{changeText}</span>
          </div>
        )}
      </div>

      {subText && (
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}>
          {subText}
        </span>
      )}
    </div>
  );
};
