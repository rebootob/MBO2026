/**
 * Safe Host Resolver for Kintone Record UI
 */

export function getRecordUiHost(preferredSpaceId = 'SPACE_HEADER') {
  if (typeof kintone === 'undefined' || !kintone.app || !kintone.app.record) {
    return null;
  }

  // 1. Try specified Space Field
  if (typeof kintone.app.record.getSpaceElement === 'function') {
    const spaceEl = kintone.app.record.getSpaceElement(preferredSpaceId);
    if (spaceEl) return spaceEl;

    // Fallback space IDs
    const fallbackSpaceIds = ['SPACE_HEADER', 'SPACE_MBO_ROOT', 'SPACE_PART_A'];
    for (const id of fallbackSpaceIds) {
      if (id !== preferredSpaceId) {
        const el = kintone.app.record.getSpaceElement(id);
        if (el) return el;
      }
    }
  }

  // 2. Fallback: Record Header Menu Space Element
  if (typeof kintone.app.record.getHeaderMenuSpaceElement === 'function') {
    const menuEl = kintone.app.record.getHeaderMenuSpaceElement();
    if (menuEl) return menuEl;
  }

  return null;
}
