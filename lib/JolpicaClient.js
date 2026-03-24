'use strict';

/**
 * JolpicaClient
 *
 * Lightweight HTTP client for the Jolpica / Ergast F1 REST API.
 * Provides in-memory caching with TTL-based invalidation so repeated
 * calls within the cache window cost no network requests.
 *
 * Usage:
 *   const jolpica = new JolpicaClient(homey);
 *   const data = await jolpica.get(JOLPICA_URLS.current, TTL.SCHEDULE);
 */

const https = require('https');
const http  = require('http');
const { JOLPICA_URLS, TTL } = require('./constants');

const REQUEST_TIMEOUT_MS = 15_000;

class JolpicaClient {

  /**
   * @param {import('homey').Homey} homey
   */
  constructor(homey) {
    this._homey = homey;
    this._log   = (...a) => homey.log('[Jolpica]', ...a);
    this._error = (...a) => homey.error('[Jolpica]', ...a);
    this._cache = new Map(); // key → { data, expiresAt }
    this._inflight = new Map(); // key → Promise
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Fetch JSON data from a Jolpica/Ergast endpoint with caching.
   * @param {string} url        Full HTTP URL
   * @param {number} ttlMs      Cache TTL in milliseconds
   * @returns {Promise<object>} Parsed JSON
   */
  async get(url, ttlMs = TTL.SCHEDULE) {
    const cached = this._cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    // Coalesce concurrent requests for the same URL
    if (this._inflight.has(url)) {
      return this._inflight.get(url);
    }

    const promise = this._fetch(url)
      .then((data) => {
        this._cache.set(url, { data, expiresAt: Date.now() + ttlMs });
        this._inflight.delete(url);
        return data;
      })
      .catch((err) => {
        this._inflight.delete(url);
        // Return stale cached data rather than throwing, if available
        if (cached) {
          this._error(`Fetch failed for ${url}, returning stale cache:`, err.message);
          return cached.data;
        }
        throw err;
      });

    this._inflight.set(url, promise);
    return promise;
  }

  /** Convenience: fetch current race schedule */
  async getSchedule()            { return this.get(JOLPICA_URLS.current,             TTL.SCHEDULE);   }
  /** Convenience: fetch driver standings */
  async getDriverStandings()     { return this.get(JOLPICA_URLS.driverStandings,     TTL.STANDINGS);  }
  /** Convenience: fetch constructor standings */
  async getConstructorStandings(){ return this.get(JOLPICA_URLS.constructorStandings, TTL.STANDINGS); }
  /** Convenience: fetch last race results */
  async getLastRaceResults()     { return this.get(JOLPICA_URLS.lastRaceResults,      TTL.LAST_RACE); }

  /** Invalidate the cache for a given URL (or all if no URL given) */
  invalidate(url) {
    if (url) {
      this._cache.delete(url);
    } else {
      this._cache.clear();
    }
  }

  // ─── Internal helpers ─────────────────────────────────────────────────────

  _fetch(url) {
    return new Promise((resolve, reject) => {
      const lib   = url.startsWith('https') ? https : http;
      const timer = setTimeout(() => reject(new Error('Jolpica timeout')), REQUEST_TIMEOUT_MS);

      const req = lib.get(url, {
        headers: {
          'User-Agent': 'nl.monkeysoft.f1/1.0 Homey',
          'Accept':     'application/json',
        },
      }, (res) => {
        if (res.statusCode >= 400) {
          clearTimeout(timer);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          res.resume();
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          clearTimeout(timer);
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch (err) {
            reject(new Error(`JSON parse error for ${url}: ${err.message}`));
          }
        });
      });

      req.on('error', (err) => { clearTimeout(timer); reject(err); });
    });
  }

  /**
   * Extract the next race from a Jolpica schedule response.
   * Returns null when no future race found.
   * @param {object} scheduleData  Result of getSchedule()
   * @returns {{ raceName, date, time, Circuit }|null}
   */
  static getNextRace(scheduleData) {
    try {
      const races = scheduleData?.MRData?.RaceTable?.Races ?? [];
      const now   = new Date();
      for (const race of races) {
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
        if (raceDate > now) return race;
      }
      // If no future race, return the last race of the season
      return races[races.length - 1] ?? null;
    } catch (_) {
      return null;
    }
  }
}

module.exports = JolpicaClient;
