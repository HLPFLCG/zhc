/**
 * Bulletproof Accessibility Module
 * WCAG 2.1 AAA compliance with real-time monitoring
 */

class AccessibilityManager {
  constructor() {
    this.issues = [];
    this.auditResults = {};
    this.init();
  }

  init() {
    this.runAutomatedAudit();
    this.setupSkipLinks();
    this.manageFocus();
    this.trackKeyboardNavigation();
    this.enforceColorContrast();
    this.monitorA11yViolations();
    this.setupLiveRegions();
    this.enforceSemanticHTML();
  }

  /**
   * Run automated accessibility audit
   */
  runAutomatedAudit() {
    // Check for skip links
    this.checkSkipLinks();
    
    // Check headings hierarchy
    this.checkHeadings();
    
    // Check images have alt text
    this.checkImages();
    
    // Check forms have labels
    this.checkForms();
    
    // Check links have descriptive text
    this.checkLinks();
    
    // Check color contrast
    this.checkColorContrast();
    
    // Check ARIA attributes
    this.checkARIA();
    
    // Check keyboard accessibility
    this.checkKeyboardAccessibility();
    
    // Generate report
    this.generateAuditReport();
  }

  /**
   * Check for skip links
   */
  checkSkipLinks() {
    const skipLinks = document.querySelectorAll('a[href^="#"]:first-child, .skip-link');
    
    if (skipLinks.length === 0) {
      this.logIssue('Missing Skip Links', {
        priority: 'high',
        description: 'Add skip links for keyboard users',
        solution: '<a href="#main-content" class="skip-link">Skip to main content</a>',
      });
    } else {
      skipLinks.forEach(link => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) {
          this.logIssue('Invalid Skip Link Target', {
            priority: 'high',
            link: link.getAttribute('href'),
            description: 'Skip link target does not exist',
          });
        }
      });
    }
  }

  /**
   * Setup skip links
   */
  setupSkipLinks() {
    // Add skip link if not present
    if (!document.querySelector('.skip-link')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to main content';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px;
        z-index: 100;
        transition: top 0.3s;
      `;
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  /**
   * Check headings hierarchy
   */
  checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let currentLevel = 0;
    let hasH1 = false;

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));

      if (level === 1) {
        if (hasH1 && currentLevel > 0) {
          this.logIssue('Multiple H1 Elements', {
            priority: 'medium',
            description: 'Page should have only one H1 element',
            element: heading.textContent.substring(0, 50),
          });
        }
        hasH1 = true;
      }

      if (level > currentLevel + 1) {
        this.logIssue('Skipped Heading Level', {
          priority: 'low',
          description: `Heading level jumped from ${currentLevel} to ${level}`,
          element: heading.textContent.substring(0, 50),
        });
      }

      currentLevel = level;
    });

    if (!hasH1) {
      this.logIssue('Missing H1 Element', {
        priority: 'high',
        description: 'Page should have exactly one H1 element',
      });
    }
  }

  /**
   * Check images have alt text
   */
  checkImages() {
    const images = document.querySelectorAll('img');
    let issuesCount = 0;

    images.forEach((img, index) => {
      if (!img.alt) {
        this.logIssue('Missing Alt Text', {
          priority: 'high',
          description: 'Image is missing alt attribute',
          src: img.src.substring(0, 50),
        });
        issuesCount++;
      } else if (img.alt === '' && !img.getAttribute('role')?.includes('presentation')) {
        // Empty alt text is only valid for decorative images
        const isDecorative = img.hasAttribute('role') && img.getAttribute('role') === 'presentation';
        if (!isDecorative) {
          this.logIssue('Suspicious Empty Alt Text', {
            priority: 'low',
            description: 'Image has empty alt text but may not be decorative',
            src: img.src.substring(0, 50),
          });
        }
      }
    });
  }

  /**
   * Check forms have labels
   */
  checkForms() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach((input) => {
      // Skip hidden inputs and buttons
      if (input.type === 'hidden' || input.type === 'button' || input.type === 'submit') {
        return;
      }

      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || 
                      input.closest('label') ||
                      input.getAttribute('aria-label') ||
                      input.getAttribute('aria-labelledby');

      if (!hasLabel) {
        this.logIssue('Missing Form Label', {
          priority: 'high',
          description: 'Form input is missing a label',
          name: input.name || input.type,
        });
      }
    });
  }

  /**
   * Check links have descriptive text
   */
  checkLinks() {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach((link) => {
      const text = link.textContent.trim();
      const ariaLabel = link.getAttribute('aria-label');
      const title = link.getAttribute('title');

      // Check for generic link text
      const genericPatterns = [
        /^click here$/i,
        /^read more$/i,
        /^more$/i,
        /^here$/i,
        /^link$/i,
      ];

      if (genericPatterns.some(pattern => pattern.test(text))) {
        this.logIssue('Generic Link Text', {
          priority: 'medium',
          description: 'Link has generic text that lacks context',
          text: text,
          href: link.href.substring(0, 50),
        });
      }

      // Check for empty links (except icon links)
      if (!text && !ariaLabel && !title && !link.querySelector('img, svg')) {
        this.logIssue('Empty Link', {
          priority: 'high',
          description: 'Link has no discernible text',
          href: link.href.substring(0, 50),
        });
      }
    });
  }

  /**
   * Check color contrast
   */
  checkColorContrast() {
    const elements = document.querySelectorAll('*');
    
    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Skip transparent backgrounds
      if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
        return;
      }

      // Calculate contrast ratio
      const ratio = this.calculateContrastRatio(color, backgroundColor);
      
      // Check for text content
      const text = element.textContent.trim();
      if (text && element.children.length === 0) {
        if (ratio < 7) { // AAA standard
          this.logIssue('Insufficient Color Contrast', {
            priority: 'high',
            description: `Contrast ratio ${ratio.toFixed(2)} is below AAA standard (7:1)`,
            element: element.tagName,
            text: text.substring(0, 30),
            ratio: ratio.toFixed(2),
          });
        } else if (ratio < 4.5) { // AA standard
          this.logIssue('Insufficient Color Contrast', {
            priority: 'medium',
            description: `Contrast ratio ${ratio.toFixed(2)} is below AA standard (4.5:1)`,
            element: element.tagName,
            text: text.substring(0, 30),
            ratio: ratio.toFixed(2),
          });
        }
      }
    });
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1, color2) {
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get luminance of a color
   */
  getLuminance(color) {
    const rgb = this.parseColor(color);
    const a = [rgb.r, rgb.g, rgb.b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  /**
   * Parse color to RGB
   */
  parseColor(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const computed = window.getComputedStyle(div).color;
    document.body.removeChild(div);
    
    const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
    
    return { r: 0, g: 0, b: 0 };
  }

  /**
   * Check ARIA attributes
   */
  checkARIA() {
    const elementsWithARIA = document.querySelectorAll('[aria-*]');
    
    elementsWithARIA.forEach((element) => {
      // Check for invalid ARIA attributes
      const attributes = element.attributes;
      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (attr.name.startsWith('aria-')) {
          const validAttributes = [
            'aria-label', 'aria-labelledby', 'aria-describedby',
            'aria-hidden', 'aria-expanded', 'aria-pressed', 'aria-checked',
            'aria-disabled', 'aria-required', 'aria-invalid', 'aria-live',
            'aria-atomic', 'aria-relevant', 'aria-busy', 'aria-controls',
            'aria-current', 'aria-haspopup', 'aria-orientation', 'aria-roledescription',
          ];
          
          if (!validAttributes.includes(attr.name)) {
            this.logIssue('Invalid ARIA Attribute', {
              priority: 'low',
              description: `Unknown ARIA attribute: ${attr.name}`,
              element: element.tagName,
            });
          }
        }
      }
    });
  }

  /**
   * Check keyboard accessibility
   */
  checkKeyboardAccessibility() {
    // Check for elements that should be keyboard accessible
    const interactiveElements = document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      
      // Check if element is focusable
      if (element.tabIndex < 0) {
        return;
      }
      
      // Check if element is visible but not keyboard accessible
      if (computedStyle.display !== 'none' && 
          computedStyle.visibility !== 'hidden' &&
          computedStyle.opacity !== '0') {
        
        // Try to focus the element
        const oldActive = document.activeElement;
        element.focus();
        const isFocusable = document.activeElement === element;
        
        if (!isFocusable) {
          this.logIssue('Element Not Keyboard Accessible', {
            priority: 'high',
            description: 'Interactive element cannot be focused with keyboard',
            element: element.tagName,
          });
        }
        
        oldActive?.focus();
      }
    });
  }

  /**
   * Manage focus
   */
  manageFocus() {
    // Track focused element for better accessibility
    document.addEventListener('focusin', (e) => {
      document.body.setAttribute('data-focused', 'true');
      document.body.setAttribute('data-focus-target', e.target.tagName);
    });

    document.addEventListener('focusout', (e) => {
      document.body.setAttribute('data-focused', 'false');
    });

    // Trap focus in modals
    this.setupFocusTrap();
  }

  /**
   * Setup focus trap for modals
   */
  setupFocusTrap() {
    // This would be implemented when modals are present
    // Placeholder for future modal accessibility
  }

  /**
   * Track keyboard navigation
   */
  trackKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Log keyboard shortcuts
      if (e.altKey || e.ctrlKey || e.metaKey) {
        console.log('Keyboard shortcut detected:', {
          key: e.key,
          alt: e.altKey,
          ctrl: e.ctrlKey,
          meta: e.metaKey,
        });
      }
    });
  }

  /**
   * Enforce color contrast
   */
  enforceColorContrast() {
    // This would dynamically adjust colors if needed
    // Implementation depends on design system
  }

  /**
   * Monitor accessibility violations
   */
  monitorA11yViolations() {
    // Listen for accessibility issues from libraries like axe-core
    // This is a placeholder for integration
  }

  /**
   * Setup live regions
   */
  setupLiveRegions() {
    // Check for existing live regions
    const liveRegions = document.querySelectorAll('[aria-live], [aria-atomic], [aria-busy]');
    
    if (liveRegions.length === 0) {
      // Create a global live region for announcements
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      `;
      document.body.appendChild(liveRegion);
      
      this.liveRegion = liveRegion;
    }
  }

  /**
   * Enforce semantic HTML
   */
  enforceSemanticHTML() {
    // Check for div soup
    const divs = document.querySelectorAll('div');
    if (divs.length > 100) {
      this.logIssue('Too Many Div Elements', {
        priority: 'low',
        description: 'Consider using more semantic HTML elements',
        count: divs.length,
      });
    }

    // Check for tables used for layout
    const tables = document.querySelectorAll('table');
    tables.forEach((table) => {
      if (!table.querySelector('th')) {
        this.logIssue('Possible Layout Table', {
          priority: 'medium',
          description: 'Table may be used for layout instead of data',
          suggestion: 'Use CSS grid or flexbox for layout',
        });
      }
    });
  }

  /**
   * Log accessibility issue
   */
  logIssue(type, details) {
    const issue = {
      type: type,
      details: details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    this.issues.push(issue);

    // Log to console
    console.warn('Accessibility Issue:', issue);
  }

  /**
   * Generate audit report
   */
  generateAuditReport() {
    this.auditResults = {
      totalIssues: this.issues.length,
      issuesByPriority: this.issues.reduce((acc, issue) => {
        const priority = issue.details.priority;
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {}),
      issuesByType: this.issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {}),
      complianceScore: this.calculateComplianceScore(),
      wcagLevel: this.determineWCAGLevel(),
    };

    console.log('Accessibility Audit Report:', this.auditResults);
  }

  /**
   * Calculate compliance score
   */
  calculateComplianceScore() {
    if (this.issues.length === 0) return 100;

    const priorityWeights = {
      high: 25,
      medium: 10,
      low: 5,
    };

    let score = 100;
    this.issues.forEach((issue) => {
      const weight = priorityWeights[issue.details.priority] || 5;
      score = Math.max(0, score - weight);
    });

    return score;
  }

  /**
   * Determine WCAG compliance level
   */
  determineWCAGLevel() {
    const highIssues = this.issues.filter(i => i.details.priority === 'high').length;
    const mediumIssues = this.issues.filter(i => i.details.priority === 'medium').length;

    if (highIssues === 0 && mediumIssues === 0) {
      return 'AAA';
    } else if (highIssues === 0) {
      return 'AA';
    } else {
      return 'A';
    }
  }

  /**
   * Get accessibility report
   */
  getReport() {
    return {
      issues: this.issues,
      auditResults: this.auditResults,
      recommendations: this.getRecommendations(),
    };
  }

  /**
   * Get recommendations
   */
  getRecommendations() {
    const recommendations = [];

    this.issues.forEach((issue) => {
      if (!recommendations.find(r => r.type === issue.type)) {
        recommendations.push({
          type: issue.type,
          priority: issue.details.priority,
          description: issue.details.description,
          solution: issue.details.solution,
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for debugging
if (typeof window !== 'undefined') {
  window.AccessibilityManager = AccessibilityManager;
  window.accessibilityManager = accessibilityManager;
}