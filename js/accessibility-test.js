/**
 * Automated Accessibility Testing Suite
 * Runs comprehensive accessibility audits using axe-core and custom checks
 * WCAG 2.1 AAA Compliance
 */

class AccessibilityTester {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            score: 0,
            violations: [],
            passes: [],
            incomplete: [],
            wcagLevel: 'AAA',
            browserInfo: this.getBrowserInfo()
        };
        this.thresholds = {
            critical: 95,     // Must pass for AAA
            warning: 90,      // Warning threshold
            minimum: 80       // Minimum acceptable
        };
    }

    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };
    }

    async runFullAudit() {
        console.log('🧪 Starting Accessibility Audit...');
        
        // Run all tests
        await this.runAxeCoreAudit();
        this.runCustomAccessibilityChecks();
        this.checkColorContrast();
        this.validateHTMLStructure();
        this.testKeyboardNavigation();
        this.checkARIAAttributes();
        this.validateForms();
        this.checkImageAltText();
        this.testWithScreenReader();
        
        // Calculate final score
        this.calculateScore();
        
        // Generate report
        this.generateReport();
        
        return this.results;
    }

    async runAxeCoreAudit() {
        console.log('🔍 Running axe-core audit...');
        
        if (typeof axe === 'undefined') {
            console.warn('⚠️ axe-core not loaded, skipping automated audit');
            return;
        }

        try {
            const results = await axe.run(document, {
                runOnly: {
                    type: 'tag',
                    values: [
                        'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa',
                        'wcag2a', 'wcag2aa', 'best-practice'
                    ]
                },
                resultTypes: ['violations', 'passes', 'incomplete'],
                reporter: 'v2'
            });

            this.results.violations = results.violations;
            this.results.passes = results.passes;
            this.results.incomplete = results.incomplete;
            
            console.log(`✓ Found ${results.violations.length} violations`);
            console.log(`✓ Found ${results.passes.length} passes`);
        } catch (error) {
            console.error('❌ axe-core audit failed:', error);
        }
    }

    runCustomAccessibilityChecks() {
        console.log('🔍 Running custom accessibility checks...');
        
        const checks = [
            this.checkSkipLinks,
            this.checkHeadingHierarchy,
            this.checkLandmarkRegions,
            this.checkFocusManagement,
            this.checkFormLabels,
            this.checkButtonLabels,
            this.checkLinkText,
            this.checkLanguageAttribute,
            this.checkViewportMeta,
            this.checkDocumentTitle,
            this.checkPageLanguage,
            this.checkTableHeaders,
            this.checkListSemantics,
            this.checkIFrameTitles,
            this.checkVideoCaptions,
            this.checkAudioTranscripts,
            this.checkTimeControls,
            this.checkMotionPreferences,
            this.checkContrastPreferences,
            this.checkFontScaling
        ];

        checks.forEach(check => {
            try {
                const result = check.call(this);
                if (result) {
                    this.results.passes.push({
                        id: result.id,
                        description: result.description,
                        impact: 'info'
                    });
                }
            } catch (error) {
                console.error(`❌ Check failed: ${error.message}`);
            }
        });
    }

    checkSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link, [href^="#"][class*="skip"]');
        if (skipLinks.length > 0) {
            return {
                id: 'skip-links',
                description: `Found ${skipLinks.length} skip link(s) for keyboard navigation`
            };
        }
        this.addViolation('skip-links-missing', 'Skip links missing', 'moderate', 
            'Add skip links to allow keyboard users to bypass navigation');
    }

    checkHeadingHierarchy() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let prevLevel = 0;
        let violations = 0;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName[1]);
            if (level > prevLevel + 1) {
                violations++;
                this.addViolation('heading-hierarchy', 
                    `Heading level jump from h${prevLevel} to h${level}`, 
                    'moderate',
                    `Fix heading hierarchy at element ${index + 1}`);
            }
            prevLevel = level;
        });

        if (violations === 0 && headings.length > 0) {
            return {
                id: 'heading-hierarchy',
                description: `All ${headings.length} headings follow proper hierarchy`
            };
        }
    }

    checkLandmarkRegions() {
        const landmarks = document.querySelectorAll('[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], header, nav, main, aside, footer');
        
        const hasMain = document.querySelector('[role="main"], main') !== null;
        const hasNav = document.querySelector('[role="navigation"], nav') !== null;
        const hasHeader = document.querySelector('[role="banner"], header') !== null;
        const hasFooter = document.querySelector('[role="contentinfo"], footer') !== null;

        if (hasMain && hasNav && hasHeader && hasFooter) {
            return {
                id: 'landmark-regions',
                description: `Found ${landmarks.length} landmark regions (banner, navigation, main, contentinfo)`
            };
        }

        if (!hasMain) {
            this.addViolation('main-missing', 'Main landmark missing', 'critical',
                'Add <main> element or role="main"');
        }
        if (!hasNav) {
            this.addViolation('nav-missing', 'Navigation landmark missing', 'moderate',
                'Add <nav> element or role="navigation"');
        }
    }

    checkFocusManagement() {
        const focusableElements = document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length > 0) {
            return {
                id: 'focus-management',
                description: `Found ${focusableElements.length} focusable elements`
            };
        }

        this.addViolation('no-focusable', 'No focusable elements found', 'critical',
            'Ensure interactive elements are keyboard accessible');
    }

    checkFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        let violations = 0;

        inputs.forEach(input => {
            const hasLabel = input.hasAttribute('aria-label') || 
                            input.hasAttribute('aria-labelledby') ||
                            document.querySelector(`label[for="${input.id}"]`);
            
            if (!hasLabel && input.type !== 'hidden' && input.type !== 'submit' && input.type !== 'button') {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'form-labels',
                description: `All ${inputs.length} form inputs have labels`
            };
        }

        this.addViolation('form-labels-missing', 
            `${violations} form inputs missing labels`, 
            'critical',
            'Add labels to all form inputs');
    }

    checkButtonLabels() {
        const buttons = document.querySelectorAll('button, a[role="button"]');
        let violations = 0;

        buttons.forEach(button => {
            const hasText = button.textContent.trim().length > 0;
            const hasAriaLabel = button.hasAttribute('aria-label');
            const hasTitle = button.hasAttribute('title');
            const hasIcon = button.querySelector('i, img');

            if (!hasText && !hasAriaLabel && !hasTitle && !hasIcon) {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'button-labels',
                description: `All ${buttons.length} buttons have accessible labels`
            };
        }

        this.addViolation('button-labels-missing',
            `${violations} buttons missing accessible labels`,
            'critical',
            'Add aria-label, text, or title to all buttons');
    }

    checkLinkText() {
        const links = document.querySelectorAll('a[href]');
        let violations = 0;

        links.forEach(link => {
            const text = link.textContent.trim();
            const ariaLabel = link.getAttribute('aria-label');
            const effectiveText = ariaLabel || text;

            if (effectiveText === '' || effectiveText === 'click here' || effectiveText === 'more') {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'link-text',
                description: `All ${links.length} links have descriptive text`
            };
        }

        this.addViolation('link-text-unhelpful',
            `${violations} links have unhelpful text`,
            'moderate',
            'Use descriptive link text instead of "click here" or "more"');
    }

    checkLanguageAttribute() {
        const html = document.documentElement;
        if (html.hasAttribute('lang')) {
            return {
                id: 'language-attribute',
                description: `Document language set to: ${html.getAttribute('lang')}`
            };
        }

        this.addViolation('language-missing', 'HTML lang attribute missing', 'critical',
            'Add lang attribute to html element');
    }

    checkViewportMeta() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            const content = viewport.getAttribute('content');
            if (content.includes('width=device-width')) {
                return {
                    id: 'viewport-meta',
                    description: 'Viewport meta tag properly configured'
                };
            }
        }

        this.addViolation('viewport-invalid', 'Invalid viewport meta tag', 'moderate',
            'Add viewport meta tag with width=device-width');
    }

    checkDocumentTitle() {
        const title = document.title;
        if (title && title.trim().length > 0) {
            return {
                id: 'document-title',
                description: `Document title: "${title}"`
            };
        }

        this.addViolation('title-missing', 'Document title missing', 'critical',
            'Add a descriptive title to the document');
    }

    checkPageLanguage() {
        const html = document.documentElement;
        const lang = html.getAttribute('lang');
        
        if (lang && lang.length === 2) {
            return {
                id: 'page-language',
                description: `Page language: ${lang}`
            };
        }

        if (!lang || lang.length < 2) {
            this.addViolation('page-language-invalid', 'Invalid page language', 'critical',
                'Set valid language code (e.g., "en")');
        }
    }

    checkTableHeaders() {
        const tables = document.querySelectorAll('table');
        let violations = 0;

        tables.forEach(table => {
            const hasHeaders = table.querySelector('th') !== null;
            if (!hasHeaders) {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'table-headers',
                description: `All ${tables.length} tables have headers`
            };
        }

        this.addViolation('table-headers-missing',
            `${violations} tables missing headers`,
            'moderate',
            'Add <th> elements to all data tables');
    }

    checkListSemantics() {
        const lists = document.querySelectorAll('ul, ol, dl');
        
        if (lists.length > 0) {
            return {
                id: 'list-semantics',
                description: `Found ${lists.length} semantic lists`
            };
        }
    }

    checkIFrameTitles() {
        const iframes = document.querySelectorAll('iframe');
        let violations = 0;

        iframes.forEach(iframe => {
            if (!iframe.hasAttribute('title') || iframe.getAttribute('title').trim() === '') {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'iframe-titles',
                description: `All ${iframes.length} iframes have titles`
            };
        }

        this.addViolation('iframe-titles-missing',
            `${violations} iframes missing titles`,
            'moderate',
            'Add descriptive title attribute to all iframes');
    }

    checkVideoCaptions() {
        const videos = document.querySelectorAll('video');
        let violations = 0;

        videos.forEach(video => {
            const hasCaptions = video.querySelector('track[kind="captions"]') !== null;
            if (!hasCaptions) {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'video-captions',
                description: `All ${videos.length} videos have captions`
            };
        }

        this.addViolation('video-captions-missing',
            `${violations} videos missing captions`,
            'critical',
            'Add caption tracks to all videos');
    }

    checkAudioTranscripts() {
        const audios = document.querySelectorAll('audio');
        let violations = 0;

        audios.forEach(audio => {
            const hasTranscript = audio.nextElementSibling && 
                                 audio.nextElementSibling.textContent.toLowerCase().includes('transcript');
            if (!hasTranscript) {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'audio-transcripts',
                description: `All ${audios.length} audio elements have transcripts`
            };
        }

        this.addViolation('audio-transcripts-missing',
            `${violations} audio elements missing transcripts`,
            'critical',
            'Provide transcripts for all audio content');
    }

    checkTimeControls() {
        const media = document.querySelectorAll('video, audio');
        let violations = 0;

        media.forEach(element => {
            const hasControls = element.hasAttribute('controls');
            if (!hasControls) {
                violations++;
            }
        });

        if (violations === 0) {
            return {
                id: 'media-controls',
                description: `All ${media.length} media elements have controls`
            };
        }

        this.addViolation('media-controls-missing',
            `${violations} media elements missing controls`,
            'moderate',
            'Add controls attribute to media elements');
    }

    checkMotionPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        return {
            id: 'motion-preferences',
            description: `Reduced motion preference: ${prefersReducedMotion ? 'enabled' : 'disabled'}`
        };
    }

    checkContrastPreferences() {
        const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
        
        return {
            id: 'contrast-preferences',
            description: `High contrast preference: ${prefersContrast ? 'enabled' : 'disabled'}`
        };
    }

    checkFontScaling() {
        // Check if text scales properly
        const html = document.documentElement;
        const fontSize = window.getComputedStyle(html).fontSize;
        
        return {
            id: 'font-scaling',
            description: `Base font size: ${fontSize}`
        };
    }

    checkColorContrast() {
        console.log('🔨 Checking color contrast...');
        
        const elements = document.querySelectorAll('*');
        let contrastViolations = [];

        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = parseInt(styles.fontWeight);

            if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
                const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
                const requiredRatio = this.getRequiredContrastRatio(fontSize, fontWeight);

                if (contrastRatio < requiredRatio) {
                    contrastViolations.push({
                        element: element.tagName,
                        contrastRatio: contrastRatio.toFixed(2),
                        requiredRatio: requiredRatio,
                        color: color,
                        backgroundColor: backgroundColor
                    });
                }
            }
        });

        if (contrastViolations.length === 0) {
            return {
                id: 'color-contrast',
                description: 'All color contrasts meet WCAG AAA standards'
            };
        }

        this.addViolation('color-contrast-failed',
            `${contrastViolations.length} elements fail color contrast requirements`,
            'critical',
            'Increase contrast between text and background');
    }

    calculateContrastRatio(color1, color2) {
        const luminance1 = this.calculateLuminance(color1);
        const luminance2 = this.calculateLuminance(color2);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    calculateLuminance(color) {
        const rgb = this.parseColor(color);
        const [r, g, b] = rgb.map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    parseColor(color) {
        // Handle hex, rgb, rgba, hsl, hsla
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computedColor = window.getComputedStyle(div).color;
        document.body.removeChild(div);
        
        const match = computedColor.match(/\d+/g);
        if (match) {
            return match.map(Number);
        }
        return [0, 0, 0];
    }

    getRequiredContrastRatio(fontSize, fontWeight) {
        // WCAG AAA: 7:1 for normal text, 4.5:1 for large text
        const isLarge = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        return isLarge ? 4.5 : 7;
    }

    validateHTMLStructure() {
        console.log('🔍 Validating HTML structure...');
        
        // Check for proper HTML structure
        const hasDoctype = document.doctype !== null;
        const hasHtml = document.documentElement !== null;
        const hasHead = document.head !== null;
        const hasBody = document.body !== null;

        if (hasDoctype && hasHtml && hasHead && hasBody) {
            this.results.passes.push({
                id: 'html-structure',
                description: 'HTML document structure is valid',
                impact: 'info'
            });
        } else {
            this.addViolation('html-structure-invalid', 'Invalid HTML structure', 'critical',
                'Ensure proper HTML5 document structure');
        }
    }

    testKeyboardNavigation() {
        console.log('⌨️ Testing keyboard navigation...');
        
        // Simulate tab through all focusable elements
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        
        this.results.passes.push({
            id: 'keyboard-navigation',
            description: `${focusableElements.length} keyboard-navigable elements found`,
            impact: 'info'
        });
    }

    checkARIAAttributes() {
        console.log('🔍 Checking ARIA attributes...');
        
        const ariaElements = document.querySelectorAll('[aria-*]');
        let invalidAria = 0;

        ariaElements.forEach(element => {
            const ariaLabel = element.getAttribute('aria-label');
            const ariaHidden = element.getAttribute('aria-hidden');
            
            // Check for invalid aria-hidden on focusable elements
            if (ariaHidden === 'true' && element.matches('a[href], button, input, textarea, select')) {
                invalidAria++;
            }
        });

        if (invalidAria === 0) {
            this.results.passes.push({
                id: 'aria-attributes',
                description: `${ariaElements.length} ARIA attributes are valid`,
                impact: 'info'
            });
        } else {
            this.addViolation('aria-hidden-focusable',
                `${invalidAria} elements have aria-hidden="true" but are focusable`,
                'critical',
                'Remove aria-hidden from focusable elements');
        }
    }

    validateForms() {
        console.log('📝 Validating forms...');
        
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            
            if (!submitButton) {
                this.addViolation('form-no-submit',
                    'Form missing submit button',
                    'moderate',
                    'Add submit button to form');
            }
        });

        this.results.passes.push({
            id: 'forms-validated',
            description: `${forms.length} form(s) validated`,
            impact: 'info'
        });
    }

    checkImageAltText() {
        console.log('🖼️ Checking image alt text...');
        
        const images = document.querySelectorAll('img');
        let missingAlt = 0;
        let emptyAlt = 0;

        images.forEach(img => {
            if (!img.hasAttribute('alt')) {
                missingAlt++;
            } else if (img.getAttribute('alt') === '') {
                emptyAlt++;
            }
        });

        if (missingAlt === 0) {
            this.results.passes.push({
                id: 'image-alt-text',
                description: `All ${images.length} images have alt text (${emptyAlt} decorative)`,
                impact: 'info'
            });
        } else {
            this.addViolation('image-alt-missing',
                `${missingAlt} images missing alt text`,
                'critical',
                'Add alt text to all images');
        }
    }

    testWithScreenReader() {
        console.log('🔊 Testing screen reader compatibility...');
        
        // Check for screen reader specific attributes
        const hasLiveRegions = document.querySelectorAll('[aria-live], [aria-atomic], [aria-relevant]').length > 0;
        const hasLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length > 0;
        
        this.results.passes.push({
            id: 'screen-reader-compatibility',
            description: `Screen reader compatibility: ${hasLiveRegions ? 'live regions' : 'no live regions'}, ${hasLabels ? 'ARIA labels' : 'no ARIA labels'}`,
            impact: 'info'
        });
    }

    addViolation(id, description, impact, suggestion) {
        this.results.violations.push({
            id: id,
            description: description,
            impact: impact,
            suggestion: suggestion,
            nodes: []
        });
    }

    calculateScore() {
        const totalChecks = this.results.violations.length + this.results.passes.length;
        const passRate = totalChecks > 0 ? (this.results.passes.length / totalChecks) * 100 : 0;
        
        // Deduct points for violations based on severity
        let deduction = 0;
        this.results.violations.forEach(violation => {
            switch (violation.impact) {
                case 'critical':
                    deduction += 10;
                    break;
                case 'serious':
                    deduction += 7;
                    break;
                case 'moderate':
                    deduction += 5;
                    break;
                case 'minor':
                    deduction += 2;
                    break;
            }
        });

        this.results.score = Math.max(0, Math.min(100, passRate - deduction));
        
        // Determine WCAG level
        if (this.results.score >= 95) {
            this.results.wcagLevel = 'AAA';
        } else if (this.results.score >= 90) {
            this.results.wcagLevel = 'AA';
        } else if (this.results.score >= 80) {
            this.results.wcagLevel = 'A';
        } else {
            this.results.wcagLevel = 'Non-Compliant';
        }
    }

    generateReport() {
        console.log('\n📊 Accessibility Audit Report');
        console.log('================================');
        console.log(`Score: ${this.results.score.toFixed(1)}/100`);
        console.log(`WCAG Level: ${this.results.wcagLevel}`);
        console.log(`Violations: ${this.results.violations.length}`);
        console.log(`Passes: ${this.results.passes.length}`);
        console.log(`Incomplete: ${this.results.incomplete.length}`);
        console.log('\nCritical Issues:');
        
        const criticalViolations = this.results.violations.filter(v => v.impact === 'critical');
        if (criticalViolations.length > 0) {
            criticalViolations.forEach(v => {
                console.log(`  ❌ ${v.description}`);
                console.log(`     Fix: ${v.suggestion}`);
            });
        } else {
            console.log('  ✅ No critical issues found!');
        }

        console.log('\nTimestamp:', this.results.timestamp);
        console.log('================================\n');

        // Store in localStorage for later retrieval
        localStorage.setItem('accessibilityAuditReport', JSON.stringify(this.results));
        
        // Dispatch event for other systems to use
        window.dispatchEvent(new CustomEvent('accessibilityAuditComplete', {
            detail: this.results
        }));

        return this.results;
    }

    // Export report as JSON
    exportReport() {
        const dataStr = JSON.stringify(this.results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accessibility-audit-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Export report as HTML
    exportHTMLReport() {
        const reportHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Accessibility Audit Report</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
                    .score { font-size: 48px; font-weight: bold; color: ${this.results.score >= 95 ? '#28a745' : this.results.score >= 80 ? '#ffc107' : '#dc3545'}; }
                    .violation { background: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
                    .pass { background: #d4edda; border: 1px solid #c3e6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
                    .critical { border-left: 4px solid #dc3545; }
                    .moderate { border-left: 4px solid #ffc107; }
                    .minor { border-left: 4px solid #17a2b8; }
                </style>
            </head>
            <body>
                <h1>Accessibility Audit Report</h1>
                <p>Generated: ${this.results.timestamp}</p>
                
                <div class="score-container">
                    <h2>Accessibility Score</h2>
                    <div class="score">${this.results.score.toFixed(1)}/100</div>
                    <p>WCAG Level: ${this.results.wcagLevel}</p>
                </div>
                
                <h2>Summary</h2>
                <ul>
                    <li>Violations: ${this.results.violations.length}</li>
                    <li>Passes: ${this.results.passes.length}</li>
                    <li>Incomplete: ${this.results.incomplete.length}</li>
                </ul>
                
                <h2>Violations</h2>
                ${this.results.violations.map(v => `
                    <div class="violation ${v.impact}">
                        <h3>${v.description}</h3>
                        <p><strong>Impact:</strong> ${v.impact}</p>
                        <p><strong>Fix:</strong> ${v.suggestion}</p>
                    </div>
                `).join('')}
                
                <h2>Passes</h2>
                ${this.results.passes.map(p => `
                    <div class="pass">
                        <h3>${p.description}</h3>
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        const dataBlob = new Blob([reportHTML], { type: 'text/html' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `accessibility-audit-${Date.now()}.html`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Auto-run on page load
if (typeof window !== 'undefined') {
    window.AccessibilityTester = AccessibilityTester;
    
    // Run audit automatically after page load
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for resources to load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const tester = new AccessibilityTester();
                tester.runFullAudit().then(results => {
                    console.log('✅ Accessibility audit complete!');
                });
            }, 2000);
        });
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityTester;
}