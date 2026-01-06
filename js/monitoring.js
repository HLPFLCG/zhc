/**
 * Monitoring & Observability System
 * Real-time monitoring, error tracking, and performance monitoring
 */

class MonitoringSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            debug: false,
            samplingRate: 1.0,
            maxErrors: 50,
            maxMetrics: 100,
            flushInterval: 30000, // 30 seconds
            endpoint: config.endpoint || '/api/monitoring',
            ...config
        };

        this.errors = [];
        this.metrics = [];
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.flushTimer = null;
        this.performanceObserver = null;
        this.errorObserver = null;

        this.init();
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        if (!this.config.enabled) {
            return;
        }

        this.setupErrorTracking();
        this.setupPerformanceMonitoring();
        this.setupUserActivityTracking();
        this.setupNetworkMonitoring();
        this.startPeriodicFlush();

        this.log('Monitoring system initialized', { sessionId: this.sessionId });
    }

    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null,
                timestamp: Date.now()
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'unhandledrejection',
                message: event.reason ? event.reason.toString() : 'Unknown promise rejection',
                stack: event.reason && event.reason.stack ? event.reason.stack : null,
                timestamp: Date.now()
            });
        });

        // Console error interception
        const originalConsoleError = console.error;
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            this.trackError({
                type: 'console.error',
                message: args.map(arg => {
                    if (arg instanceof Error) {
                        return arg.message + '\n' + arg.stack;
                    }
                    return String(arg);
                }).join(' '),
                timestamp: Date.now()
            });
        };
    }

    setupPerformanceMonitoring() {
        // Core Web Vitals monitoring
        if ('PerformanceObserver' in window) {
            try {
                // Largest Contentful Paint (LCP)
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.trackMetric('lcp', lastEntry.renderTime || lastEntry.loadTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay (FID)
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.trackMetric('fid', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

                // Cumulative Layout Shift (CLS)
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this.trackMetric('cls', clsValue);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // First Contentful Paint (FCP)
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.name === 'first-contentful-paint') {
                            this.trackMetric('fcp', entry.startTime);
                        }
                    });
                });
                fcpObserver.observe({ entryTypes: ['paint'] });

                this.performanceObserver = {
                    lcp: lcpObserver,
                    fid: fidObserver,
                    cls: clsObserver,
                    fcp: fcpObserver
                };
            } catch (error) {
                this.trackError({
                    type: 'performance_observer_error',
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        }

        // Page load timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
                
                this.trackMetric('page_load_time', pageLoadTime);
                this.trackMetric('dom_ready_time', domReadyTime);
            }, 0);
        });
    }

    setupUserActivityTracking() {
        // Track page views
        this.trackMetric('page_view', {
            url: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });

        // Track user interactions
        let interactionTimeout;
        document.addEventListener('click', (event) => {
            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(() => {
                const target = event.target;
                this.trackMetric('click', {
                    tag: target.tagName,
                    id: target.id,
                    class: target.className,
                    text: target.textContent ? target.textContent.substring(0, 50) : ''
                });
            }, 100);
        }, { passive: true });

        // Track scroll depth
        let maxScrollDepth = 0;
        document.addEventListener('scroll', () => {
            const scrollDepth = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.trackMetric('scroll_depth', maxScrollDepth);
            }
        }, { passive: true });

        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.startTime;
            this.trackMetric('time_on_page', timeOnPage);
            this.flush();
        });
    }

    setupNetworkMonitoring() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch.apply(window, args);
                const duration = performance.now() - startTime;
                
                this.trackMetric('fetch_request', {
                    url: url,
                    status: response.status,
                    duration: duration,
                    success: response.ok
                });
                
                return response;
            } catch (error) {
                const duration = performance.now() - startTime;
                
                this.trackMetric('fetch_error', {
                    url: url,
                    error: error.message,
                    duration: duration
                });
                
                throw error;
            }
        };

        // Monitor XHR requests
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function(...args) {
            this._method = args[0];
            this._url = args[1];
            this._startTime = performance.now();
            return originalOpen.apply(this, args);
        };

        XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('load', () => {
                const duration = performance.now() - this._startTime;
                this.trackMetric('xhr_request', {
                    method: this._method,
                    url: this._url,
                    status: this.status,
                    duration: duration,
                    success: this.status >= 200 && this.status < 300
                });
            });

            this.addEventListener('error', () => {
                const duration = performance.now() - this._startTime;
                this.trackMetric('xhr_error', {
                    method: this._method,
                    url: this._url,
                    error: 'Network error',
                    duration: duration
                });
            });

            return originalSend.apply(this, args);
        };
    }

    trackError(error) {
        if (!this.config.enabled) {
            return;
        }

        // Add context to error
        const enrichedError = {
            ...error,
            sessionId: this.sessionId,
            pageUrl: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            memory: this.getMemoryInfo()
        };

        this.errors.push(enrichedError);

        // Limit errors in memory
        if (this.errors.length > this.config.maxErrors) {
            this.errors.shift();
        }

        this.log('Error tracked', error);

        // Dispatch error event
        window.dispatchEvent(new CustomEvent('monitoring:error', {
            detail: enrichedError
        }));

        // Send to endpoint if configured
        if (this.config.endpoint && Math.random() < this.config.samplingRate) {
            this.sendError(enrichedError);
        }
    }

    trackMetric(name, value) {
        if (!this.config.enabled) {
            return;
        }

        const metric = {
            name: name,
            value: value,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            pageUrl: window.location.href
        };

        this.metrics.push(metric);

        // Limit metrics in memory
        if (this.metrics.length > this.config.maxMetrics) {
            this.metrics.shift();
        }

        this.log('Metric tracked', { name, value });

        // Dispatch metric event
        window.dispatchEvent(new CustomEvent('monitoring:metric', {
            detail: metric
        }));
    }

    getMemoryInfo() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    startPeriodicFlush() {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushInterval);
    }

    flush() {
        if (!this.config.enabled) {
            return;
        }

        if (this.errors.length === 0 && this.metrics.length === 0) {
            return;
        }

        const data = {
            sessionId: this.sessionId,
            errors: this.errors,
            metrics: this.metrics,
            timestamp: Date.now()
        };

        this.log('Flushing data', {
            errorsCount: this.errors.length,
            metricsCount: this.metrics.length
        });

        // Send to endpoint
        if (this.config.endpoint) {
            this.sendData(data);
        }

        // Store in localStorage as backup
        this.storeData(data);

        // Clear arrays
        this.errors = [];
        this.metrics = [];

        // Dispatch flush event
        window.dispatchEvent(new CustomEvent('monitoring:flush', {
            detail: data
        }));
    }

    sendError(error) {
        if (!this.config.endpoint) {
            return;
        }

        fetch(this.config.endpoint + '/errors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(error)
        }).catch(err => {
            console.error('Failed to send error:', err);
        });
    }

    sendData(data) {
        if (!this.config.endpoint) {
            return;
        }

        fetch(this.config.endpoint + '/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).catch(err => {
            console.error('Failed to send monitoring data:', err);
        });
    }

    storeData(data) {
        try {
            const key = `monitoring_${this.sessionId}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            // Clean up old data
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('monitoring_')) {
                    const item = localStorage.getItem(key);
                    const parsed = JSON.parse(item);
                    if (Date.now() - parsed.timestamp > 86400000) { // 24 hours
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (error) {
            console.error('Failed to store monitoring data:', error);
        }
    }

    getHealthStatus() {
        return {
            sessionId: this.sessionId,
            uptime: Date.now() - this.startTime,
            errorsCount: this.errors.length,
            metricsCount: this.metrics.length,
            memory: this.getMemoryInfo(),
            connection: navigator.onLine ? 'online' : 'offline'
        };
    }

    getReport() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime: Date.now(),
            duration: Date.now() - this.startTime,
            errors: this.errors,
            metrics: this.metrics,
            summary: {
                totalErrors: this.errors.length,
                totalMetrics: this.metrics.length,
                errorTypes: this.getErrorTypes(),
                metricNames: this.getMetricNames()
            }
        };
    }

    getErrorTypes() {
        const types = {};
        this.errors.forEach(error => {
            types[error.type] = (types[error.type] || 0) + 1;
        });
        return types;
    }

    getMetricNames() {
        const names = {};
        this.metrics.forEach(metric => {
            names[metric.name] = (names[metric.name] || 0) + 1;
        });
        return names;
    }

    clear() {
        this.errors = [];
        this.metrics = [];
        localStorage.removeItem(`monitoring_${this.sessionId}`);
    }

    destroy() {
        this.flush();
        clearInterval(this.flushTimer);
        
        if (this.performanceObserver) {
            Object.values(this.performanceObserver).forEach(observer => {
                if (observer && observer.disconnect) {
                    observer.disconnect();
                }
            });
        }

        this.log('Monitoring system destroyed');
    }

    log(message, data = null) {
        if (this.config.debug) {
            console.log(`[Monitoring] ${message}`, data || '');
        }
    }
}

// Health Check System
class HealthCheckSystem {
    constructor(config = {}) {
        this.config = {
            checkInterval: 60000, // 1 minute
            endpoint: config.endpoint || '/api/health',
            ...config
        };

        this.checks = [];
        this.timer = null;
        this.status = 'healthy';
    }

    addCheck(name, checkFn, options = {}) {
        this.checks.push({
            name,
            checkFn,
            options,
            lastResult: null,
            lastCheckTime: null
        });
    }

    async runAllChecks() {
        const results = await Promise.allSettled(
            this.checks.map(check => this.runCheck(check))
        );

        const allHealthy = results.every(result => 
            result.status === 'fulfilled' && result.value.healthy
        );

        this.status = allHealthy ? 'healthy' : 'unhealthy';

        window.dispatchEvent(new CustomEvent('health:check', {
            detail: {
                status: this.status,
                results: results
            }
        }));

        return {
            status: this.status,
            results: results
        };
    }

    async runCheck(check) {
        const startTime = performance.now();
        
        try {
            const result = await check.checkFn();
            const duration = performance.now() - startTime;
            
            check.lastResult = {
                healthy: true,
                value: result,
                duration: duration
            };
            check.lastCheckTime = Date.now();

            return check.lastResult;
        } catch (error) {
            const duration = performance.now() - startTime;
            
            check.lastResult = {
                healthy: false,
                error: error.message,
                duration: duration
            };
            check.lastCheckTime = Date.now();

            throw error;
        }
    }

    start() {
        this.runAllChecks();
        this.timer = setInterval(() => {
            this.runAllChecks();
        }, this.config.checkInterval);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getStatus() {
        return {
            status: this.status,
            checks: this.checks.map(check => ({
                name: check.name,
                healthy: check.lastResult ? check.lastResult.healthy : null,
                lastCheck: check.lastCheckTime
            }))
        };
    }
}

// Alert System
class AlertSystem {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            threshold: {
                errorRate: 0.1, // 10% error rate
                responseTime: 5000, // 5 seconds
                memoryUsage: 0.9 // 90% memory usage
            },
            ...config
        };

        this.alerts = [];
        this.errorCount = 0;
        this.totalRequests = 0;
    }

    checkErrorRate() {
        if (this.totalRequests === 0) {
            return false;
        }

        const errorRate = this.errorCount / this.totalRequests;
        
        if (errorRate > this.config.threshold.errorRate) {
            this.triggerAlert('high_error_rate', {
                errorRate: errorRate,
                threshold: this.config.threshold.errorRate
            });
            return true;
        }

        return false;
    }

    checkResponseTime(duration) {
        if (duration > this.config.threshold.responseTime) {
            this.triggerAlert('slow_response', {
                duration: duration,
                threshold: this.config.threshold.responseTime
            });
            return true;
        }

        return false;
    }

    checkMemoryUsage(memoryInfo) {
        if (memoryInfo) {
            const usagePercent = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
            
            if (usagePercent > this.config.threshold.memoryUsage) {
                this.triggerAlert('high_memory_usage', {
                    usagePercent: usagePercent,
                    threshold: this.config.threshold.memoryUsage
                });
                return true;
            }
        }

        return false;
    }

    triggerAlert(type, data) {
        const alert = {
            id: Date.now(),
            type: type,
            data: data,
            timestamp: Date.now()
        };

        this.alerts.push(alert);

        window.dispatchEvent(new CustomEvent('alert:triggered', {
            detail: alert
        }));

        console.warn('Alert triggered:', alert);
    }

    getAlerts(limit = 50) {
        return this.alerts.slice(-limit);
    }

    clearAlerts() {
        this.alerts = [];
    }
}

// Initialize systems
let monitoring;
let healthCheck;
let alertSystem;

if (typeof window !== 'undefined') {
    // Auto-initialize monitoring
    monitoring = new MonitoringSystem({
        debug: false,
        enabled: true
    });

    // Initialize health checks
    healthCheck = new HealthCheckSystem();
    healthCheck.addCheck('memory', async () => {
        if (performance.memory) {
            const usagePercent = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            if (usagePercent > 0.9) {
                throw new Error(`High memory usage: ${(usagePercent * 100).toFixed(2)}%`);
            }
        }
        return 'OK';
    });

    healthCheck.addCheck('storage', async () => {
        try {
            localStorage.setItem('health_check', 'test');
            localStorage.removeItem('health_check');
            return 'OK';
        } catch (error) {
            throw new Error('Storage not available');
        }
    });

    healthCheck.start();

    // Initialize alert system
    alertSystem = new AlertSystem();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.MonitoringSystem = MonitoringSystem;
    window.HealthCheckSystem = HealthCheckSystem;
    window.AlertSystem = AlertSystem;
    window.monitoring = monitoring;
    window.healthCheck = healthCheck;
    window.alertSystem = alertSystem;
}