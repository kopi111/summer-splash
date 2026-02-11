/**
 * Admin Contacts – View contact form submissions, export CSV
 */

import { getLocalCollection } from './data-service.js';

export async function initAdminContacts() {
  renderTable();
  bindActions();
}

function renderTable() {
  const tbody = document.getElementById('admin-contacts-tbody');
  if (!tbody) return;

  const contacts = getLocalCollection('contacts');

  if (contacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="admin-empty">No contact submissions yet.</td></tr>';
    return;
  }

  // Show newest first
  const sorted = [...contacts].reverse();

  tbody.innerHTML = sorted.map(c => `
    <tr>
      <td><strong>${escapeHtml(c.name)}</strong></td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || '—')}</td>
      <td>${escapeHtml(c.service || '—')}</td>
      <td class="truncate">${escapeHtml(c.message)}</td>
      <td>${formatDate(c.date)}</td>
      <td><span class="status-badge status-badge--${c.status || 'new'}">${escapeHtml(c.status || 'new')}</span></td>
    </tr>
  `).join('');
}

function bindActions() {
  const exportBtn = document.getElementById('export-contacts-btn');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const contacts = getLocalCollection('contacts');
      if (contacts.length === 0) {
        alert('No contact submissions to export.');
        return;
      }
      downloadCSV('contacts.csv', contacts);
    });
  }
}

function downloadCSV(filename, data) {
  const headers = ['Name', 'Email', 'Phone', 'Service', 'Message', 'Date', 'Status'];
  const rows = data.map(c => [
    csvEscape(c.name),
    csvEscape(c.email),
    csvEscape(c.phone || ''),
    csvEscape(c.service || ''),
    csvEscape(c.message),
    csvEscape(formatDate(c.date)),
    csvEscape(c.status || 'new')
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(str) {
  if (!str) return '""';
  const escaped = String(str).replace(/"/g, '""');
  return `"${escaped}"`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
