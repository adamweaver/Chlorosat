import Icon from "@/components/Icon";
import styles from "@/css/IconButton.module.css";

/* [AI] Purpose: A round glass button that shows only an icon.
 *      Does:    Renders <button> with an aria-label, since there's no visible text. `dot` adds a small
 *               amber status dot. Any other props (onClick, aria-expanded, ...) pass straight through.
 *      Written: 2026-09-23 · Claude Opus 5.5 · requested by Lucas
 *      Edited:  2026-09-23 · Claude Opus 5.5 (for Lucas) · moved out of MapOverlay.js; CSS module; dot prop */
export default function IconButton({ icon, label, dot = false, ...rest }) {
  return (
    <button type="button" className={`glass ${styles.iconBtn}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
      {dot && <span className={styles.dot} />}
    </button>
  );
}
