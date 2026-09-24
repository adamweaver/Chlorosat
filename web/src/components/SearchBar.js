import Icon from "@/components/Icon";
import styles from "@/css/SearchBar.module.css";

const stub = () => {};

/* [AI] Purpose: Find a place on the map (classic search bar, like Google Maps).
 *      Does:    Glass pill with a "Search the map" text field and a magnifying-glass submit button.
 *      Context: STUB. Submitting does nothing yet; place search = CS-030 (Nominatim, respect its usage policy).
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved out of MapOverlay.js; CSS module */
export default function SearchBar() {
  return (
    <form className={`glass ${styles.bar}`} role="search" onSubmit={(e) => { e.preventDefault(); stub(); }}>
      <input type="search" placeholder="Search the map" aria-label="Search the map" />
      <button type="submit" aria-label="Search">
        <Icon name="search" />
      </button>
    </form>
  );
}
