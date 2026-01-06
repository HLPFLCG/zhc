/**
 * Bulletproof Security Module for zaitsev.co
 * Implements security best practices, monitoring, and protection
 */

class SecurityManager {
  constructor() {
    this.securityEvents = [];
    this.init();
  }

  init() {
    this.setupContentSecurityPolicyMonitoring();
    this.setupClickjackingProtection();
    this.setupXSSProtection();
    this.setupSecurityHeaders();
    this.trackSecurityEvents();
    this.detectMaliciousActivity();
    this.enforceSecurityPolicies();
  }

  /**
   * Monitor and report Content Security Policy violations
   */
  setupContentSecurityPolicyMonitoring() {
    document.addEventListener('securitypolicyviolation', (event) => {
      this.logSecurityEvent('CSP Violation', {
        violatedDirective: event.violatedDirective,
        effectiveDirective: event.effectiveDirective,
        originalPolicy: event.originalPolicy,
        blockedURI: event.blockedURI,
        sourceFile: event.sourceFile,
        lineNumber: event.lineNumber,
        columnNumber: event.columnNumber,
      });
    });
  }

  /**
   * Prevent clickjacking attacks
   */
  setupClickjackingProtection() {
    // Verify we're not in an iframe
    if (window.self !== window.top) {
      this.logSecurityEvent('Clickjacking Attempt Detected', {
        parentOrigin: window.parent !== window.self ? window.parent.location.href : 'unknown',
        currentOrigin: window.location.href,
      });
      
      // Attempt to break out of iframe
      try {
        window.top.location = window.self.location;
      } catch (e) {
        // If we can't break out, at least warn the user
        console.warn('Security Warning: This page is being loaded in an iframe');
      }
    }
  }

  /**
   * Enhanced XSS protection
   */
  setupXSSProtection() {
    // Sanitize URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const suspiciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
    ];

    for (const [key, value] of urlParams) {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          this.logSecurityEvent('XSS Attempt Detected', {
            parameter: key,
            value: value,
            pattern: pattern.source,
          });
          
          // Remove suspicious parameter
          urlParams.delete(key);
          const cleanUrl = `${window.location.pathname}?${urlParams.toString()}`;
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    }
  }

  /**
   * Verify security headers are present
   */
  setupSecurityHeaders() {
    // Check for critical security headers
    const criticalHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'X-XSS-Protection',
    ];

    // We can't directly check headers from client-side,
    // but we can log a warning if we detect missing protections
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      this.logSecurityEvent('Missing CSP Meta Tag', { type: 'warning' });
    }
  }

  /**
   * Track and log security events
   */
  logSecurityEvent(eventType, details) {
    const event = {
      type: eventType,
      details: details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.securityEvents.push(event);

    // Send to monitoring service (placeholder)
    this.sendToMonitoringService(event);

    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('sandbox')) {
      console.warn('Security Event:', event);
    }
  }

  /**
   * Detect suspicious user behavior
   */
  detectMaliciousActivity() {
    // Detect rapid clicks (potential bot)
    let clickCount = 0;
    let lastClickTime = Date.now();
    
    document.addEventListener('click', () => {
      clickCount++;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime;
      
      if (timeDiff < 100) { // Less than 100ms between clicks
        if (clickCount > 10) {
          this.logSecurityEvent('Suspicious Activity Detected', {
            type: 'rapid_clicks',
            clickCount: clickCount,
            timeWindow: `${timeDiff}ms`,
          });
        }
      } else {
        clickCount = 0;
      }
      
      lastClickTime = currentTime;
    });

    // Detect keyboard automation
    let keyPressCount = 0;
    let lastKeyPressTime = Date.now();
    
    document.addEventListener('keydown', () => {
      keyPressCount++;
      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyPressTime;
      
      if (timeDiff < 50) { // Less than 50ms between keypresses
        if (keyPressCount > 20) {
          this.logSecurityEvent('Suspicious Activity Detected', {
            type: 'rapid_keypresses',
            keyPressCount: keyPressCount,
            timeWindow: `${timeDiff}ms`,
          });
        }
      } else {
        keyPressCount = 0;
      }
      
      lastKeyPressTime = currentTime;
    });
  }

  /**
   * Enforce security policies
   */
  enforceSecurityPolicies() {
    // Prevent right-click on sensitive areas (optional, not foolproof)
    // This is more of a deterrent than actual security
    
    // Sanitize external links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link && link.hostname !== window.location.hostname) {
        link.setAttribute('rel', 'noopener noreferrer');
      }
    }, true);
  }

  /**
   * Send security event to monitoring service
   */
  async sendToMonitoringService(event) {
    // Placeholder - integrate with your monitoring service
    // e.g., Sentry, LogRocket, custom endpoint
    
    try {
      // Send to analytics endpoint
      if (typeof gtag !== 'undefined') {
        gtag('event', 'security_event', {
          event_category: 'Security',
          event_label: event.type,
          value: 1,
        });
      }
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }

  /**
   * Get security report
   */
  getSecurityReport() {
    return {
      totalEvents: this.securityEvents.length,
      eventsByType: this.securityEvents.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {}),
      recentEvents: this.securityEvents.slice(-10),
    };
  }

  /**
   * Clear old security events
   */
  clearOldEvents() {
    const oneHourAgo = Date.now() - 3600000;
    this.securityEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > oneHourAgo
    );
  }
}

// Initialize security manager
const securityManager = new SecurityManager();

// Clear old events every hour
setInterval(() => {
  securityManager.clearOldEvents();
}, 3600000);

// Export for debugging
if (typeof window !== 'undefined') {
  window.SecurityManager = SecurityManager;
  window.securityManager = securityManager;
}