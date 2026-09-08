
document.addEventListener('DOMContentLoaded', () => {
  'use strict';


  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    .nav-links {
      display: flex;
      gap: 16px;
      margin-left: auto;
      list-style: none;
      padding: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
    .nav-links a {
      font-family: var(--font-mono);
      font-size: 0.72rem;
      text-decoration: none;
      color: var(--ink-soft);
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--rust);
      background: rgba(156, 62, 40, 0.08);
    }
    @media (max-width: 768px) {
      .nav-links { display: none; }
    }
    .interactive-organelle {
      cursor: pointer;
      transition: filter 0.2s ease, transform 0.2s ease;
    }
    .interactive-organelle:hover {
      filter: drop-shadow(0 0 6px var(--rust));
      opacity: 0.85;
    }
    .highlight-row {
      animation: rowPulse 2s ease-out;
    }
    @keyframes rowPulse {
      0% { background-color: #f7dcd5 !important; }
      50% { background-color: #f7dcd5 !important; }
      100% { background-color: transparent; }
    }
    .search-container {
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .search-input {
      width: 100%;
      max-width: 400px;
      padding: 10px 16px;
      font-family: var(--font-body);
      font-size: 0.9rem;
      border: 1px solid var(--line-strong);
      border-radius: 6px;
      background: var(--white);
      color: var(--ink);
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .search-input:focus {
      border-color: var(--rust);
      box-shadow: 0 0 0 3px rgba(156, 62, 40, 0.15);
    }
    .back-to-top {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--green-deep);
      color: var(--paper);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
    }
    .back-to-top:hover {
      transform: translateY(-3px);
      background: var(--rust);
    }
  `;
  document.head.appendChild(styleSheet);


  const header = document.getElementById('siteHeader');
  const headerWrap = header?.querySelector('.wrap');

  if (headerWrap) {
    const nav = document.createElement('ul');
    nav.className = 'nav-links';
    nav.innerHTML = `
      <li><a href="#organelles">01 Organelles</a></li>
      <li><a href="#comparison">02 Comparison</a></li>
      <li><a href="#classification">03 Classification</a></li>
      <li><a href="#specialized">04 Specialized</a></li>
      <li><a href="#modifications">05 Specialization</a></li>
    `;
    headerWrap.appendChild(nav);
  }

  function handleScroll() {
    if (window.scrollY > 12) {
      header?.classList.add('is-scrolled');
    } else {
      header?.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });


  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          if (a.getAttribute('href') === `#${activeId}`) {
            a.classList.add('active');
          } else {
            a.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));


  const svg = document.querySelector('.hero-figure svg');
  if (svg) {
    const organelleMap = [
      { selector: '.organelle-nucleus, text:nth-of-type(1)', name: 'Nucleus' },
      { selector: '.organelle-mito, text:nth-of-type(2)', name: 'Mitochondria' },
      { selector: '.organelle-er, text:nth-of-type(3)', name: 'Endoplasmic reticulum' },
      { selector: '.organelle-golgi, text:nth-of-type(4)', name: 'Golgi apparatus' },
      { selector: '.organelle-lyso, text:nth-of-type(5)', name: 'Lysosomes' },
      { selector: '.cell-outline, text:nth-of-type(6)', name: 'Cell membrane' }
    ];

    organelleMap.forEach(item => {
      const elements = svg.querySelectorAll(item.selector);
      elements.forEach(el => {
        el.classList.add('interactive-organelle');
        el.addEventListener('click', () => {
          jumpToOrganelleRow(item.name);
        });
      });
    });
  }

  function jumpToOrganelleRow(organelleName) {
    const rows = document.querySelectorAll('#organelles table tbody tr');
    let targetRow = null;

    rows.forEach(row => {
      const firstCell = row.querySelector('td:first-child');
      if (firstCell && firstCell.textContent.toLowerCase().includes(organelleName.toLowerCase())) {
        targetRow = row;
      }
    });

    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetRow.classList.remove('highlight-row');
      // Trigger reflow to restart CSS animation
      void targetRow.offsetWidth;
      targetRow.classList.add('highlight-row');
    }
  }


  const organellesSection = document.getElementById('organelles');
  if (organellesSection) {
    const wrap = organellesSection.querySelector('.wrap');
    const partHead = organellesSection.querySelector('.part-head');

    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
      <input type="text" class="search-input" placeholder="Search structures or functions (e.g., ATP, DNA, wall)..." aria-label="Search cell structures">
    `;

    if (partHead && partHead.nextSibling) {
      wrap.insertBefore(searchContainer, partHead.nextSibling);
    }

    const searchInput = searchContainer.querySelector('.search-input');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const allTables = organellesSection.querySelectorAll('table');

      allTables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          if (text.includes(query)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });
  }


  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
  document.body.appendChild(backToTopBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
