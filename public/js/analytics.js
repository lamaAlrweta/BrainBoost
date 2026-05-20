// ========================================
// حلّها (Hallha) — Analytics wrapper
// ========================================
// Centralizes PostHog (product funnels), Google Analytics 4 (marketing/SEO),
// and Cloudflare Web Analytics (free traffic baseline).
//
// Each tool is gracefully no-op'd until its ID is configured below — so the
// site keeps working even before all dashboard keys are in place.
//
// To activate a tool, replace its placeholder value here and redeploy.
// ========================================

const Analytics = (() => {
  // ────────────────────────────────────────────────────────────
  // CONFIG — replace these placeholders once you have the IDs.
  // ────────────────────────────────────────────────────────────
  const CONFIG = {
    // PostHog Project API Key — get at https://posthog.com/signup
    // Looks like: 'phc_AbCd...'
    posthogKey: '__POSTHOG_KEY_PLACEHOLDER__',
    posthogHost: 'https://eu.i.posthog.com',  // EU region for better privacy with students

    // Google Analytics 4 Measurement ID — get at https://analytics.google.com
    // Looks like: 'G-XXXXXXXXXX'
    ga4Id: '__GA4_ID_PLACEHOLDER__',

    // Cloudflare Web Analytics beacon token — get at Cloudflare dashboard →
    // Analytics → Web Analytics → Add a site
    // Looks like: a 32-character hex token
    cfBeaconToken: '__CF_BEACON_PLACEHOLDER__',
  };

  // Detect whether each tool is actually configured (not a placeholder)
  function isConfigured(value) {
    return value && !value.startsWith('__') && !value.endsWith('PLACEHOLDER__');
  }

  const enabled = {
    posthog: isConfigured(CONFIG.posthogKey),
    ga4:     isConfigured(CONFIG.ga4Id),
    cf:      isConfigured(CONFIG.cfBeaconToken),
  };

  // ────────────────────────────────────────────────────────────
  // PostHog loader (only runs if key is set)
  // ────────────────────────────────────────────────────────────
  function loadPostHog() {
    if (!enabled.posthog) return;
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init me ws ys ps bs capture je Di ks register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug Ts getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init(CONFIG.posthogKey, {
      api_host: CONFIG.posthogHost,
      person_profiles: 'identified_only',  // Only create profile when we explicitly identify (saves event quota)
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,                   // Auto-track button clicks etc.
      disable_session_recording: false,    // Enable session recordings (you can review actual user flows)
      session_recording: { maskAllInputs: false, maskInputOptions: { password: true } },
    });
    /* eslint-enable */
  }

  // ────────────────────────────────────────────────────────────
  // Google Analytics 4 loader
  // ────────────────────────────────────────────────────────────
  function loadGA4() {
    if (!enabled.ga4) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ga4Id}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', CONFIG.ga4Id, { send_page_view: true });
  }

  // ────────────────────────────────────────────────────────────
  // Cloudflare Web Analytics beacon
  // ────────────────────────────────────────────────────────────
  function loadCloudflareAnalytics() {
    if (!enabled.cf) return;
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CONFIG.cfBeaconToken }));
    document.head.appendChild(s);
  }

  // ────────────────────────────────────────────────────────────
  // Public API — call these from app code
  // ────────────────────────────────────────────────────────────

  /**
   * Track a custom event. Sent to PostHog + GA4 (Cloudflare is pageview-only).
   * @param {string} event - snake_case event name (e.g. 'battle_completed')
   * @param {object} [props] - event properties
   */
  function track(event, props = {}) {
    try {
      if (enabled.posthog && window.posthog) {
        window.posthog.capture(event, props);
      }
      if (enabled.ga4 && window.gtag) {
        window.gtag('event', event, props);
      }
    } catch (e) {
      // Never let analytics throw and break the app
      console.warn('[analytics] track failed:', e);
    }
  }

  /**
   * Identify the current user with attributes (for retention/cohorts).
   * @param {object} props - e.g. { lang: 'ar', total_battles: 5 }
   */
  function identify(props = {}) {
    try {
      if (enabled.posthog && window.posthog) {
        const distinctId = window.posthog.get_distinct_id?.() || undefined;
        window.posthog.identify(distinctId, props);
      }
      if (enabled.ga4 && window.gtag) {
        // GA4 user properties
        const userProps = {};
        Object.keys(props).forEach(k => { userProps[k] = props[k]; });
        window.gtag('set', 'user_properties', userProps);
      }
    } catch (e) {
      console.warn('[analytics] identify failed:', e);
    }
  }

  /**
   * Manual pageview (useful for SPA navigation between hidden screens).
   * @param {string} screen - e.g. 'battle_screen', 'victory_screen'
   */
  function pageview(screen) {
    try {
      if (enabled.posthog && window.posthog) {
        window.posthog.capture('$pageview', { $current_url: window.location.href, screen });
      }
      if (enabled.ga4 && window.gtag) {
        window.gtag('event', 'page_view', { page_title: screen, page_location: window.location.href });
      }
    } catch (e) {
      console.warn('[analytics] pageview failed:', e);
    }
  }

  // Boot
  loadPostHog();
  loadGA4();
  loadCloudflareAnalytics();

  // Debug log so you can see in browser console which tools are live
  const activeTools = Object.entries(enabled).filter(([_, v]) => v).map(([k]) => k);
  if (activeTools.length > 0) {
    console.log('[analytics] active:', activeTools.join(', '));
  } else {
    console.log('[analytics] no tools configured yet — running in no-op mode');
  }

  return { track, identify, pageview, enabled };
})();
