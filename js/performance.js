/**
 * Bulletproof Performance Monitoring System
 * Real-time performance tracking, optimization, and alerting
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.performanceBudgets = {
      // Core Web Vitals
      lcp: { max: 2500, warning: 2000, name: 'Largest Contentful Paint' },
      fid: { max: 100, warning: 75, name: 'First Input Delay' },
      cls: { max: 0.1, warning: 0.08, name: 'Cumulative Layout Shift' },
      ttfb: { max: 600, warning: 500, name: 'Time to First Byte' },
      fcp: { max: 1800, warning: 1500, name: 'First Contentful Paint' },
      tti: { max: 3800, warning: 3500, name: 'Time to Interactive' },
      // Resource budgets
      totalSize: { max: 1000000, warning: 900000, name: 'Total Page Size' },
      jsSize: { max: 300000, warning: 250000, name: 'JavaScript Size' },
      cssSize: { max: 50000, warning: 40000, name: 'CSS Size' },
      imageSize: { max: 500000, warning: 400000, name: 'Image Size' },
    };
    this.init();
  }

  init() {
    this.setupPerformanceObserver();
    this.measureResourceTiming();
    this.measureNavigationTiming();
    this.setupContinuousMonitoring();
    this.checkPerformanceBudgets();
    this.trackUserInteractions();
    this.detectPerformanceIssues();
  }

  /**
   * Setup Performance Observer for Core Web Vitals
   */
  setupPerformanceObserver() {
    if (!('PerformanceObserver' in window)) return;

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        this.checkMetric('lcp', this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported:', e);
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0];
        this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        this.checkMetric('fid', this.metrics.fid);
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported:', e);
    }

    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cls = clsValue;
        this.checkMetric('cls', this.metrics.cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observer not supported:', e);
    }

    // Long Tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.logPerformanceIssue('Long Task', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task observer not supported:', e);
    }
  }

  /**
   * Measure resource loading performance
   */
  measureResourceTiming() {
    if (!('PerformanceResourceTiming' in window)) return;

    const resources = performance.getEntriesByType('resource');
    
    this.metrics.resources = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      count: resources.length,
    };

    for (const resource of resources) {
      if (resource.transferSize) {
        this.metrics.resources.totalSize += resource.transferSize;
        
        if (resource.name.endsWith('.js')) {
          this.metrics.resources.jsSize += resource.transferSize;
        } else if (resource.name.endsWith('.css')) {
          this.metrics.resources.cssSize += resource.transferSize;
        } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resource.name)) {
          this.metrics.resources.imageSize += resource.transferSize;
        }
      }
    }

    // Check resource budgets
    this.checkMetric('totalSize', this.metrics.resources.totalSize);
    this.checkMetric('jsSize', this.metrics.resources.jsSize);
    this.checkMetric('cssSize', this.metrics.resources.cssSize);
    this.checkMetric('imageSize', this.metrics.resources.imageSize);
  }

  /**
   * Measure navigation timing
   */
  measureNavigationTiming() {
    const timing = performance.timing || {};
    
    this.metrics.navigation = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domLoading: timing.domContentLoadedEventStart - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
    };

    // Check TTFB
    if (this.metrics.navigation.ttfb) {
      this.checkMetric('ttfb', this.metrics.navigation.ttfb);
    }
  }

  /**
   * Check metric against performance budget
   */
  checkMetric(metric, value) {
    const budget = this.performanceBudgets[metric];
    if (!budget) return;

    if (value > budget.max) {
      this.logPerformanceIssue(`${budget.name} Exceeded`, {
        metric: metric,
        value: value,
        max: budget.max,
        warning: budget.warning,
        budgetExceeded: true,
      });
    } else if (value > budget.warning) {
      this.logPerformanceIssue(`${budget.name} Warning`, {
        metric: metric,
        value: value,
        warning: budget.warning,
        budgetWarning: true,
      });
    }
  }

  /**
   * Check all performance budgets
   */
  checkPerformanceBudgets() {
    // Check metrics periodically
    setInterval(() => {
      this.measureResourceTiming();
    }, 30000); // Every 30 seconds
  }

  /**
   * Log performance issue
   */
  logPerformanceIssue(type, details) {
    const issue = {
      type: type,
      details: details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    console.warn('Performance Issue:', issue);

    // Send to monitoring service
    this.sendToMonitoringService(issue);
  }

  /**
   * Detect common performance issues
   */
  detectPerformanceIssues() {
    // Detect unoptimized images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (img.naturalWidth > img.clientWidth * 2) {
        this.logPerformanceIssue('Oversized Image', {
          src: img.src,
          naturalWidth: img.naturalWidth,
          displayWidth: img.clientWidth,
          ratio: (img.naturalWidth / img.clientWidth).toFixed(2),
        });
      }
      
      if (!img.loading || img.loading !== 'lazy') {
        if (img.getBoundingClientRect().top > window.innerHeight) {
          this.logPerformanceIssue('Image Without Lazy Loading', {
            src: img.src,
            suggestion: 'Add loading="lazy" attribute',
          });
        }
      }
    });

    // Detect render-blocking resources
    const renderBlockingResources = performance.getEntriesByType('resource').filter(resource => {
      return resource.duration > 50 && 
             (resource.name.endsWith('.css') || resource.name.endsWith('.js'));
    });

    if (renderBlockingResources.length > 0) {
      this.logPerformanceIssue('Render-Blocking Resources Detected', {
        count: renderBlockingResources.length,
        resources: renderBlockingResources.map(r => r.name),
      });
    }
  }

  /**
   * Track user interactions for performance
   */
  trackUserInteractions() {
    // Track time to interactive
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.domContentLoaded = performance.now();
    });

    document.addEventListener('load', () => {
      this.metrics.pageLoad = performance.now();
      this.checkMetric('tti', this.metrics.pageLoad);
    });
  }

  /**
   * Setup continuous monitoring
   */
  setupContinuousMonitoring() {
    // Monitor memory usage (if available)
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
        };
        
        const memoryUsagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        
        if (memoryUsagePercent > 80) {
          this.logPerformanceIssue('High Memory Usage', memoryInfo);
        }
      }, 60000); // Every minute
    }

    // Monitor FPS
    this.monitorFrameRate();
  }

  /**
   * Monitor frame rate
   */
  monitorFrameRate() {
    let lastTime = performance.now();
    let frameCount = 0;
    let fps = 60;

    const measureFPS = () => {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        
        if (fps < 30) {
          this.logPerformanceIssue('Low Frame Rate', {
            fps: fps,
            threshold: 30,
          });
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Send performance data to monitoring service
   */
  async sendToMonitoringService(issue) {
    try {
      // Send to Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'performance_issue', {
          event_category: 'Performance',
          event_label: issue.type,
          value: issue.details.value || 1,
        });
      }
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      metrics: this.metrics,
      budgets: this.performanceBudgets,
      issues: this.issues || [],
      score: this.calculatePerformanceScore(),
    };
  }

  /**
   * Calculate overall performance score
   */
  calculatePerformanceScore() {
    let score = 100;
    let issuesCount = 0;

    for (const metric of Object.keys(this.performanceBudgets)) {
      if (this.metrics[metric]) {
        const budget = this.performanceBudgets[metric];
        if (this.metrics[metric] > budget.max) {
          score -= 20;
          issuesCount++;
        } else if (this.metrics[metric] > budget.warning) {
          score -= 10;
          issuesCount++;
        }
      }
    }

    return Math.max(0, score);
  }

  /**
   * Get performance recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.resources?.jsSize > this.performanceBudgets.jsSize.warning) {
      recommendations.push({
        priority: 'high',
        issue: 'Large JavaScript bundle',
        solution: 'Consider code splitting, tree shaking, or lazy loading',
      });
    }

    if (this.metrics.resources?.imageSize > this.performanceBudgets.imageSize.warning) {
      recommendations.push({
        priority: 'medium',
        issue: 'Large images',
        solution: 'Compress images and use modern formats like WebP',
      });
    }

    if (this.metrics.fid > this.performanceBudgets.fid.warning) {
      recommendations.push({
        priority: 'high',
        issue: 'Slow input response',
        solution: 'Reduce JavaScript execution time and long tasks',
      });
    }

    if (this.metrics.cls > this.performanceBudgets.cls.warning) {
      recommendations.push({
        priority: 'medium',
        issue: 'Layout shifts',
        solution: 'Reserve space for dynamic content and ads',
      });
    }

    return recommendations;
  }
}

// Initialize performance monitor
const performanceMonitor = new PerformanceMonitor();

// Export for debugging
if (typeof window !== 'undefined') {
  window.PerformanceMonitor = PerformanceMonitor;
  window.performanceMonitor = performanceMonitor;
}