'use strict';

/**
 * F1AuthClient
 *
 * Manages the F1 TV Pro subscription token lifecycle.
 * The token is a JWT obtained via the browser popup relay-page flow and stored
 * in Homey settings under the key 'f1auth:token'.
 *
 * Usage in app.js:
 *   const auth = new F1AuthClient(this.homey);
 *   auth.on('tokenChanged', (token) => liveClient.setAuthToken(token));
 *   auth.init(); // loads persisted token on start-up
 *
 * Settings page posts the token via:
 *   Homey.set('f1auth:token', jwtString)
 * and clears it via:
 *   Homey.set('f1auth:token', null)
 *
 * Events:
 *   'tokenChanged' (token: string|null)  — fired whenever the token changes
 *   'tokenExpired' ()                    — fired at JWT expiry time
 */

const { EventEmitter } = require('events');

const SETTINGS_KEY    = 'f1auth:token';
const EXPIRY_MARGIN   = 5 * 60 * 1000; // warn 5 min before expiry

class F1AuthClient extends EventEmitter {

  constructor(homey) {
    super();
    this._homey        = homey;
    this._log          = (...a) => homey.log('[F1Auth]', ...a);
    this._error        = (...a) => homey.error('[F1Auth]', ...a);
    this._token        = null;
    this._expiryTimer  = null;
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Load any persisted token and start watching for settings changes.
   * Call once in app.onInit().
   */
  init() {
    // Load persisted token
    const stored = this._homey.settings.get(SETTINGS_KEY);
    if (stored) {
      this._applyToken(stored, false); // false = don't persist again
    }

    // Watch for token changes written by the settings page
    this._homey.settings.on('set', (key) => {
      if (key !== SETTINGS_KEY) return;
      const val = this._homey.settings.get(SETTINGS_KEY);
      this._applyToken(val || null, false);
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Store a new token (JWTstring). Called programmatically if needed. */
  setToken(jwt) {
    this._applyToken(jwt || null, true);
  }

  /** Remove the stored token and emit tokenChanged(null). */
  clearToken() {
    this._applyToken(null, true);
  }

  /** Returns the raw JWT string, or null if not authenticated. */
  getToken() {
    return this._token;
  }

  /** Whether a valid, non-expired token is held. */
  isAuthenticated() {
    if (!this._token) return false;
    const info = this._parseJwt(this._token);
    return info !== null && !info.isExpired;
  }

  /**
   * Returns metadata about the current token, or null if no token.
   * @returns {{ expires: Date, product: string, isExpired: boolean }|null}
   */
  getTokenInfo() {
    if (!this._token) return null;
    return this._parseJwt(this._token);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  _applyToken(jwt, persist) {
    const prev = this._token;
    this._token = jwt || null;

    if (persist) {
      this._homey.settings.set(SETTINGS_KEY, this._token);
    }

    this._clearExpiryTimer();

    if (this._token) {
      const info = this._parseJwt(this._token);
      if (info) {
        if (info.isExpired) {
          this._log('Stored token is already expired — discarding.');
          this._token = null;
          if (persist) this._homey.settings.set(SETTINGS_KEY, null);
        } else {
          this._log(`Token valid. Product: ${info.product}. Expires: ${info.expires.toISOString()}`);
          this._scheduleExpiryNotice(info.expires);
        }
      }
    }

    if (this._token !== prev) {
      this.emit('tokenChanged', this._token);
    }
  }

  /**
   * Decode JWT payload (no signature verification — only used to read exp/sub claims).
   * @param {string} jwt
   * @returns {{ expires: Date, product: string, isExpired: boolean }|null}
   */
  _parseJwt(jwt) {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) return null;
      // Base64url decode the payload
      const payload = Buffer.from(
        parts[1].replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString('utf8');
      const claims = JSON.parse(payload);

      const exp     = claims.exp ? new Date(claims.exp * 1000) : null;
      const product = claims.SubscribedProduct
        ?? claims.entitlement
        ?? claims.sub
        ?? 'F1 TV Pro';

      return {
        expires:   exp,
        product:   String(product),
        isExpired: exp ? exp.getTime() < Date.now() : false,
      };
    } catch (err) {
      this._error('Failed to parse JWT:', err.message);
      return null;
    }
  }

  _scheduleExpiryNotice(expiresAt) {
    const ms = expiresAt.getTime() - Date.now() - EXPIRY_MARGIN;
    if (ms <= 0) return;
    this._expiryTimer = setTimeout(() => {
      this._log('Token is about to expire.');
      this.emit('tokenExpired');
    }, ms);
  }

  _clearExpiryTimer() {
    if (this._expiryTimer) {
      clearTimeout(this._expiryTimer);
      this._expiryTimer = null;
    }
  }
}

module.exports = F1AuthClient;
