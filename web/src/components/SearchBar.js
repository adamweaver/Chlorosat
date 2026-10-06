"use client";

import { useEffect, useRef, useState } from 'react';
import styles from "@/css/MapApp.module.css";
import { searchPlaces, minSearchLength } from "@/lib/geocode";

/* [AI] Recent searches. David wanted the search box to show a visitor's
 *      most recent searches as soon as it's clicked, before anything is
 *      typed. They're kept only in that visitor's own browser
 *      (localStorage) - never sent to the server - and hold the full place
 *      (label + where to fly), so picking one goes straight there without
 *      a new lookup. Private windows or blocked storage just mean no
 *      history; every read/write is wrapped so search itself never breaks.
 *      Written: 2026-09-28 · Claude Opus 5.5 · requested by David */
const RECENTS_KEY = 'chlorosat:recentSearches';
const RECENTS_LIMIT = 10; // David, 2026-09-29: was 5; the list scrolls past what fits

function loadRecents() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENTS_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((p) => p && p.id && p.label && Number.isFinite(p.lng) && Number.isFinite(p.lat)).slice(0, RECENTS_LIMIT)
      : [];
  } catch (err) {
    return [];
  }
}

function saveRecents(list) {
  try {
    if (list.length) window.localStorage.setItem(RECENTS_KEY, JSON.stringify(list));
    else window.localStorage.removeItem(RECENTS_KEY);
  } catch (err) {
    // Storage full/blocked - history just isn't kept.
  }
}

/* [AI] Purpose: Search box matching the mockup's top-right pill. Does:
 *      searches as-you-type, debounced, showing up to 5 candidate places in
 *      a dropdown so David can narrow down which "Springfield" (etc.) he
 *      means before committing, rather than only ever flying to the #1
 *      guess on Enter. An "x" button appears once there's text, to clear
 *      the query/suggestions and refocus in one click instead of
 *      selecting-and-retyping.
 *      Context: no longer uses react-leaflet's useMap() - now the map is
 *      the real MapLibre globe (chlorosatGlobeEngine.js), driven through
 *      the `engine` prop's fitToBounds()/flyTo() instead.
 *      Update: lookups go to Photon (lib/geocode.js) instead of
 *      OpenStreetMap's Nominatim, whose usage policy forbids
 *      search-as-you-type. Results arrive as { id, label, lng, lat, bbox }.
 *      Written: 2026-09-24 · Claude Sonnet 5 · requested by David
 *      Ported:  2026-09-30 · Claude Opus 5.5 (for David) · from the demo; Photon is now called from the browser (static site) */
/* [AI] menuOpen / onMenuToggle / onSearchFocus: the three-bar menu button on
 *      the left of the search bar (phones only - CSS hides it on desktop, where
 *      the magnifier stays). It opens the Year + opacity menu that MapApp
 *      renders; focusing the search box closes that menu so the two dropdowns
 *      never overlap. Written: 2026-09-29 · Claude Opus 5.5 · requested by David */
