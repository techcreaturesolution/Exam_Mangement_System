import { useState, useRef, useEffect } from 'react';

/**
 * CustomSelect — pill-shaped, purple-themed dropdown
 * Replaces native <select> so we control all styling including
 * the open list's highlight color (no browser blue).
 *
 * Props:
 *   value      — current selected value (string)
 *   onChange   — (value: string) => void
 *   options    — [{ value, label }]
 *   placeholder — string shown when nothing selected
 */
const CustomSelect = ({ value, onChange, options = [], placeholder = 'Select...' }) => {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`cs-wrap ${open ? 'cs-open' : ''}`} ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        className="cs-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="cs-label">{selected ? selected.label : placeholder}</span>
        <svg className={`cs-arrow ${open ? 'cs-arrow-up' : ''}`} viewBox="0 0 12 8" fill="none">
          <path d="M1 1l5 5 5-5" stroke="#6B46C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul className="cs-list" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-option ${opt.value === value ? 'cs-option-selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.value === value && (
                <svg className="cs-check" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
