class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl
    this.cache.set(key, {
      value,
      expiry
    })
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key) {
    return this.get(key) !== null
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  // Get cache stats
  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredEntries++
        this.cache.delete(key)
      } else {
        validEntries++
      }
    }

    return {
      total: validEntries + expiredEntries,
      valid: validEntries,
      expired: expiredEntries
    }
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

module.exports = CacheService 