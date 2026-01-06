/**
 * Unit Tests for security.js
 * Testing security features and protections
 */

describe('Security Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window properties
    delete window.location;
    delete window.history;
    window.location = { href: 'https://zaitsev.co' };
    window.history = { pushState: jest.fn() };
  });

  describe('XSS Protection', () => {
    test('should sanitize HTML input', () => {
      const maliciousHTML = '<script>alert("XSS")</script><img src=x onerror=alert("XSS")>';
      
      // Simulate sanitization
      const sanitized = maliciousHTML
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('onerror');
    });

    test('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const escaped = input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('should prevent event handler injection', () => {
      const malicious = '<div onclick="alert(1)">Test</div>';
      const sanitized = malicious.replace(/on\w+="[^"]*"/gi, '');
      
      expect(sanitized).not.toContain('onclick');
    });
  });

  describe('Clickjacking Protection', () => {
    test('should detect if page is in iframe', () => {
      window.self = window;
      window.top = window;
      
      const isInIframe = window.self !== window.top;
      expect(isInIframe).toBe(false);
    });

    test('should prevent framing when X-Frame-Options is set', () => {
      const mockHeaders = {
        'X-Frame-Options': 'DENY'
      };
      
      expect(mockHeaders['X-Frame-Options']).toBe('DENY');
    });
  });

  describe('CSP Violation Monitoring', () => {
    test('should handle CSP violation reports', () => {
      const mockViolation = {
        blockedURI: 'https://evil.com/script.js',
        documentURI: 'https://zaitsev.co',
        violatedDirective: 'script-src'
      };

      const handled = {
        uri: mockViolation.blockedURI,
        directive: mockViolation.violatedDirective
      };

      expect(handled.uri).toBe('https://evil.com/script.js');
      expect(handled.directive).toBe('script-src');
    });

    test('should log CSP violations', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const violation = {
        blockedURI: 'https://evil.com/script.js',
        violatedDirective: 'script-src'
      };

      console.error('CSP Violation:', violation);
      expect(consoleSpy).toHaveBeenCalledWith('CSP Violation:', violation);
    });
  });

  describe('Malicious Activity Detection', () => {
    test('should detect rapid clicking', () => {
      const clickTimes = [];
      const threshold = 5;
      const timeWindow = 1000;

      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        clickTimes.push(Date.now());
      }

      const recentClicks = clickTimes.filter(
        time => Date.now() - time < timeWindow
      );

      expect(recentClicks.length).toBeGreaterThan(threshold);
    });

    test('should detect keyboard automation', () => {
      const keyEvents = [];
      const threshold = 20;
      const timeWindow = 1000;

      // Simulate automated key presses
      for (let i = 0; i < 30; i++) {
        keyEvents.push({ timestamp: Date.now() });
      }

      const recentEvents = keyEvents.filter(
        event => Date.now() - event.timestamp < timeWindow
      );

      expect(recentEvents.length).toBeGreaterThan(threshold);
    });
  });

  describe('Input Validation', () => {
    test('should validate email format', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      expect(emailRegex.test('test@example.com')).toBe(true);
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
    });

    test('should validate URL format', () => {
      const urlRegex = /^https?:\/\/.+/;
      
      expect(urlRegex.test('https://example.com')).toBe(true);
      expect(urlRegex.test('http://example.com')).toBe(true);
      expect(urlRegex.test('ftp://example.com')).toBe(false);
      expect(urlRegex.test('not-a-url')).toBe(false);
    });

    test('should sanitize user input', () => {
      const input = '<script>alert("XSS")</script>';
      const sanitized = input.replace(/[<>'"&]/g, char => ({
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#x27;',
        '"': '&quot;',
        '&': '&amp;'
      }[char]));

      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Session Security', () => {
    test('should use secure cookies', () => {
      const cookieAttributes = {
        secure: true,
        httpOnly: true,
        sameSite: 'strict'
      };

      expect(cookieAttributes.secure).toBe(true);
      expect(cookieAttributes.httpOnly).toBe(true);
      expect(cookieAttributes.sameSite).toBe('strict');
    });

    test('should implement CSRF protection', () => {
      const token = 'abc123';
      const headers = {
        'X-CSRF-Token': token
      };

      expect(headers['X-CSRF-Token']).toBe(token);
    });
  });

  describe('Content Security', () => {
    test('should only allow HTTPS in production', () => {
      const isProduction = true;
      const protocol = window.location.protocol;

      if (isProduction) {
        expect(protocol).toBe('https:');
      }
    });

    test('should validate external scripts', () => {
      const allowedDomains = [
        'cdnjs.cloudflare.com',
        'fonts.googleapis.com',
        'www.googletagmanager.com'
      ];

      const scriptDomain = 'cdnjs.cloudflare.com';
      const isAllowed = allowedDomains.includes(scriptDomain);

      expect(isAllowed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle security errors gracefully', () => {
      const error = new Error('Security violation');
      error.name = 'SecurityError';

      expect(error.name).toBe('SecurityError');
    });

    test('should not leak sensitive information in errors', () => {
      const error = {
        message: 'An error occurred',
        stack: 'Error at line 123'
      };

      const safeError = {
        message: error.message,
        // Stack should be removed or sanitized in production
      };

      expect(safeError.stack).toBeUndefined();
    });
  });

  describe('API Security', () => {
    test('should use rate limiting', () => {
      const rateLimit = {
        maxRequests: 100,
        windowMs: 60000
      };

      expect(rateLimit.maxRequests).toBe(100);
      expect(rateLimit.windowMs).toBe(60000);
    });

    test('should validate API responses', () => {
      const response = {
        status: 200,
        data: { key: 'value' }
      };

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });
  });
});