// Cookie Consent Banner - GDPR/CCPA Compliant

(function() {
    'use strict';

    // ==================== COOKIE CONSENT CONFIGURATION ====================
    
    const CONSENT_COOKIE_NAME = 'cookie_consent';
    const CONSENT_EXPIRY_DAYS = 365;

    // ==================== COOKIE UTILITIES ====================
    
    const setCookie = (name, value, days) => {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
    };

    const getCookie = (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    // ==================== CREATE CONSENT BANNER ====================
    
    const createConsentBanner = () => {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');
        banner.setAttribute('aria-describedby', 'cookie-consent-description');
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3>We Value Your Privacy</h3>
                    <p id="cookie-consent-description">
                        We use cookies to enhance your browsing experience, analyze site traffic, 
                        and personalize content. By clicking "Accept All", you consent to our use of cookies. 
                        <a href="privacy.html" target="_blank">Learn more</a>
                    </p>
                </div>
                <div class="cookie-consent-actions">
                    <button class="btn btn-secondary" id="cookie-settings-btn">
                        Cookie Settings
                    </button>
                    <button class="btn btn-secondary" id="cookie-reject-btn">
                        Reject All
                    </button>
                    <button class="btn btn-primary" id="cookie-accept-btn">
                        Accept All
                    </button>
                </div>
            </div>
        `;

        return banner;
    };

    // ==================== CREATE SETTINGS MODAL ====================
    
    const createSettingsModal = () => {
        const modal = document.createElement('div');
        modal.className = 'cookie-settings-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'cookie-settings-title');
        
        modal.innerHTML = `
            <div class="cookie-settings-content">
                <div class="cookie-settings-header">
                    <h2 id="cookie-settings-title">Cookie Settings</h2>
                    <button class="cookie-settings-close" aria-label="Close settings">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="cookie-settings-body">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h3>Essential Cookies</h3>
                            <span class="cookie-status">Always Active</span>
                        </div>
                        <p>
                            These cookies are necessary for the website to function and cannot be disabled. 
                            They are usually only set in response to actions made by you such as setting 
                            your privacy preferences or filling in forms.
                        </p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h3>Analytics Cookies</h3>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="analytics-cookies" checked>
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>
                            These cookies help us understand how visitors interact with our website by 
                            collecting and reporting information anonymously. This helps us improve our 
                            website and your experience.
                        </p>
                    </div>
                    
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h3>Marketing Cookies</h3>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="marketing-cookies">
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p>
                            These cookies may be set through our site by our advertising partners. 
                            They may be used to build a profile of your interests and show you relevant 
                            ads on other sites.
                        </p>
                    </div>
                </div>
                <div class="cookie-settings-footer">
                    <button class="btn btn-secondary" id="cookie-save-settings">
                        Save Settings
                    </button>
                    <button class="btn btn-primary" id="cookie-accept-all">
                        Accept All
                    </button>
                </div>
            </div>
        `;

        return modal;
    };

    // ==================== CONSENT MANAGEMENT ====================
    
    const saveConsent = (preferences) => {
        const consentData = {
            essential: true,
            analytics: preferences.analytics || false,
            marketing: preferences.marketing || false,
            timestamp: new Date().toISOString()
        };

        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consentData), CONSENT_EXPIRY_DAYS);
        localStorage.setItem('cookie_preferences', JSON.stringify(consentData));

        // Trigger analytics consent event if analytics are enabled
        if (consentData.analytics) {
            window.grantAnalyticsConsent && window.grantAnalyticsConsent();
        } else {
            window.revokeAnalyticsConsent && window.revokeAnalyticsConsent();
        }

        return consentData;
    };

    const getConsent = () => {
        const cookie = getCookie(CONSENT_COOKIE_NAME);
        if (cookie) {
            try {
                return JSON.parse(cookie);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const hasConsent = () => {
        return getConsent() !== null;
    };

    // ==================== EVENT HANDLERS ====================
    
    const handleAcceptAll = () => {
        saveConsent({
            analytics: true,
            marketing: true
        });
        hideBanner();
        hideModal();
    };

    const handleRejectAll = () => {
        saveConsent({
            analytics: false,
            marketing: false
        });
        hideBanner();
        hideModal();
    };

    const handleSaveSettings = () => {
        const analytics = document.getElementById('analytics-cookies')?.checked || false;
        const marketing = document.getElementById('marketing-cookies')?.checked || false;
        
        saveConsent({
            analytics,
            marketing
        });
        hideModal();
        hideBanner();
    };

    const hideBanner = () => {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    };

    const showModal = () => {
        const modal = document.querySelector('.cookie-settings-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first interactive element
            const firstButton = modal.querySelector('button, input');
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 100);
            }
        }
    };

    const hideModal = () => {
        const modal = document.querySelector('.cookie-settings-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // ==================== INITIALIZE ====================
    
    const init = () => {
        // Check if consent already given
        if (hasConsent()) {
            const consent = getConsent();
            if (consent.analytics) {
                window.grantAnalyticsConsent && window.grantAnalyticsConsent();
            }
            return;
        }

        // Create and show banner
        const banner = createConsentBanner();
        document.body.appendChild(banner);

        // Create settings modal
        const modal = createSettingsModal();
        document.body.appendChild(modal);

        // Animate banner in
        setTimeout(() => {
            banner.style.opacity = '1';
            banner.style.transform = 'translateY(0)';
        }, 100);

        // Event listeners
        document.getElementById('cookie-accept-btn')?.addEventListener('click', handleAcceptAll);
        document.getElementById('cookie-reject-btn')?.addEventListener('click', handleRejectAll);
        document.getElementById('cookie-settings-btn')?.addEventListener('click', showModal);
        document.getElementById('cookie-save-settings')?.addEventListener('click', handleSaveSettings);
        document.getElementById('cookie-accept-all')?.addEventListener('click', handleAcceptAll);
        
        // Close modal button
        document.querySelector('.cookie-settings-close')?.addEventListener('click', hideModal);
        
        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                hideModal();
            }
        });
    };

    // ==================== PUBLIC API ====================
    
    window.cookieConsent = {
        show: init,
        hide: hideBanner,
        getPreferences: getConsent,
        updatePreferences: saveConsent
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();