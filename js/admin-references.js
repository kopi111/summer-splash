/**
 * Admin References – Add/delete references, export data
 */

import { getData, addItem, deleteItem, exportData } from './data-service.js';
import { trapFocus } from './accessibility.js';

let cleanupFocusTrap = null;

export async function initAdminReferences() {
  await renderTable();
  bindActions();
}

async function renderTable() {
  const tbody = document.getElementById('admin-references-tbody');
  if (!tbody) return;

  const references = await getData('references');

  if (references.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No references yet. Add one above.</td></tr>';
    return;
  }

  tbody.innerHTML = references.map(r => `
    <tr>
      <td><strong>${escapeHtml(r.company)}</strong><br><small>${escapeHtml(r.address || '')}</small></td>
      <td>${escapeHtml(r.contact)}${r.phone ? `<br><small>${escapeHtml(r.phone)}</small>` : ''}</td>
      <td>${escapeHtml(r.service)}</td>
      <td>${escapeHtml(r.dateFrom || '')} &ndash; ${escapeHtml(r.dateTo || '')}</td>
      <td class="actions">
        <button class="btn btn--danger" data-delete-reference="${escapeHtml(r.id)}">Delete</button>
      </td>
    </tr>
  `).join('');
}

function bindActions() {
  const addBtn = document.getElementById('add-reference-btn');
  const modal = document.getElementById('reference-modal');
  const form = document.getElementById('reference-form');
  const exportBtn = document.getElementById('export-references-btn');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => openModal(modal));
  }

  if (modal) {
    modal.querySelector('.modal__close')?.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(modal);
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      const reference = {
        id: 'r_' + Date.now(),
        company: data.get('r-company').trim(),
        address: data.get('r-address').trim(),
        contact: data.get('r-contact').trim(),
        phone: data.get('r-phone').trim(),
        service: data.get('r-service').trim(),
        dateFrom: data.get('r-date-from').trim(),
        dateTo: data.get('r-date-to').trim() || 'Present',
        description: data.get('r-description').trim()
      };

      addItem('references', reference);
      form.reset();
      closeModal(modal);
      await renderTable();
    });
  }

  document.getElementById('admin-references-tbody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete-reference]');
    if (!btn) return;

    if (confirm('Delete this reference?')) {
      deleteItem('references', btn.dataset.deleteReference);
      await renderTable();
    }
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportData('references');
      downloadJSON('references.json', json);
    });
  }
}

function openModal(modal) {
  modal.classList.add('is-open');
  cleanupFocusTrap = trapFocus(modal.querySelector('.modal'));
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  if (cleanupFocusTrap) {
    cleanupFocusTrap();
    cleanupFocusTrap = null;
  }
}

function downloadJSON(filename, content) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