export default function SearchBar({ engine, menuOpen = false, onMenuToggle, onSearchFocus }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // Read straight from localStorage on the first render. Safe because the map UI
  // only ever renders in the browser (MapApp loads with ssr: false), so there's no
  // server-rendered HTML to mismatch. (Was a setState in a mount effect, which the
  // react-hooks/set-state-in-effect lint rule rejects.)
  const [recents, setRecents] = useState(loadRecents);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  // Set right before setQuery() when the new text comes from picking a
  // result (click, or Enter), not from typing - otherwise the query-change
  // effect below sees that text land and immediately re-searches it,
  // popping the dropdown back open right after a selection was just made.
  // Holds the exact text to skip (not just a true/false flag): if the picked
  // label is identical to what was typed ("Africa" -> "Africa"), setQuery()
  // doesn't change anything, the effect never runs, and a plain flag would
  // stay set and swallow the *next* real search instead.
  const suppressNextSearchRef = useRef(null);
  // Latest engine, for reading the map view inside the delayed search below
  // (kept in a ref so the search effect doesn't re-run when the engine arrives).
  const engineRef = useRef(engine);
  useEffect(() => {
    engineRef.current = engine;
  });
  // The place last picked, so Enter on its (unchanged) name flies back to it.
  const lastPlaceRef = useRef(null);

  // The map view, so places near what's on screen can rank higher (lib/geocode.js).
  function currentNear() {
    const map = engineRef.current && engineRef.current.map;
    const center = map && map.getCenter();
    return center ? { lng: center.lng, lat: center.lat, zoom: map.getZoom() } : null;
  }

  // Debounced as-you-type lookup - waits for a short pause in typing so it
  // doesn't fire a request per keystroke, and only searches once there's
  // enough text to narrow things down at all.
  useEffect(() => {
    const suppressed = suppressNextSearchRef.current;
    suppressNextSearchRef.current = null;
    if (suppressed !== null && suppressed === query) {
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    // Too short to search: nothing to do here. Old results are hidden by
    // `shownSuggestions` below instead of being cleared, because calling
    // setState directly in an effect is rejected by react-hooks/set-state-in-effect.
    if (trimmed.length < minSearchLength(trimmed)) return undefined;
    debounceRef.current = setTimeout(async () => {
      const thisRequestId = ++requestIdRef.current;
      setLoading(true);
      try {
        // Runs in the browser (static site, no server): see lib/geocode.js.
        const results = await searchPlaces(trimmed, currentNear());
        // A slower earlier request can resolve after a newer one - ignore
        // it so a stale result list doesn't clobber the current typing.
        if (thisRequestId !== requestIdRef.current) return;
        setSuggestions(results);
        setOpen(results.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (thisRequestId === requestIdRef.current) setSuggestions([]);
      } finally {
        if (thisRequestId === requestIdRef.current) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function rememberPlace(place) {
    const entry = { id: place.id, label: place.label, lng: place.lng, lat: place.lat, bbox: place.bbox ?? null, zoom: place.zoom ?? null, view: place.view ?? null };
    setRecents((prev) => {
      const next = [entry, ...prev.filter((p) => p.id !== entry.id && p.label !== entry.label)].slice(0, RECENTS_LIMIT);
      saveRecents(next);
      return next;
    });
  }

  function removeRecent(id) {
    setRecents((prev) => {
      const next = prev.filter((p) => p.id !== id);
      saveRecents(next);
      return next;
    });
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function clearRecents() {
    setRecents([]);
    saveRecents([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  // Results only count while there's enough text to have searched for them
  // (typing back down to 1-2 letters hides the old list).
  const shownSuggestions = query.trim().length >= minSearchLength(query.trim()) ? suggestions : [];
  // Empty box -> the dropdown lists recent searches; otherwise live results.
  const showingRecents = query.trim() === '' && recents.length > 0;
  const items = showingRecents ? recents : shownSuggestions;

  // Close the dropdown on an outside click.
  useEffect(() => {
    function onPointerDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  function goToSuggestion(place) {
    if (!place || !engine) return;
    // Fitting to the place's outline box (rather than flying to its center
    // at a fixed zoom) is what actually lands on "Norman" zoomed in on
    // Norman, instead of a fixed zoom level that happens to show the whole
    // surrounding state for a city-sized result. Results without a usable
    // box (addresses, or places whose box the geocode route rejected - see
    // framingBounds there) fly to a zoom picked for the kind of place.
    if (place.view === 'globe' && engine.flyToGlobe) {
      engine.flyToGlobe(place.lng, place.lat);
    } else if (place.bbox && engine.fitToBounds) {
      engine.fitToBounds(place.bbox);
    } else {
      engine.flyTo(place.lng, place.lat, place.zoom ?? 14);
    }
    rememberPlace(place);
    lastPlaceRef.current = place;
    suppressNextSearchRef.current = place.label;
    requestIdRef.current++; // invalidate any lookup already in flight
    setQuery(place.label);
    setOpen(false);
    setSuggestions([]);
    // [AI] Take focus off the search box once a place is picked, so a phone's
    //      on-screen keyboard closes and the whole map is visible again
    //      (David, 2026-09-29). On desktop this just leaves the box unfocused.
    inputRef.current?.blur();
  }

  function clearSearch() {
    setQuery('');
    setSuggestions([]);
    // The box stays focused, so reopen straight onto the recent searches.
    setOpen(true);
    setActiveIndex(-1);
    requestIdRef.current++; // invalidate any in-flight lookup
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      if (items.length) setActiveIndex((i) => (i + 1) % items.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length) setActiveIndex((i) => (i - 1 + items.length) % items.length);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter') {
      if (activeIndex >= 0 && items[activeIndex]) {
        goToSuggestion(items[activeIndex]);
      } else if (!showingRecents && shownSuggestions[0]) {
        goToSuggestion(shownSuggestions[0]);
      } else {
        searchNow();
      }
    }
  }

  /* [AI] Purpose: Enter with no list showing used to do nothing. David found
   *      it after searching a place, zooming in, and pressing Enter again:
   *      the box still held the place's name but the list was gone.
   *      Does:    If the box still holds the place last picked, fly back to
   *               it. Otherwise, if there's enough text, search right away
   *               (not waiting for the typing pause) and go to the top result.
   *      Written: 2026-09-30 · Claude Opus 5.5 · requested by David */
  async function searchNow() {
    const trimmed = query.trim();
    const last = lastPlaceRef.current;
    if (last && trimmed === last.label) {
      goToSuggestion(last);
      return;
    }
    if (trimmed.length < minSearchLength(trimmed)) return;
    clearTimeout(debounceRef.current); // this replaces the delayed search
    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const results = await searchPlaces(trimmed, currentNear());
      if (thisRequestId !== requestIdRef.current) return; // newer typing won
      setLoading(false);
      if (results[0]) goToSuggestion(results[0]);
    } catch (err) {
      // Search unavailable: leave things as they are.
    } finally {
      if (thisRequestId === requestIdRef.current) setLoading(false);
    }
  }

  return (
    <div className={styles.searchPanel} ref={wrapRef}>
      {onMenuToggle && (
        <button
          type="button"
          className={styles.searchMenuButton}
          data-map-menu-toggle
          aria-label="Map settings"
          aria-expanded={menuOpen}
          onClick={() => {
            setOpen(false);
            inputRef.current?.blur();
            onMenuToggle();
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        className={styles.searchInput}
        placeholder={loading ? 'Searching…' : 'Search the map'}
        enterKeyHint="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
        onKeyDown={handleKeyDown}
        onFocus={() => { setOpen(true); if (onSearchFocus) onSearchFocus(); }}
        onClick={() => setOpen(true)}
      />
      {query && (
        <button
          type="button"
          className={styles.searchClearButton}
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clearSearch}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {open && showingRecents && (
        <ul className={`${styles.searchSuggestions} ${styles.searchSuggestionsRecents}`} aria-label="Recent searches">
          <li className={styles.searchRecentHeader} onMouseDown={(e) => e.preventDefault()}>
            <span>Recent searches</span>
            <button type="button" className={styles.searchRecentClearAll} onClick={clearRecents}>
              Clear
            </button>
          </li>
          {recents.map((place, i) => (
            <li
              key={place.id}
              className={
                i === activeIndex
                  ? `${styles.searchSuggestionItem} ${styles.searchRecentItem} ${styles.searchSuggestionItemActive}`
                  : `${styles.searchSuggestionItem} ${styles.searchRecentItem}`
              }
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToSuggestion(place)}
            >
              <svg className={styles.searchRecentIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={styles.searchRecentLabel}>{place.label}</span>
              <button
                type="button"
                className={styles.searchRecentRemove}
                aria-label={`Remove ${place.label} from recent searches`}
                onClick={(e) => { e.stopPropagation(); removeRecent(place.id); }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !showingRecents && shownSuggestions.length > 0 && (
        <ul className={styles.searchSuggestions}>
          {shownSuggestions.map((place, i) => (
            <li
              key={place.id}
              className={
                i === activeIndex
                  ? `${styles.searchSuggestionItem} ${styles.searchSuggestionItemActive}`
                  : styles.searchSuggestionItem
              }
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToSuggestion(place)}
            >
              {place.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
