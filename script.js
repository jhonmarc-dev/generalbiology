

(function () {
  'use strict';

  
  const CONFIG = {
    themeKey: 'genbio_theme_pref',
    headerOffset: 80, // Accounts for sticky header height
  };

  const DOM = {
    root: document.documentElement,
    header: document.getElementById('siteHeader'),
    nav: document.getElementById('primaryNav'),
    navToggle: document.getElementById('navToggle'),
    navLinks: document.querySelectorAll('.nav-link'),
    themeToggle: document.getElementById('themeToggle'),
    metaTheme: document.querySelector('meta[name="theme-color"]'),
    progressBar: document.querySelector('#readingProgress span'),
    backToTopBtn: document.getElementById('backToTop'),
    backToTopFooter: document.getElementById('backToTopFooter'),
    printBtn: document.getElementById('printBtn'),
    footerYear: document.getElementById('footerYear'),
    svgCell: document.getElementById('interactiveCellSvg'),
    organelles: document.querySelectorAll('.svg-organelle'),
    labelGroups: document.querySelectorAll('.label-group'),
    filterGroups: document.querySelectorAll('.filter-group'),
    reveals: document.querySelectorAll('.reveal'),
    partSections: document.querySelectorAll('.part-section, .hero')
  };

  // -- THEME---
  const ThemeManager = {
    init() {
      const savedTheme = this.getStoredTheme();
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
      
      this.applyTheme(initialTheme, false);

      if (DOM.themeToggle) {
        DOM.themeToggle.addEventListener('click', () => {
          const current = DOM.root.getAttribute('data-theme');
          const next = current === 'dark' ? 'light' : 'dark';
          this.applyTheme(next, true);
        });
      }

    
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light', false);
        }
      });
    },

    getStoredTheme() {
      try { return localStorage.getItem(CONFIG.themeKey); } catch (e) { return null; }
    },

    applyTheme(theme, save = false) {
      DOM.root.setAttribute('data-theme', theme);
      if (DOM.themeToggle) {
        DOM.themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      }
      if (DOM.metaTheme) {
        DOM.metaTheme.setAttribute('content', theme === 'dark' ? '#0F172A' : '#1B3B22');
      }
      if (save) {
        try { localStorage.setItem(CONFIG.themeKey, theme); } catch (e) {}
      }
    }
  };

  //-- NAVIGATION ---
  const NavEngine = {
    init() {
      if (!DOM.navToggle || !DOM.nav) return;

      DOM.navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNav();
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (DOM.nav.classList.contains('is-open') && !DOM.nav.contains(e.target) && !DOM.navToggle.contains(e.target)) {
          this.closeNav();
        }
      });

      // Close menu on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.nav.classList.contains('is-open')) {
          this.closeNav();
          DOM.navToggle.focus();
        }
      });

      
      DOM.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          this.closeNav();
        });
      });
    },

    toggleNav() {
      const isOpen = DOM.nav.classList.toggle('is-open');
      DOM.navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        document.body.style.overflow = window.innerWidth <= 768 ? 'hidden' : '';
      } else {
        document.body.style.overflow = '';
      }
    },

    closeNav() {
      DOM.nav.classList.remove('is-open');
      DOM.navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };


  const ScrollEngine = {
    ticking: false,

    init() {
      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          window.requestAnimationFrame(() => {
            this.onScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
      }, { passive: true });

    
      [DOM.backToTopBtn, DOM.backToTopFooter].forEach(btn => {
        if (btn) {
          btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
        }
      });

      this.initScrollspy();
      this.initSmoothScrollAnchors();
    },

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0;

      
      if (DOM.progressBar) {
        DOM.progressBar.style.width = `${progress}%`;
      }

      
      if (DOM.header) {
        DOM.header.classList.toggle('is-scrolled', scrollTop > 20);
      }

      
      if (DOM.backToTopBtn) {
        DOM.backToTopBtn.classList.toggle('is-visible', scrollTop > 350);
      }
    },

    initScrollspy() {
      if (!('IntersectionObserver' in window)) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            if (!id) return;
            DOM.navLinks.forEach(link => {
              const href = link.getAttribute('href').replace('#', '');
              if (href === id) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'location');
              } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px'
      });

      DOM.partSections.forEach(section => observer.observe(section));
    },

    initSmoothScrollAnchors() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          if (targetId === '#' || targetId === '#top') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - CONFIG.headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      });
    }
  };

  
  const DiagramEngine = {
    init() {
      if (!DOM.svgCell) return;

      
      DOM.labelGroups.forEach(label => {
        const targetId = label.getAttribute('data-target');
        
        const highlight = (active) => {
          const organelle = document.getElementById(`svg-${targetId}`);
          if (organelle) organelle.classList.toggle('is-highlighted', active);
          label.classList.toggle('is-active', active);
        };

        label.addEventListener('mouseenter', () => highlight(true));
        label.addEventListener('mouseleave', () => highlight(false));

        // Touch device handling
        label.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const isHighlighted = label.classList.contains('is-active');
          this.clearAllHighlights();
          if (!isHighlighted) highlight(true);
        }, { passive: false });
      });

      
      DOM.organelles.forEach(organelle => {
        const targetId = organelle.getAttribute('data-target');
        
        const highlight = (active) => {
          organelle.classList.toggle('is-highlighted', active);
          const label = document.querySelector(`.label-group[data-target="${targetId}"]`);
          if (label) label.classList.toggle('is-active', active);
        };

        organelle.addEventListener('mouseenter', () => highlight(true));
        organelle.addEventListener('mouseleave', () => highlight(false));

        organelle.addEventListener('click', () => {
          const isHighlighted = organelle.classList.contains('is-highlighted');
          this.clearAllHighlights();
          if (!isHighlighted) highlight(true);
        });
      });
    },

    clearAllHighlights() {
      DOM.organelles.forEach(el => el.classList.remove('is-highlighted'));
      DOM.labelGroups.forEach(el => el.classList.remove('is-active', 'is-highlighted'));
    }
  };

  
  const TableEngine = {
    init() {
      DOM.filterGroups.forEach(group => {
        const tableId = group.getAttribute('data-table');
        const table = document.getElementById(tableId);
        if (!table) return;

        const buttons = group.querySelectorAll('.filter-pill');
        const rows = table.querySelectorAll('tbody tr');

        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            // Active state toggle
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            rows.forEach(row => {
              const category = row.getAttribute('data-category');
              const isMatch = filter === 'all' || category === filter || (category && category.includes(filter));

              if (isMatch) {
                row.style.display = '';
                row.style.animation = 'fadeInRow 0.3s ease forwards';
              } else {
                row.style.display = 'none';
              }
            });
          });
        });
      });
    }
  };

  
  const RevealEngine = {
    init() {
      if (!('IntersectionObserver' in window)) {
        DOM.reveals.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
      });

      DOM.reveals.forEach(el => observer.observe(el));
    }
  };

  
  const Utils = {
    init() {
      // PDF Print Trigger
      if (DOM.printBtn) {
        DOM.printBtn.addEventListener('click', () => window.print());
      }

    
      if (DOM.footerYear) {
        DOM.footerYear.textContent = new Date().getFullYear();
      }
    }
  };

  
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    NavEngine.init();
    ScrollEngine.init();
    DiagramEngine.init();
    TableEngine.init();
    RevealEngine.init();
    Utils.init();
  });
})();
