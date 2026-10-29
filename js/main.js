/**
 * ==========================================================================
 * RAFA — Resource Analytics for Future Africa
 * Institutional Client-Side Architecture (main.js)
 * WCAG 2.2 AA Compliant | Accessible Dialogs | Dynamic Insights | Form Intake
 * ==========================================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initActiveNav();
  initModals();
  initBriefingFlow();
  initInsightsLibrary();
  initForms();
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/* --------------------------------------------------------------------------
   Toast Notification System
   -------------------------------------------------------------------------- */
let toastTimeout = null;

function showToast(message, duration = 4000) {
  let toast = document.getElementById('rafa-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'rafa-toast';
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  // Clear existing timer
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined icon-sm" aria-hidden="true" style="color: var(--color-ochre-400);">info</span>
    <span>${message}</span>
  `;
  toast.classList.add('is-visible');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, duration);
}

/* --------------------------------------------------------------------------
   Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navList = document.querySelector('.main-nav .nav-list');
  const header = document.querySelector('.site-header');

  if (!toggleBtn || !navList) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navList.classList.contains('is-open');
    navList.classList.toggle('is-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Toggle navigation menu');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any nav link
  navList.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navList.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  });

  // Close when clicking outside header
  document.addEventListener('click', (e) => {
    if (navList.classList.contains('is-open') && header && !header.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navList.classList.contains('is-open')) {
      toggleMenu(false);
      toggleBtn.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   Active Navigation Link
   -------------------------------------------------------------------------- */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav .nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('#')[0];

    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* --------------------------------------------------------------------------
   Accessible Modal Dialogs (WCAG 2.2 AA)
   -------------------------------------------------------------------------- */
function initModals() {
  let previousActiveElement = null;

  // Open triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-modal]');
    if (!trigger) return;

    e.preventDefault();
    const modalId = trigger.getAttribute('data-open-modal');
    const modal = document.getElementById(modalId);

    if (modal && typeof modal.showModal === 'function') {
      previousActiveElement = trigger;
      modal.showModal();

      // Ensure focus is inside the dialog
      const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  });

  // Close buttons inside modals
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (!closeBtn) return;

    e.preventDefault();
    const modal = closeBtn.closest('dialog.modal');
    if (modal && typeof modal.close === 'function') {
      modal.close();
    }
  });

  // Close when clicking on dialog backdrop
  document.querySelectorAll('dialog.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        modal.close();
      }
    });

    // Return focus to triggering element when dialog closes
    modal.addEventListener('close', () => {
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
        previousActiveElement = null;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Guided briefing request
   -------------------------------------------------------------------------- */
function initBriefingFlow() {
  const form = document.getElementById('briefing-request-form');
  if (!form) return;

  const panels = [...form.querySelectorAll('[data-briefing-panel]')];
  const steps = [...document.querySelectorAll('[data-briefing-step]')];
  const backButton = document.getElementById('briefing-back-button');
  const nextButton = document.getElementById('briefing-next-button');
  const submitButton = document.getElementById('briefing-submit-button');
  const progress = document.getElementById('briefing-progress');
  const stepNames = ['Your institution', 'Briefing focus', 'Review & send'];
  let activeStep = 0;

  function updateReview() {
    const values = {
      organisation: form.elements.organisation.value.trim(),
      full_name: form.elements.full_name.value.trim(),
      interest_area: form.elements.interest_area.selectedOptions[0]?.textContent,
      email: form.elements.email.value.trim()
    };
    Object.entries(values).forEach(([key, value]) => {
      const target = document.querySelector(`[data-briefing-review="${key}"]`);
      if (target) {
        target.textContent = value || 'Not provided yet';
      }
    });
  }

  function showStep(index) {
    activeStep = index;
    panels.forEach((panel, panelIndex) => {
      panel.hidden = panelIndex !== index;
      panel.classList.toggle('is-active', panelIndex === index);
    });
    steps.forEach((step, stepIndex) => {
      step.classList.toggle('is-active', stepIndex === index);
      step.classList.toggle('is-complete', stepIndex < index);
      if (stepIndex === index) {
        step.setAttribute('aria-current', 'step');
      } else {
        step.removeAttribute('aria-current');
      }
    });
    backButton.hidden = index === 0;
    nextButton.hidden = index === panels.length - 1;
    submitButton.hidden = index !== panels.length - 1;
    progress.textContent = `Step ${index + 1} of ${panels.length} · ${stepNames[index]}`;
    if (index === panels.length - 1) {
      updateReview();
    }
  }

  function validateStep(index) {
    const invalidControl = panels[index].querySelector(':invalid');
    if (invalidControl) {
      invalidControl.reportValidity();
      invalidControl.focus();
      return false;
    }
    return true;
  }

  function goToStep(index) {
    const target = Math.max(0, Math.min(index, panels.length - 1));
    if (target > activeStep) {
      for (let stepIndex = activeStep; stepIndex < target; stepIndex += 1) {
        if (!validateStep(stepIndex)) {
          return;
        }
      }
    }
    showStep(target);
    panels[target].querySelector('input, select, textarea')?.focus({ preventScroll: true });
  }

  backButton.addEventListener('click', () => goToStep(activeStep - 1));
  nextButton.addEventListener('click', () => goToStep(activeStep + 1));
  steps.forEach((step, index) => {
    step.addEventListener('click', () => goToStep(index));
  });
  form.addEventListener('input', updateReview);
  form.addEventListener('change', updateReview);
  form.addEventListener('submit', event => {
    if (activeStep !== panels.length - 1) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goToStep(activeStep + 1);
    }
  }, true);
  showStep(0);
}

/* --------------------------------------------------------------------------
   Insights Library Data & Filtering System
   -------------------------------------------------------------------------- */
const PUBLICATIONS = [
  {
    id: 'RAFA-DB-2026-01',
    title: 'Critical Raw Materials Mandates: Evaluating Western Supply Chain Decrees on African Export Sovereign Autonomy',
    pillar: 'Signals and foresight',
    type: 'Decision Brief',
    date: 'October 2026',
    readTime: '10 min read',
    author: 'Dr. Kwame Mensah & RAFA Critical Materials Taskforce',
    abstract: 'An empirical analysis of recent EU Critical Raw Materials Act and US IRA requirements, assessing statutory risks of locked-in raw export dependency and identifying high-leverage sovereign negotiation counter-proposals.',
    content: `
      <h4>Executive Summary</h4>
      <p>External statutory mandates increasingly seek to guarantee raw mineral flows without guaranteeing domestic value retention or technological transfer. African states risk entering long-term bilateral supply pacts that curtail sovereign refining ambitions.</p>
      
      <h4>Core Strategic Findings</h4>
      <ul>
        <li><strong>Mandate Asymmetry:</strong> Over 78% of international critical mineral procurement protocols analyzed prioritize volume extraction over local beneficiation milestones.</li>
        <li><strong>Regulatory Spillover:</strong> Carbon-intensity reporting rules impose unilateral verification costs on African miners while offering zero concession on grid decarbonization financing.</li>
        <li><strong>Sovereign Retaliation Risks:</strong> Uncoordinated single-country export bans provoke rapid supply diversion rather than in-country smelter capital allocation.</li>
      </ul>

      <h4>Recommended Sovereign Posture</h4>
      <p>African mining jurisdictions should adopt coordinated regional corridor minimums (minimum 35% domestic cathode precursor refining) benchmarked against continental transit parity rather than individual bilateral concessions.</p>
    `
  },
  {
    id: 'RAFA-MN-2026-02',
    title: 'Synthetic Battery Chemistry Shifts: Modeling Long-Horizon Substitution Risks for African Nickel and Flake Graphite',
    pillar: 'Signals and foresight',
    type: 'Methods Note',
    date: 'September 2026',
    readTime: '14 min read',
    author: 'RAFA Quantitative Modeling Group',
    abstract: 'A rigorous simulation methodology for mineral ministries to forecast commercialization horizons of sodium-ion, silicon-anode, and synthetic graphite technologies before signing 20-year concession renewals.',
    content: `
      <h4>Methodological Scope</h4>
      <p>This paper presents the RAFA Commodity Substitution Stress-Testing (CSST) framework, designed to prevent state lock-in to assets vulnerable to technological obsolescence over a 15-to-25 year amortization period.</p>
      
      <h4>Key Substitution Indicators</h4>
      <ul>
        <li><strong>Graphite Anodes:</strong> Synthetic graphite capacity expansion in non-African jurisdictions threatens to compress natural flake margins by 2028 unless localized purity refining is achieved.</li>
        <li><strong>Nickel Chemistries:</strong> LFP battery market share expansion necessitates immediate recalibration of Class 1 nickel demand curves in sovereign revenue models.</li>
      </ul>

      <h4>Implementation Protocol</h4>
      <p>Revenue authorities are provided open-source Python benchmark calculators to re-index concession royalty escalation clauses dynamically against battery pack chemistry indices.</p>
    `
  },
  {
    id: 'RAFA-DB-2026-03',
    title: 'Grid Reliability & High-Voltage Infrastructure: The Unspoken Bottleneck in African Lithium Hydroxide Refining',
    pillar: 'Readiness and choices',
    type: 'Decision Brief',
    date: 'August 2026',
    readTime: '11 min read',
    author: 'Eng. Chileshe Mwewa, Infrastructure Specialist',
    abstract: 'A technical readiness audit demonstrating why statutory export bans fail without dedicated green baseload energy corridors, with capital expenditure estimates for in-country battery-grade conversion.',
    content: `
      <h4>The Refining Reality Gap</h4>
      <p>While multiple African nations have legislated raw lithium export prohibitions, domestic refining capacity remains impeded by industrial electrical stability deficits. Spodumene-to-hydroxide conversion requires continuous, uninterruptible power.</p>
      
      <h4>Key Infrastructure Metrics</h4>
      <ul>
        <li><strong>Power Requirements:</strong> A standard 25,000 tpa lithium hydroxide converter demands 35–45 MW of firm baseload power with less than 0.5% annual unplanned downtime.</li>
        <li><strong>Reagent Supply:</strong> Chemical conversion requires localized sulfuric acid and soda ash rail logistics that currently add up to 28% to production costs compared to Asian coastal refiners.</li>
      </ul>

      <h4>Policy Action Plan</h4>
      <p>States must establish Sovereign Mineral Refining Special Zones with dedicated hydro/solar microgrid PPAs before imposing hard export moratoriums to prevent industrial curtailment.</p>
    `
  },
  {
    id: 'RAFA-CS-2026-04',
    title: 'Auditing Statutory Stability Clauses Against European Carbon Border Adjustment Mechanism (CBAM) Shocks',
    pillar: 'Readiness and choices',
    type: 'Case Study',
    date: 'July 2026',
    readTime: '12 min read',
    author: 'Legal & Fiscal Advisory Directorate',
    abstract: 'Examining how 1990s-era stabilization clauses in mining conventions legally paralyze African governments from enforcing emissions standards needed to maintain European export eligibility.',
    content: `
      <h4>Legal Anatomy of Concession Freezes</h4>
      <p>Many active mining conventions in West and Central Africa freeze environmental and tax statutes to the date of initial enactment. Under emerging CBAM rules, untaxed embedded emissions result in punitive levies paid to European treasuries rather than African host governments.</p>
      
      <h4>Case Comparisons</h4>
      <ul>
        <li><strong>Jurisdiction A:</strong> Modern renegotiation clause allowed swift introduction of a sovereign carbon benchmark, retaining 100% of fiscal revenues domestically.</li>
        <li><strong>Jurisdiction B:</strong> Rigid stabilization clause forced the state to absorb CBAM penalties abroad with zero domestic tax offset.</li>
      </ul>

      <h4>Model Reform Clauses</h4>
      <p>RAFA provides vetted drafting language for sovereign renegotiations that carves out mutual decarbonization adjustments from general stabilization protections.</p>
    `
  },
  {
    id: 'RAFA-DB-2026-05',
    title: 'Refining Parity & Fiscal Term Modeling: Re-engineering Sovereign Concession Architecture for Battery Grade Minerals',
    pillar: 'Positioning and value capture',
    type: 'Decision Brief',
    date: 'October 2026',
    readTime: '13 min read',
    author: 'Dr. Amina Touré & RAFA Fiscal Benchmarking Unit',
    abstract: 'A comparative fiscal model for state equity, free carried interest, and windfall profit participation across lithium, copper, and cobalt assets, proving that 45%+ sovereign value capture is commercially viable.',
    content: `
      <h4>Bridging Negotiation Asymmetry</h4>
      <p>Commercial mining companies routinely employ complex transfer pricing and debt-loading strategies that depress reported mine-gate profits. RAFA models establish equitable gross-revenue baselines and sliding-scale windfall mechanisms.</p>
      
      <h4>Comparative Benchmark Findings</h4>
      <ul>
        <li><strong>Historic Rent Capture:</strong> Average African sovereign retention across major copper/cobalt ventures between 2012–2024 stood at only 14.8% of gross mineral value.</li>
        <li><strong>Achievable Parity:</strong> Stress-tested economic models demonstrate that host states can secure 42%–58% effective value capture (tax + royalties + dividends) without deterring tier-1 capital investment.</li>
      </ul>

      <h4>Strategic Implementation</h4>
      <p>Adoption of unified regional benchmark prices and transparent netback auditing eliminates intermediate offshore trading house deductions.</p>
    `
  },
  {
    id: 'RAFA-RP-2026-06',
    title: 'AfCFTA Rules of Origin Harmonization: Creating Continental Scale for Cathode Precursor Manufacturing',
    pillar: 'Positioning and value capture',
    type: 'Report',
    date: 'June 2026',
    readTime: '18 min read',
    author: 'RAFA Regional Integration Working Group',
    abstract: 'A continental trade architecture roadmap for the African Continental Free Trade Area (AfCFTA) Secretariat, defining regional value-added thresholds for mineral inputs moving between African corridors.',
    content: `
      <h4>Unlocking Regional Scale</h4>
      <p>No single African country holds all requisite inputs for modern battery chemistry at commercial scale. Cross-border integration—combining Congolese cobalt, Zambian copper, Zimbabwean lithium, and South African manganese—is the only viable pathway to global industrial competitiveness.</p>
      
      <h4>Policy Recommendations</h4>
      <ul>
        <li><strong>Rules of Origin:</strong> Establish a minimum 40% continental content threshold to qualify battery components for zero-tariff internal AfCFTA transit.</li>
        <li><strong>Corridor Fast-Tracking:</strong> Designate critical mineral trade corridors as expedited customs pathways with digital traceability.</li>
      </ul>
    `
  },
  {
    id: 'RAFA-CS-2026-07',
    title: 'The Central Corridor Sovereign Mineral Tracking Pilot: Countering Transshipment Revenue Leakage',
    pillar: 'RAFA in action',
    type: 'Case Study',
    date: 'May 2026',
    readTime: '15 min read',
    author: 'C MINK Technical Taskforce',
    abstract: 'Field deployment report on tracking cross-border bulk mineral shipments using satellite logistics integration and verified port manifest analytics to recover uncollected transit duties.',
    content: `
      <h4>Pilot Deployment Report</h4>
      <p>RAFA's C MINK platform conducted a pilot data audit tracking 1.2M metric tonnes of copper and cobalt concentrate movements across three national border posts along the Central African transit corridor.</p>
      
      <h4>Documented Outcomes</h4>
      <ul>
        <li><strong>Discrepancy Identification:</strong> Real-time reconciliation revealed an average 11.4% variance between mine-site export manifests and final deep-water port loading records.</li>
        <li><strong>Fiscal Recovery:</strong> Participating revenue services identified over $42M in undeclared transit and export adjustments during the pilot period.</li>
      </ul>
    `
  },
  {
    id: 'RAFA-MN-2026-08',
    title: 'Open Concession Modeling & Geological Data Sovereignty: Institutional Guidelines for National Surveys',
    pillar: 'Institution and trust',
    type: 'Methods Note',
    date: 'April 2026',
    readTime: '9 min read',
    author: 'RAFA Data Governance & Ethics Secretariat',
    abstract: 'Guidelines for state geological agencies to retain primary ownership of aeromagnetic and core-sample data, ending historical practices of conceding exploratory intellectual property to private concessionaires.',
    content: `
      <h4>Sovereign Data Governance</h4>
      <p>High-resolution geological data is a sovereign strategic asset. National geological surveys have frequently surrendered proprietary rights to exploration data during concession negotiations, forcing states to buy back their own geological intelligence.</p>
      
      <h4>Core Standards</h4>
      <ul>
        <li><strong>Data Custodianship:</strong> Standardized licensing mandating complete, unencrypted geophysical data returns to state repositories within 90 days of field acquisition.</li>
        <li><strong>Public Open-Access Cadastres:</strong> Guidelines for maintaining transparent, uncorrupted mineral title registries accessible to citizens and researchers.</li>
      </ul>
    `
  }
];

function initInsightsLibrary() {
  const grid = document.getElementById('insights-results-grid');
  const countDisplay = document.getElementById('insights-count-display');
  const searchInput = document.getElementById('insights-search-input');
  const pillarButtons = document.querySelectorAll('[data-filter-pillar]');
  const typeButtons = document.querySelectorAll('[data-filter-type]');

  if (!grid || !countDisplay) return;

  let currentPillar = 'all';
  let currentType = 'all';
  let searchQuery = '';
  let uploadedPublications = [];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function renderPublications() {
    const query = searchQuery.trim().toLowerCase();
    const publications = [...PUBLICATIONS, ...uploadedPublications];

    const filtered = publications.filter(pub => {
      // Pillar filter
      if (currentPillar !== 'all' && pub.pillar !== currentPillar) {
        return false;
      }
      // Type filter
      if (currentType !== 'all' && pub.type !== currentType) {
        return false;
      }
      // Search query
      if (query) {
        const matchTitle = pub.title.toLowerCase().includes(query);
        const matchAbstract = pub.abstract.toLowerCase().includes(query);
        const matchAuthor = pub.author.toLowerCase().includes(query);
        const matchPillar = pub.pillar.toLowerCase().includes(query);
        const matchType = pub.type.toLowerCase().includes(query);
        const matchId = pub.id.toLowerCase().includes(query);

        if (!matchTitle && !matchAbstract && !matchAuthor && !matchPillar && !matchType && !matchId) {
          return false;
        }
      }
      return true;
    });

    // Update count display
    countDisplay.textContent = `Displaying ${filtered.length} of ${publications.length} sovereign intelligence publications`;

    // Render cards
    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: var(--space-2xl); background: #ffffff; border: 1px dashed var(--color-slate-300); border-radius: var(--border-radius-md); text-align: center;">
          <span class="material-symbols-outlined icon-lg" style="color: var(--color-slate-400); margin-bottom: 0.5rem;" aria-hidden="true">search_off</span>
          <h3 style="margin-bottom: 0.5rem;">No publications match your criteria</h3>
          <p style="color: var(--color-slate-600); max-width: 500px; margin: 0 auto var(--space-md);">
            Adjust your search terms, reset your pillar filters, or request a bespoke institutional briefing.
          </p>
          <button type="button" class="btn btn--outline btn--sm" id="reset-filters-btn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filters-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          currentPillar = 'all';
          currentType = 'all';
          pillarButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-pillar') === 'all'));
          typeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-type') === 'all'));
          renderPublications();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(pub => `
      <article class="insight-card" data-pub-id="${escapeHtml(pub.id)}">
        <div class="insight-meta">
          <span class="pillar-pill">${escapeHtml(pub.pillar)}</span>
          <span class="type-pill">${escapeHtml(pub.type)}</span>
          <span style="margin-left: auto;">${escapeHtml(pub.readTime)}</span>
        </div>
        <h3>
          ${pub.uploaded
            ? `<a href="${escapeHtml(pub.fileUrl)}" target="_blank" rel="noopener">${escapeHtml(pub.title)}</a>`
            : `<a href="#" class="open-reader-btn" data-pub-id="${escapeHtml(pub.id)}">${escapeHtml(pub.title)}</a>`}
        </h3>
        <p class="insight-abstract">${escapeHtml(pub.abstract)}</p>
        <div class="insight-author-bar">
          <span>By ${escapeHtml(pub.author)}</span> • <span>${escapeHtml(pub.date)}</span> • <code>${escapeHtml(pub.id)}</code>
        </div>
        <div class="insight-actions">
          ${pub.uploaded
            ? `<a class="btn btn--primary btn--sm" href="${escapeHtml(pub.fileUrl)}" target="_blank" rel="noopener"><span class="material-symbols-outlined icon-xs" aria-hidden="true">picture_as_pdf</span> Read publication PDF</a>`
            : `<button type="button" class="btn btn--primary btn--sm open-reader-btn" data-pub-id="${escapeHtml(pub.id)}"><span class="material-symbols-outlined icon-xs" aria-hidden="true">article</span> Read HTML Brief</button>
              <button type="button" class="btn btn--outline btn--sm download-pdf-btn" data-pub-id="${escapeHtml(pub.id)}" title="PDF/UA accessible document format"><span class="material-symbols-outlined icon-xs" aria-hidden="true">download</span> PDF/UA Specs</button>`}
        </div>
      </article>
    `).join('');

    // Attach event listeners to reader buttons
    grid.querySelectorAll('.open-reader-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-pub-id');
        openPublicationReader(id);
      });
    });

    grid.querySelectorAll('.download-pdf-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-pub-id');
        showToast(`Document [${id}.pdf] prepared under PDF/UA standards. Accessible view open.`);
        openPublicationReader(id);
      });
    });
  }

  async function loadUploadedPublications() {
    if (!window.RafaDemo) {
      return;
    }
    try {
      const savedPublications = await window.RafaDemo.listPublications();
      const loaded = await Promise.all(savedPublications.map(async publication => {
        try {
          const file = await window.RafaDemo.getPublicationFile(publication.id);
          const fileUrl = URL.createObjectURL(file);
          const publicationDate = new Date(`${publication.date}T00:00:00Z`);
          return {
            ...publication,
            uploaded: true,
            fileUrl,
            readTime: 'PDF publication',
            date: Number.isNaN(publicationDate.getTime())
              ? publication.date
              : new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(publicationDate)
          };
        } catch (error) {
          console.error(`Unable to load uploaded publication ${publication.id}.`, error);
          return null;
        }
      }));
      uploadedPublications = loaded.filter(Boolean);
      if (uploadedPublications.length !== savedPublications.length) {
        showToast('One or more uploaded article files could not be opened from this browser.');
      }
      renderPublications();
    } catch (error) {
      console.error('Unable to load the local Insights Library uploads.', error);
      countDisplay.textContent = 'Local article uploads could not be loaded in this browser.';
    }
  }

  function openPublicationReader(pubId) {
    const pub = PUBLICATIONS.find(p => p.id === pubId);
    if (!pub) return;

    const modal = document.getElementById('publication-reader-modal');
    const titleEl = document.getElementById('reader-title');
    const metaEl = document.getElementById('reader-meta');
    const contentEl = document.getElementById('reader-content');

    if (!modal || !titleEl || !metaEl || !contentEl) return;

    titleEl.textContent = pub.title;
    metaEl.innerHTML = `
      <div><strong>Ref:</strong> ${pub.id} | <strong>Pillar:</strong> ${pub.pillar} | <strong>Format:</strong> ${pub.type}</div>
      <div style="margin-top: 0.25rem;"><strong>Lead Author:</strong> ${pub.author} | <strong>Date:</strong> ${pub.date}</div>
    `;
    contentEl.innerHTML = pub.content;

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    }
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderPublications();
    });
  }

  // Pillar buttons
  pillarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      pillarButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPillar = btn.getAttribute('data-filter-pillar') || 'all';
      renderPublications();
    });
  });

  // Format buttons
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.getAttribute('data-filter-type') || 'all';
      renderPublications();
    });
  });

  // Initial render
  renderPublications();
  loadUploadedPublications();
}

/* --------------------------------------------------------------------------
   Form Submissions (engage.html & digest signups)
   -------------------------------------------------------------------------- */
function initForms() {
  // Briefing Request Form
  const briefingForm = document.getElementById('briefing-request-form');
  if (briefingForm) {
    briefingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = briefingForm.querySelector('[name="full_name"]')?.value.trim();
      const org = briefingForm.querySelector('[name="organisation"]')?.value.trim();
      const role = briefingForm.querySelector('[name="role"]')?.value.trim();
      const country = briefingForm.querySelector('[name="country"]')?.value;
      const email = briefingForm.querySelector('[name="email"]')?.value.trim();
      const message = briefingForm.querySelector('[name="message"]')?.value.trim();
      const topic = briefingForm.querySelector('[name="interest_area"]')?.value;
      const consent = briefingForm.querySelector('[name="consent"]')?.checked;

      if (!briefingForm.reportValidity() || !fullName || !org || !role || !country || !email || !message || !topic || !consent) {
        showToast('Please complete all required fields and confirm the institutional protocol agreement.');
        return;
      }

      if (!saveWebsiteInquiry({
        type: 'briefing',
        name: fullName,
        email,
        organisation: org,
        role,
        country,
        topic,
        subject: `Briefing request: ${topic}`,
        message
      })) {
        return;
      }

      const summaryContainer = document.getElementById('briefing-confirmation-summary');
      if (summaryContainer) {
        const confirmation = document.createElement('p');
        confirmation.textContent = 'Thank you. Your briefing request has been received.';
        summaryContainer.replaceChildren(confirmation);
      }

      // Open confirmation modal
      const modal = document.getElementById('briefing-confirmation-modal');
      if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
      }

      briefingForm.reset();
    });
  }

  const generalInquiryForm = document.getElementById('general-inquiry-form');
  if (generalInquiryForm) {
    generalInquiryForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!generalInquiryForm.reportValidity()) {
        return;
      }

      const formData = new FormData(generalInquiryForm);
      const inquiry = Object.fromEntries(formData.entries());
      if (!saveWebsiteInquiry({
        type: 'general',
        name: String(inquiry.name || '').trim(),
        email: String(inquiry.email || '').trim(),
        subject: String(inquiry.subject || '').trim(),
        message: String(inquiry.message || '').trim()
      })) {
        return;
      }

      generalInquiryForm.reset();
      showToast('Thank you. Your message has been received.');
    });
  }

  // Digest signup forms (both on engage.html and insights.html)
  document.querySelectorAll('#digest-signup-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('[name="digest_email"]');
      const email = emailInput?.value.trim();

      if (!form.reportValidity() || !email) {
        showToast('Please provide an official institutional email.');
        return;
      }

      if (!saveWebsiteInquiry({
        type: 'general',
        name: '',
        email,
        subject: 'RAFA Digest subscription request',
        message: 'A visitor requested to receive the monthly RAFA Strategic Intelligence Digest.'
      })) {
        return;
      }

      showToast('Thank you. Your digest request has been received.');
      form.reset();
    });
  });
}

function saveWebsiteInquiry(inquiry) {
  if (!window.RafaDemo) {
    console.error('The inquiry could not be saved because the site inbox is unavailable.');
    showToast('Your inquiry could not be submitted. Please try again later.');
    return false;
  }

  try {
    window.RafaDemo.addInquiry(inquiry);
    return true;
  } catch (error) {
    console.error('Unable to save website inquiry.', error);
    showToast('Your inquiry could not be submitted. Please try again later.');
    return false;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
