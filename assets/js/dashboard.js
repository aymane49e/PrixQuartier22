/* assets/js/dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
  // Select components
  const roleCards = document.querySelectorAll('.role-card');
  const dashTitle = document.querySelector('.dash-title');
  const dashSidebarItems = document.querySelectorAll('.dash-menu-item');
  const kpiGrid = document.querySelector('.dash-kpis-grid');
  
  // Chart container selectors
  const lineChartBody = document.getElementById('dash-line-chart-body');
  const donutChartBody = document.getElementById('dash-donut-chart-body');
  
  // Data for each role
  const dashboardData = {
    user: {
      title: "Espace Citoyen • Tableau de bord",
      activeSidebarIndex: 0, // "Tableau de bord"
      kpis: [
        { label: "Mes contributions", val: "18", badge: { text: "+3 ce mois", isGreen: true } },
        { label: "Points cumulés", val: "1,240 pts", badge: { text: "+120 pts", isGreen: true } },
        { label: "Économies estimées", val: "340 MAD", badge: { text: "15% de budget", isGreen: true } },
        { label: "Alertes actives", val: "5", badge: { text: "0 en attente", isGreen: true } }
      ],
      lineChartTitle: "Mes économies mensuelles (MAD)",
      lineChartData: [45, 60, 55, 80, 110, 145], // Data points for Jan-Jun
      lineLabels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
      donutChartTitle: "Mes catégories de dépenses",
      donutData: [
        { name: "Légumes", value: 40, color: "var(--color-user)" },
        { name: "Épicerie", value: 30, color: "var(--color-manager)" },
        { name: "Fruits", value: 20, color: "var(--color-admin)" },
        { name: "Produits Laitiers", value: 10, color: "#f59e0b" }
      ]
    },
    manager: {
      title: "Espace Modérateur • Tableau de bord",
      activeSidebarIndex: 2, // "Contributions"
      kpis: [
        { label: "Contributions validées", val: "428", badge: { text: "+18% vs hier", isGreen: true } },
        { label: "En attente de relecture", val: "29", badge: { text: "-15% ce matin", isGreen: true } },
        { label: "Signalements traités", val: "14", badge: { text: "100% résolus", isGreen: true } },
        { label: "Temps moyen de validation", val: "8 min", badge: { text: "-3 min", isGreen: true } }
      ],
      lineChartTitle: "Volume de modération quotidien",
      lineChartData: [60, 95, 80, 140, 120, 190],
      lineLabels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      donutChartTitle: "Signalements par motif",
      donutData: [
        { name: "Prix erroné", value: 55, color: "var(--color-danger)" },
        { name: "Hors sujet", value: 25, color: "var(--color-manager)" },
        { name: "Photo floue", value: 15, color: "var(--color-admin)" },
        { name: "Doublon", value: 5, color: "#94a3b8" }
      ]
    },
    admin: {
      title: "Espace Administrateur • Tableau de bord",
      activeSidebarIndex: 0, // "Tableau de bord"
      kpis: [
        { label: "Utilisateurs actifs", val: "12,458", badge: { text: "+12% ce mois", isGreen: true } },
        { label: "Produits uniques", val: "842", badge: { text: "+8% référencés", isGreen: true } },
        { label: "Contributions totales", val: "5,214", badge: { text: "+15% vs avr.", isGreen: true } },
        { label: "Quartiers couverts", val: "54", badge: { text: "+3 nouveaux", isGreen: true } }
      ],
      lineChartTitle: "Évolution globale des contributions",
      lineChartData: [1200, 1800, 2400, 3100, 4200, 5214],
      lineLabels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
      donutChartTitle: "Produits les plus consultés",
      donutData: [
        { name: "Tomate", value: 35, color: "var(--color-user)" },
        { name: "Pomme de terre", value: 25, color: "var(--color-manager)" },
        { name: "Oignon", value: 20, color: "#f59e0b" },
        { name: "Huile d'olive", value: 12, color: "var(--color-admin)" },
        { name: "Autres", value: 8, color: "#94a3b8" }
      ]
    }
  };

  // Switch role and update UI
  function selectRole(roleKey) {
    const data = dashboardData[roleKey];
    if (!data) return;

    // 1. Update Left Column Role Cards UI
    roleCards.forEach(card => {
      card.classList.remove('active-user', 'active-manager', 'active-admin');
      if (card.dataset.role === roleKey) {
        card.classList.add(`active-${roleKey}`);
      }
    });

    // 2. Update Sidebar Active Item
    dashSidebarItems.forEach((item, index) => {
      item.classList.remove('active', 'active-user', 'active-manager', 'active-admin');
      if (index === data.activeSidebarIndex) {
        item.classList.add('active', `active-${roleKey}`);
      }
    });

    // 3. Update Dashboard Title
    if (dashTitle) {
      dashTitle.textContent = data.title;
    }

    // 4. Update KPI Cards (with fade-in animation)
    if (kpiGrid) {
      kpiGrid.innerHTML = '';
      data.kpis.forEach(kpi => {
        const card = document.createElement('div');
        card.className = 'dash-kpi-card dash-fade-transition';
        card.innerHTML = `
          <div class="dash-kpi-label">${kpi.label}</div>
          <div class="dash-kpi-value-row">
            <span class="dash-kpi-val">${kpi.val}</span>
            <span class="dash-kpi-badge ${kpi.badge.isGreen ? 'dash-badge-green' : 'dash-badge-red'}">
              ${kpi.badge.text}
            </span>
          </div>
        `;
        kpiGrid.appendChild(card);
      });
    }

    // 5. Redraw Custom Charts
    renderLineChart(data.lineLabels, data.lineChartData, data.lineChartTitle, roleKey);
    renderDonutChart(data.donutData, data.donutChartTitle);
  }

  // Draw Line Chart dynamically as responsive SVG
  function renderLineChart(labels, values, titleText, roleKey) {
    if (!lineChartBody) return;
    
    // Set line chart title
    const lineChartCard = lineChartBody.closest('.dash-chart-card');
    if (lineChartCard) {
      const titleEl = lineChartCard.querySelector('.dash-chart-title');
      if (titleEl) titleEl.textContent = titleText;
    }

    // SVG parameters
    const width = 340;
    const height = 140;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calculate Min & Max values
    const maxVal = Math.max(...values) * 1.1; // 10% padding on top
    const minVal = 0;

    // Build line points
    const points = values.map((val, index) => {
      const x = paddingLeft + (index / (values.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      return { x, y };
    });

    let polylinePointsAttr = points.map(p => `${p.x},${p.y}`).join(' ');
    
    // Choose theme color for line based on role
    let strokeColor = 'var(--primary)';
    let areaColor = 'var(--primary-glow)';
    if (roleKey === 'manager') {
      strokeColor = 'var(--color-manager)';
      areaColor = 'var(--color-manager-glow)';
    } else if (roleKey === 'admin') {
      strokeColor = 'var(--color-admin)';
      areaColor = 'var(--color-admin-glow)';
    }

    // Y Axis Guidelines (Horizontal Gridlines)
    const gridCount = 3;
    let gridHTML = '';
    for (let i = 0; i <= gridCount; i++) {
      const gridY = paddingTop + (i / gridCount) * chartHeight;
      const gridVal = Math.round(maxVal - (i / gridCount) * (maxVal - minVal));
      gridHTML += `
        <line x1="${paddingLeft}" y1="${gridY}" x2="${width - paddingRight}" y2="${gridY}" stroke="var(--border-color)" stroke-dasharray="2,2" stroke-width="1" />
        <text x="${paddingLeft - 8}" y="${gridY + 3}" fill="var(--text-muted)" font-size="7" text-anchor="end" font-weight="700">${gridVal}</text>
      `;
    }

    // X Axis Labels
    let labelsHTML = '';
    points.forEach((p, index) => {
      labelsHTML += `
        <text x="${p.x}" y="${height - 8}" fill="var(--text-muted)" font-size="8" text-anchor="middle" font-weight="700">${labels[index]}</text>
        <circle cx="${p.x}" cy="${p.y}" r="3" fill="var(--bg-card-solid)" stroke="${strokeColor}" stroke-width="2" class="pulse-animation" />
      `;
    });

    // Build the closed area SVG path
    const areaPathAttr = `
      M ${points[0].x} ${paddingTop + chartHeight}
      ${points.map(p => `L ${p.x} ${p.y}`).join(' ')}
      L ${points[points.length - 1].x} ${paddingTop + chartHeight} Z
    `;

    // Render HTML inside SVG
    lineChartBody.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="dash-fade-transition">
        <!-- Gridlines -->
        ${gridHTML}
        
        <!-- Closed Gradient Area -->
        <path d="${areaPathAttr}" fill="${areaColor}" opacity="0.6" />
        
        <!-- Animated Path Line -->
        <path d="M ${points[0].x} ${points[0].y} ${points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}" 
              fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" class="chart-draw" />
              
        <!-- Labels and Data Dots -->
        ${labelsHTML}
      </svg>
    `;
  }

  // Draw Donut Chart dynamically as HTML/CSS/SVG
  function renderDonutChart(data, titleText) {
    if (!donutChartBody) return;

    // Set donut chart title
    const donutChartCard = donutChartBody.closest('.dash-chart-card');
    if (donutChartCard) {
      const titleEl = donutChartCard.querySelector('.dash-chart-title');
      if (titleEl) titleEl.textContent = titleText;
    }

    // Calculate total values
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Draw SVG circle segments
    let accumulatedPercent = 0;
    let svgSegments = '';
    
    data.forEach((item, index) => {
      const percent = (item.value / total) * 100;
      
      // stroke-dasharray parameters
      const strokeDashArray = `${percent} 100`;
      const strokeDashOffset = -accumulatedPercent;
      
      svgSegments += `
        <circle cx="21" cy="21" r="15.915" 
                fill="transparent" 
                stroke="${item.color}" 
                stroke-width="5.5" 
                stroke-dasharray="${strokeDashArray}" 
                stroke-dashoffset="${strokeDashOffset}"
                class="donut-segment-draw"
                style="animation-delay: ${index * 0.1}s">
        </circle>
      `;
      accumulatedPercent += percent;
    });

    // Create Legend HTML
    let legendHTML = '<div class="donut-legend">';
    data.forEach(item => {
      legendHTML += `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${item.color};"></span>
          <span>${item.name} (${item.value}%)</span>
        </div>
      `;
    });
    legendHTML += '</div>';

    // Insert markup
    donutChartBody.innerHTML = `
      <div class="dash-fade-transition" style="display:flex; align-items:center; justify-content:center; width:100%;">
        <!-- SVG Donut -->
        <div style="width: 110px; height: 110px;">
          <svg viewBox="0 0 42 42" width="100%" height="100%">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" stroke-width="5.5"></circle>
            ${svgSegments}
            <circle cx="21" cy="21" r="12" fill="var(--bg-card-solid)"></circle>
          </svg>
        </div>
        <!-- Legend -->
        ${legendHTML}
      </div>
    `;
  }

  // 6. Setup Click Listeners on Left Panel Role Cards
  roleCards.forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      selectRole(role);
      
      // Auto smooth scroll to dashboard simulator to show the changes on smaller screens
      if (window.innerWidth < 1024) {
        const dashSec = document.querySelector('.dashboard-mockup-wrapper');
        if (dashSec) {
          dashSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // Initialize with Admin role by default (matching the mockup image provided by user)
  selectRole('admin');
});
