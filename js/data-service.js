/**
 * Data Service – Fetch JSON, merge localStorage overlay, CRUD operations
 *
 * Data strategy:
 *  - JSON files in /data/ are the baseline (shipped with repo)
 *  - localStorage stores admin additions, deletions, and updates as an overlay
 *  - getData() merges baseline + overlay
 *  - exportData() returns merged data for manual commit back to JSON
 */

const STORAGE_PREFIX = 'ss_';

/**
 * Get merged data for a collection.
 * @param {'testimonials'|'references'|'services'|'team'} collection
 * @returns {Promise<Array|Object>}
 */
export async function getData(collection) {
  const baseline = await fetchJSON(collection);
  const overlay = getOverlay(collection);

  // Team doesn't have admin CRUD
  if (collection === 'team') {
    return baseline;
  }

  // Services is object-based (commercial/residential arrays)
  if (collection === 'services') {
    return mergeServicesOverlay(baseline, overlay);
  }

  // Merge: baseline items minus deleted, apply updates, plus added
  const deleted = new Set(overlay.deleted || []);
  const added = overlay.added || [];
  const updated = overlay.updated || [];
  const updateMap = new Map(updated.map(u => [u.id, u]));

  const filtered = (Array.isArray(baseline) ? baseline : []).filter(
    item => !deleted.has(item.id)
  ).map(item => {
    const upd = updateMap.get(item.id);
    return upd ? { ...item, ...upd } : item;
  });

  return [...filtered, ...added];
}

/**
 * Merge services overlay (object-based: { commercial: [], residential: [] })
 */
function mergeServicesOverlay(baseline, overlay) {
  if (!overlay.added && !overlay.deleted && !overlay.updated) return baseline;

  const result = {
    commercial: [...(baseline.commercial || [])],
    residential: [...(baseline.residential || [])]
  };

  const deleted = new Set(overlay.deleted || []);
  const updateMap = new Map((overlay.updated || []).map(u => [u.id, u]));

  // Filter deleted and apply updates
  for (const key of ['commercial', 'residential']) {
    result[key] = result[key]
      .filter(item => !deleted.has(item.id))
      .map(item => {
        const upd = updateMap.get(item.id);
        return upd ? { ...item, ...upd } : item;
      });
  }

  // Add new items
  for (const item of (overlay.added || [])) {
    const cat = item.category || 'commercial';
    if (result[cat]) result[cat].push(item);
  }

  return result;
}

/**
 * Add an item to a collection via localStorage overlay.
 */
export function addItem(collection, item) {
  const overlay = getOverlay(collection);
  if (!overlay.added) overlay.added = [];
  overlay.added.push(item);
  saveOverlay(collection, overlay);
}

/**
 * Update an item in a collection via localStorage overlay.
 */
export function updateItem(collection, id, updates) {
  const overlay = getOverlay(collection);

  // If it's an admin-added item, update in place
  if (overlay.added) {
    const idx = overlay.added.findIndex(item => item.id === id);
    if (idx !== -1) {
      Object.assign(overlay.added[idx], updates);
      saveOverlay(collection, overlay);
      return;
    }
  }

  // Otherwise add/merge to updated array
  if (!overlay.updated) overlay.updated = [];
  const existingIdx = overlay.updated.findIndex(u => u.id === id);
  if (existingIdx !== -1) {
    Object.assign(overlay.updated[existingIdx], updates);
  } else {
    overlay.updated.push({ id, ...updates });
  }
  saveOverlay(collection, overlay);
}

/**
 * Delete an item from a collection via localStorage overlay.
 */
export function deleteItem(collection, id) {
  const overlay = getOverlay(collection);

  // If it's an admin-added item, remove from added array
  if (overlay.added) {
    const idx = overlay.added.findIndex(item => item.id === id);
    if (idx !== -1) {
      overlay.added.splice(idx, 1);
      saveOverlay(collection, overlay);
      return;
    }
  }

  // Remove from updated if present
  if (overlay.updated) {
    const idx = overlay.updated.findIndex(u => u.id === id);
    if (idx !== -1) overlay.updated.splice(idx, 1);
  }

  // Mark baseline item as deleted
  if (!overlay.deleted) overlay.deleted = [];
  if (!overlay.deleted.includes(id)) {
    overlay.deleted.push(id);
  }
  saveOverlay(collection, overlay);
}

/**
 * Export merged data as JSON string (for downloading/committing).
 */
export async function exportData(collection) {
  const data = await getData(collection);
  return JSON.stringify(data, null, 2);
}

/**
 * Clear all overlay data for a collection.
 */
export function resetOverlay(collection) {
  localStorage.removeItem(STORAGE_PREFIX + collection);
}

/**
 * Get data from localStorage-only collection (no baseline JSON file).
 * Used for contacts, etc.
 */
export function getLocalCollection(collection) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + collection);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save data to a localStorage-only collection.
 */
export function saveLocalCollection(collection, data) {
  localStorage.setItem(STORAGE_PREFIX + collection, JSON.stringify(data));
}

/**
 * Get data with a filter function applied.
 */
export async function getDataFiltered(collection, filterFn) {
  const data = await getData(collection);
  if (Array.isArray(data)) {
    return data.filter(filterFn);
  }
  return data;
}

// --- Internal helpers ---

async function fetchJSON(collection) {
  try {
    const res = await fetch(`data/${collection}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to fetch ${collection}.json:`, e);
    return [];
  }
}

function getOverlay(collection) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + collection);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverlay(collection, overlay) {
  localStorage.setItem(STORAGE_PREFIX + collection, JSON.stringify(overlay));
}
