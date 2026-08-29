/**
 * Rate Limiter Boundary Double for Auth Bridge
 */

export class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 10;
    this.windowMs = options.windowMs || 60000;
    this.hits = new Map();
  }

  isRateLimited(key, now = new Date()) {
    if (!key) return false;
    const nowTime = now.getTime();

    const record = this.hits.get(key) || { count: 0, resetAt: nowTime + this.windowMs };

    if (nowTime > record.resetAt) {
      record.count = 0;
      record.resetAt = nowTime + this.windowMs;
    }

    record.count += 1;
    this.hits.set(key, record);

    return record.count > this.maxRequests;
  }

  reset() {
    this.hits.clear();
  }
}
