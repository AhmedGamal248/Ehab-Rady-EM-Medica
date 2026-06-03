import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ColorSelectModal — Concept B: Bottom Sheet (mobile) / Popover (desktop)
 *
 * Replaces the old centered modal with a pattern that:
 *  - On mobile (< 768 px): slides up as a bottom sheet from the viewport edge
 *  - On desktop (≥ 768 px): opens as a compact popover anchored to the trigger button
 *
 * Props
 * ─────
 * product        {object}   Product object with a `colors` array: [{ name, hex }]
 * isOpen         {boolean}  Controls visibility
 * onClose        {function} Called when user dismisses without confirming
 * onConfirm      {function} Called with the selected color object: { name, hex }
 * anchorRef      {Ref}      (optional) Ref to the trigger button for desktop popover positioning
 */
export default function ColorSelectModal({ product, isOpen, onClose, onConfirm, anchorRef }) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState({});
  const sheetRef = useRef(null);
  const overlayRef = useRef(null);

  const availableColors = useMemo(
    () => (product?.colors || []).filter((c) => c.name),
    [product]
  );

  /* ── Detect viewport size ─────────────────────────────────────────────── */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ── Position desktop popover relative to anchor button ──────────────── */
  useEffect(() => {
    if (!isOpen || !isDesktop || !anchorRef?.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const POPOVER_WIDTH = 280;
    const viewportWidth = window.innerWidth;

    // Try to align left edge with button; flip if it would overflow
    let left = rect.left + scrollX;
    if (left + POPOVER_WIDTH > viewportWidth + scrollX - 12) {
      left = rect.right + scrollX - POPOVER_WIDTH;
    }

    setPopoverStyle({
      top: rect.bottom + scrollY + 8,
      left: Math.max(12 + scrollX, left),
      width: POPOVER_WIDTH,
    });
  }, [isOpen, isDesktop, anchorRef]);

  /* ── Lock body scroll when bottom sheet is open on mobile ────────────── */
  useEffect(() => {
    if (!isDesktop && isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isDesktop]);

  /* ── Reset selection when opening ────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) setSelectedIndex(0);
  }, [isOpen, product]);

  /* ── Keyboard: Escape closes, arrow keys navigate ────────────────────── */
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, availableColors.length - 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') handleConfirm();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, availableColors, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* ── Outside-click closes desktop popover ────────────────────────────── */
  useEffect(() => {
    if (!isOpen || !isDesktop) return;
    const handler = (e) => {
      if (
        sheetRef.current && !sheetRef.current.contains(e.target) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target))
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, isDesktop, onClose, anchorRef]);

  /* ── Guard: nothing to render ────────────────────────────────────────── */
  if (!isOpen || !product || availableColors.length === 0) return null;

  const handleConfirm = () => {
    onConfirm(availableColors[selectedIndex]);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  /* DESKTOP — compact popover                                               */
  /* ─────────────────────────────────────────────────────────────────────── */
  if (isDesktop) {
    return (
      <div
        className="cs-popover"
        ref={sheetRef}
        style={popoverStyle}
        role="dialog"
        aria-modal="true"
        aria-label={t('colorModal.title')}
      >
        {/* Arrow pointer */}
        <div className="cs-popover__arrow" aria-hidden="true" />

        <p className="cs-popover__prompt">{t('colorModal.selectPrompt')}</p>

        {/* Color chips */}
        <div className="cs-chips" role="listbox" aria-label={t('colorModal.title')}>
          {availableColors.map((color, i) => (
            <button
              key={`${color.name}-${i}`}
              role="option"
              aria-selected={selectedIndex === i}
              className={`cs-chip ${selectedIndex === i ? 'is-active' : ''}`}
              onClick={() => setSelectedIndex(i)}
              type="button"
              aria-label={t('productDetailsPage.selectColor', { color: color.name })}
            >
              <span
                className="cs-chip__dot"
                style={{ background: color.hex || 'transparent' }}
                aria-hidden="true"
              />
              <span className="cs-chip__name">{color.name}</span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="cs-popover__footer">
          <button
            className="cs-btn cs-btn--ghost"
            onClick={onClose}
            type="button"
          >
            {t('colorModal.cancel')}
          </button>
          <button
            className="cs-btn cs-btn--primary"
            onClick={handleConfirm}
            type="button"
          >
            {t('colorModal.confirm')}
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────── */
  /* MOBILE — bottom sheet                                                   */
  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div
      className={`cs-overlay ${isOpen ? 'is-open' : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`cs-sheet ${isOpen ? 'is-open' : ''}`}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cs-sheet-title"
      >
        {/* Drag handle */}
        <div className="cs-sheet__handle" aria-hidden="true" />

        {/* Header */}
        <div className="cs-sheet__header">
          <h2 id="cs-sheet-title" className="cs-sheet__title">
            {t('colorModal.title')}
          </h2>
          <button
            className="cs-sheet__close"
            onClick={onClose}
            aria-label={t('common.cancel')}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M14 4L4 14M4 4l10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Product context pill */}
        {product.name && (
          <p className="cs-sheet__product-name">{product.name}</p>
        )}

        {/* Color chips — scrollable */}
        <div
          className="cs-chips cs-chips--sheet"
          role="listbox"
          aria-label={t('colorModal.title')}
        >
          {availableColors.map((color, i) => (
            <button
              key={`${color.name}-${i}`}
              role="option"
              aria-selected={selectedIndex === i}
              className={`cs-chip ${selectedIndex === i ? 'is-active' : ''}`}
              onClick={() => setSelectedIndex(i)}
              type="button"
              aria-label={t('productDetailsPage.selectColor', { color: color.name })}
            >
              <span
                className="cs-chip__dot"
                style={{ background: color.hex || 'transparent' }}
                aria-hidden="true"
              />
              <span className="cs-chip__name">{color.name}</span>
              {selectedIndex === i && (
                <svg className="cs-chip__check" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Selected color preview bar */}
        <div className="cs-sheet__preview">
          <span
            className="cs-sheet__preview-swatch"
            style={{ background: availableColors[selectedIndex]?.hex || 'transparent' }}
            aria-hidden="true"
          />
          <span className="cs-sheet__preview-label">
            {availableColors[selectedIndex]?.name}
          </span>
        </div>

        {/* CTA */}
        <button
          className="cs-btn cs-btn--primary cs-btn--full"
          onClick={handleConfirm}
          type="button"
        >
          {t('colorModal.confirm')}
        </button>
      </div>
    </div>
  );
}