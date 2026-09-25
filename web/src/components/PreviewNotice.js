import { useState } from "react";
import Icon from "@/components/Icon";
import styles from "@/css/PreviewNotice.module.css";

/* [AI] Purpose: Tell visitors honestly that the map is an early preview, so nobody mistakes the
 *               placeholder controls for broken ones (PRINCIPLES #5: clearly mark unfinished data).
 *      Does:    Glass card at the top of the left stack: "Early preview" + what isn't built yet.
 *               "Got it" hides it until the next visit (state is local, nothing is saved).
 *      Context: Shown on /map/ via MapOverlay. Remove it (or shorten it) once real vegetation
 *               layers land (CS-012, CS-020, CS-022).
 *      Written: 2026-09-24 · Claude Opus 5.5 · requested by Adam Weaver */
export default function PreviewNotice() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className={`glass ${styles.notice}`} role="note" aria-label="Early preview">
      <Icon name="info" />
      <div className={styles.text}>
        <strong>Early preview</strong>
        <p>
          Most features aren&apos;t built yet: vegetation colors, stats, and year comparisons are
          coming soon. The controls don&apos;t change the map yet.
        </p>
      </div>
      <button type="button" onClick={() => setOpen(false)}>
        Got it
      </button>
    </div>
  );
}
