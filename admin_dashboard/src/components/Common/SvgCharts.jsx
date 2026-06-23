/* src/components/Common/SvgCharts.jsx */
import React, { useState } from 'react';

// Animated responsive SVG Line Chart
export const LineChart = ({ data = [], labels = [], color = 'var(--primary)', areaColor = 'var(--primary-glow)' }) => {
  const width = 450;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data, 1); // ضمان حد أدنى 1 لمنع القسمة على صفر
  const minVal = 0;
  const range = maxVal - minVal;

  const points = data.map((val, index) => {
    const x = paddingLeft + (index / (data.length > 1 ? data.length - 1 : 1)) * chartWidth;
    // إضافة حماية لمنع NaN في الـ y
    const yValue = isNaN(val) ? 0 : val;
    const y = paddingTop + chartHeight - ((yValue - minVal) / range) * chartHeight;
    return { x, y, val };
  });

  // Y-axis grid lines
  const gridCount = 3;
  const gridLines = [];
  for (let i = 0; i <= gridCount; i++) {
    const gridY = paddingTop + (i / gridCount) * chartHeight;
    const gridVal = Math.round(maxVal - (i / gridCount) * (maxVal - minVal));
    gridLines.push(
      <g key={`grid-${i}`}>
        <line 
          x1={paddingLeft} 
          y1={gridY} 
          x2={width - paddingRight} 
          y2={gridY} 
          stroke="var(--border-color)" 
          strokeDasharray="3,3" 
          strokeWidth="1" 
        />
        <text 
          x={paddingLeft - 10} 
          y={gridY + 3} 
          fill="var(--text-muted)" 
          fontSize="8" 
          fontWeight="700" 
          textAnchor="end"
        >
          {gridVal}
        </text>
      </g>
    );
  }

  const areaPath = points.length > 0 ? `
    M ${points[0].x} ${paddingTop + chartHeight}
    ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}
    L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z
  ` : '';

  const linePath = points.length > 0 ? `
    M ${points[0].x} ${points[0].y} 
    ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}
  ` : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Grid lines */}
      {gridLines}

      {/* Shadow gradient area under the line */}
      {areaPath && <path d={areaPath} fill={areaColor} opacity="0.4" />}

      {/* Path Line */}
      {linePath && (
        <path 
          d={linePath} 
          fill="none" 
          stroke={color} 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="chart-draw"
        />
      )}

      {/* Data Dots and Labels */}
      {points.map((p, index) => (
        <g key={`pt-${index}`}>
          <circle 
            cx={p.x} 
            cy={p.y} 
            r="4" 
            fill="#fff" 
            stroke={color} 
            strokeWidth="2.5" 
            style={{ transition: 'all 0.2s ease' }}
          />
          <text 
            x={p.x} 
            y={height - 8} 
            fill="var(--text-muted)" 
            fontSize="9" 
            fontWeight="700" 
            textAnchor="middle"
          >
            {labels[index]}
          </text>
        </g>
      ))}
    </svg>
  );
};

// Animated interactive Donut Chart
export const DonutChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // 1. حساب المجموع بشكل آمن
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  // 2. إذا كانت البيانات فارغة أو المجموع صفر، نظهر رسالة بسيطة
  if (total === 0) {
    return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Aucune donnée</div>;
  }
  let accumulatedPercent = 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      width: '100%',
      flexWrap: 'wrap'
    }}>
      {/* SVG Donut */}
      <div style={{ width: '130px', height: '130px', position: 'relative' }}>
        <svg viewBox="0 0 42 42" width="100%" height="100%">
          <circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="var(--border-color)" strokeWidth="5"></circle>
          
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const strokeDashArray = `${percent} 100`;
            const strokeDashOffset = -accumulatedPercent;
            accumulatedPercent += percent;
            
            const isHovered = hoveredIndex === index;

            return (
              <circle 
                key={index}
                cx="21" 
                cy="21" 
                r="15.9155" 
                fill="transparent" 
                stroke={item.color} 
                strokeWidth={isHovered ? "6.5" : "5"} 
                strokeDasharray={strokeDashArray} 
                strokeDashoffset={strokeDashOffset}
                className="donut-segment-draw"
                style={{ 
                  animationDelay: `${index * 0.08}s`,
                  cursor: 'pointer',
                  transition: 'stroke-width 0.15s ease'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
          
          {/* Inner masking card circle */}
          <circle cx="21" cy="21" r="12" fill="var(--bg-card-solid)"></circle>
        </svg>
        
        {/* Core text displaying total or highlighted item */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {hoveredIndex !== null ? data[hoveredIndex].name : 'Total'}
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>
            {hoveredIndex !== null ? `${data[hoveredIndex].value}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '150px'
      }}>
        {data.map((item, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                fontWeight: isHovered ? 800 : 600,
                color: isHovered ? 'var(--text-dark)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isHovered ? 'translateX(4px)' : 'none'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                backgroundColor: item.color,
                display: 'inline-block',
                flexShrink: 0
              }}></span>
              <span>{item.name} ({item.value}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
