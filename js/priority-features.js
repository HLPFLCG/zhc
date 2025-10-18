// Priority Features JavaScript
// Dark Mode, Sticky CTA, Scroll to Top, Analytics

(function() {
    'use strict';

    // ==================== DARK MODE TOGGLE ====================
    const initDarkMode = () => {
        // Check for saved theme preference or default to dark
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);

        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        themeToggle.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        document.body.appendChild(themeToggle);

        // Toggle theme on click
        themeToggle.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            themeToggle.innerHTML = newTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
            
            // Announce to screen readers
            const announcement = `${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`;
            announceToScreenReader(announcement);
        });
    };

    // ==================== STICKY CTA BUTTON ====================
    const initStickyCTA = () => {
        const stickyCTA = document.createElement('div');
        stickyCTA.className = 'sticky-cta';
        stickyCTA.innerHTML = '<a href="contact.html" class="btn btn-primary">Contact Us</a>';
        document.body.appendChild(stickyCTA);

        // Show/hide based on scroll position
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Show after scrolling past hero (typically 100vh)
            if (currentScroll > window.innerHeight && currentScroll > lastScroll) {
                stickyCTA.classList.add('visible');
            } else if (currentScroll < 500) {
                stickyCTA.classList.remove('visible');
            }
            
            lastScroll = currentScroll;
        });
    };

    // ==================== SCROLL TO TOP BUTTON ====================
    const initScrollToTop = () => {
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    // ==================== SKIP TO MAIN CONTENT ====================
    const initSkipLink = () => {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus();
                mainContent.scrollIntoView({ behavior: 'smooth' });
            }
        });
    };

    // ==================== LOADING OVERLAY ====================
    const createLoadingOverlay = () => {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');
        overlay.setAttribute('aria-label', 'Loading');
        document.body.appendChild(overlay);
        return overlay;
    };

    window.showLoading = () => {
        const overlay = document.querySelector('.loading-overlay') || createLoadingOverlay();
        overlay.classList.add('active');
    };

    window.hideLoading = () => {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    };

    // ==================== KEYBOARD NAVIGATION IMPROVEMENTS ====================
    const improveKeyboardNav = () => {
        // Trap focus in mobile menu when open
        const mobileMenu = document.getElementById('navMenu');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (mobileMenu && mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                
                if (isExpanded) {
                    // Focus first link in menu
                    const firstLink = mobileMenu.querySelector('a');
                    if (firstLink) {
                        setTimeout(() => firstLink.focus(), 100);
                    }
                }
            });

            // Trap focus within menu
            mobileMenu.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && mobileMenu.classList.contains('active')) {
                    const focusableElements = mobileMenu.querySelectorAll('a, button');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + H = Home
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                window.location.href = 'index.html';
            }
            // Alt + C = Contact
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                window.location.href = 'contact.html';
            }
            // Alt + P = Portfolio
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                window.location.href = 'portfolio.html';
            }
        });
    };

    // ==================== SCREEN READER ANNOUNCEMENTS ====================
    const announceToScreenReader = (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };

    // ==================== ANALYTICS TRACKING ====================
    const initAnalytics = () => {
        // Track page views
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }

        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, a[href]');
            if (button && typeof gtag !== 'undefined') {
                const text = button.textContent.trim();
                const href = button.getAttribute('href');
                
                gtag('event', 'click', {
                    event_category: 'Button',
                    event_label: text,
                    value: href
                });
            }
        });

        // Track form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'Form',
                        event_label: form.id || 'contact_form'
                    });
                }
            });
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
                maxScroll = scrollPercent;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        event_category: 'Engagement',
                        event_label: `${scrollPercent}%`,
                        value: scrollPercent
                    });
                }
            }
        });

        // Track time on page
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Math.round((Date.now() - startTime) / 1000);
            if (typeof gtag !== 'undefined') {
                gtag('event', 'timing_complete', {
                    name: 'time_on_page',
                    value: timeOnPage,
                    event_category: 'Engagement'
                });
            }
        });
    };

    // ==================== TOUCH GESTURES FOR MOBILE ====================
    const initTouchGestures = () => {
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        
        portfolioCards.forEach(card => {
            let touchStartX = 0;
            let touchEndX = 0;

            card.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            card.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe(card);
            }, { passive: true });

            const handleSwipe = (element) => {
                const swipeThreshold = 50;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        // Swipe left - next card
                        const nextCard = element.nextElementSibling;
                        if (nextCard && nextCard.classList.contains('portfolio-card')) {
                            nextCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    } else {
                        // Swipe right - previous card
                        const prevCard = element.previousElementSibling;
                        if (prevCard && prevCard.classList.contains('portfolio-card')) {
                            prevCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                }
            };
        });
    };

    // ==================== INITIALIZE ALL FEATURES ====================
    const init = () => {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all features
        initDarkMode();
        initStickyCTA();
        initScrollToTop();
        initSkipLink();
        improveKeyboardNav();
        initAnalytics();
        initTouchGestures();

        console.log('✅ Priority features initialized');
    };

    // Start initialization
    init();

})();