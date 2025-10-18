// Google Analytics 4 Setup
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID

(function() {
    'use strict';

    // ==================== GOOGLE ANALYTICS 4 CONFIGURATION ====================
    
    // TODO: Replace with your actual GA4 Measurement ID
    const GA4_MEASUREMENT_ID = 'G-XXXXXXXXXX';
    
    // Load Google Analytics
    const loadGA4 = () => {
        // Create script tag for gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
        document.head.appendChild(script);

        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID, {
            'send_page_view': true,
            'anonymize_ip': true, // GDPR compliance
            'cookie_flags': 'SameSite=None;Secure'
        });

        console.log('✅ Google Analytics 4 loaded');
    };

    // ==================== CUSTOM EVENT TRACKING ====================
    
    // Track outbound links
    const trackOutboundLinks = () => {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.hostname !== window.location.hostname) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'Outbound Link',
                        event_label: link.href,
                        transport_type: 'beacon'
                    });
                }
            }
        });
    };

    // Track file downloads
    const trackDownloads = () => {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const fileExtensions = /\.(pdf|doc|docx|xls|xlsx|zip|rar|jpg|jpeg|png|gif)$/i;
                if (fileExtensions.test(link.href)) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'file_download', {
                            event_category: 'Downloads',
                            event_label: link.href,
                            file_extension: link.href.split('.').pop()
                        });
                    }
                }
            }
        });
    };

    // Track video plays (if you add videos later)
    const trackVideoPlays = () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.addEventListener('play', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'video_start', {
                        event_category: 'Video',
                        event_label: video.src || 'Embedded Video'
                    });
                }
            });
        });
    };

    // Track form field interactions
    const trackFormInteractions = () => {
        const formFields = document.querySelectorAll('input, textarea, select');
        
        formFields.forEach(field => {
            let interacted = false;
            
            field.addEventListener('focus', () => {
                if (!interacted && typeof gtag !== 'undefined') {
                    interacted = true;
                    gtag('event', 'form_field_focus', {
                        event_category: 'Form Interaction',
                        event_label: field.name || field.id || 'unnamed_field'
                    });
                }
            });
        });
    };

    // Track search queries (if you add search later)
    const trackSearch = () => {
        const searchForms = document.querySelectorAll('form[role="search"]');
        
        searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const searchInput = form.querySelector('input[type="search"]');
                if (searchInput && typeof gtag !== 'undefined') {
                    gtag('event', 'search', {
                        search_term: searchInput.value
                    });
                }
            });
        });
    };

    // Track page engagement time
    const trackEngagement = () => {
        let engagementTime = 0;
        let isActive = true;
        
        // Track active time
        const interval = setInterval(() => {
            if (isActive) {
                engagementTime += 10;
                
                // Send engagement event every 30 seconds
                if (engagementTime % 30 === 0 && typeof gtag !== 'undefined') {
                    gtag('event', 'user_engagement', {
                        engagement_time_msec: engagementTime * 1000
                    });
                }
            }
        }, 10000); // Check every 10 seconds

        // Detect if user is active
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                isActive = true;
            }, { passive: true });
        });

        // Detect if user is inactive
        document.addEventListener('visibilitychange', () => {
            isActive = !document.hidden;
        });

        // Clear interval on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
        });
    };

    // ==================== CONVERSION TRACKING ====================
    
    // Track contact form submission as conversion
    window.trackConversion = (conversionType, value) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'send_to': GA4_MEASUREMENT_ID,
                'event_category': 'Conversion',
                'event_label': conversionType,
                'value': value || 1
            });
        }
    };

    // ==================== COOKIE CONSENT INTEGRATION ====================
    
    // Check if user has consented to analytics cookies
    const hasAnalyticsConsent = () => {
        return localStorage.getItem('analytics_consent') === 'true';
    };

    // Initialize analytics only if consent is given
    const initWithConsent = () => {
        if (hasAnalyticsConsent()) {
            loadGA4();
            trackOutboundLinks();
            trackDownloads();
            trackVideoPlays();
            trackFormInteractions();
            trackSearch();
            trackEngagement();
        } else {
            console.log('⚠️ Analytics not loaded - awaiting user consent');
        }
    };

    // Listen for consent changes
    window.addEventListener('analytics_consent_granted', () => {
        localStorage.setItem('analytics_consent', 'true');
        initWithConsent();
    });

    window.addEventListener('analytics_consent_revoked', () => {
        localStorage.setItem('analytics_consent', 'false');
        console.log('⚠️ Analytics consent revoked');
    });

    // ==================== INITIALIZE ====================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWithConsent);
    } else {
        initWithConsent();
    }

})();

// ==================== HELPER FUNCTIONS ====================

// Grant analytics consent (call this from cookie banner)
window.grantAnalyticsConsent = () => {
    const event = new Event('analytics_consent_granted');
    window.dispatchEvent(event);
};

// Revoke analytics consent
window.revokeAnalyticsConsent = () => {
    const event = new Event('analytics_consent_revoked');
    window.dispatchEvent(event);
};