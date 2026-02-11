/**
 * Admin Testimonials – Add/edit/delete testimonials, approve/reject, export data
 */

import { getData, addItem, deleteItem, updateItem, exportData } from './data-service.js';
import { trapFocus } from './accessibility.js';

let cleanupFocusTrap = null;

export async function initAdminTestimonials() {
  await renderTable();
  bindActions();
}

async function renderTable() {
  const tbody = document.getElementById('admin-testimonials-tbody');
  if (!tbody) return;

  const testimonials = await getData('testimonials');

  if (testimonials.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty">No testimonials yet. Add one above.</td></tr>';
    return;
  }

  tbody.innerHTML = testimonials.map(t => {
    const status = t.status || 'approved';
    const statusClass = status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : 'rejected';

    return `
    <tr>
      <td><strong>${escapeHtml(t.name)}</strong><br><small>${escapeHtml(t.role || '')}</small></td>
      <td class="truncate">${escapeHtml(t.text)}</td>
      <td>${'&#9733;'.repeat(t.rating)}</td>
      <td><span class="status-badge status-badge--${statusClass}">${status}</span></td>
      <td>${escapeHtml(t.date)}</td>
      <td class="actions">
        ${status === 'pending' ? `
          <button class="btn btn--approve btn--sm" data-approve-testimonial="${escapeHtml(t.id)}">Approve</button>
          <button class="btn btn--reject btn--sm" data-reject-testimonial="${escapeHtml(t.id)}">Reject</button>
        ` : ''}
        <button class="btn btn--primary btn--sm" data-edit-testimonial="${escapeHtml(t.id)}">Edit</button>
        <button class="btn btn--danger" data-delete-testimonial="${escapeHtml(t.id)}">Delete</button>
      </td>
    </tr>
  `}).join('');
}

function bindActions() {
  // Add button -> open modal
  const addBtn = document.getElementById('add-testimonial-btn');
  const modal = document.getElementById('testimonial-modal');
  const form = document.getElementById('testimonial-form');
  const exportBtn = document.getElementById('export-testimonials-btn');
  const modalTitle = document.getElementById('modal-testimonial-title');
  const modalSubmitBtn = modal?.querySelector('.modal__footer button[type="submit"]');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => {
      // Reset form for adding
      form?.reset();
      if (modalTitle) modalTitle.textContent = 'Add Testimonial';
      if (modalSubmitBtn) modalSubmitBtn.textContent = 'Add Testimonial';
      form?.removeAttribute('data-editing-id');
      openModal(modal);
    });
  }

  // Close modal
  if (modal) {
    modal.querySelector('.modal__close')?.addEventListener('click', () => closeModal(modal));
    modal.querySelectorAll('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal));
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(modal);
    });
  }

  // Form submit (add or edit)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const editingId = form.dataset.editingId;

      const fields = {
        name: data.get('t-name').trim(),
        property: data.get('t-property').trim(),
        role: data.get('t-role').trim(),
        location: data.get('t-location').trim(),
        rating: Number(data.get('t-rating')) || 5,
        text: data.get('t-text').trim(),
        photo: data.get('t-photo').trim() || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face'
      };

      if (editingId) {
        // Edit existing
        updateItem('testimonials', editingId, fields);
      } else {
        // Add new
        const testimonial = {
          id: 't_' + Date.now(),
          ...fields,
          date: new Date().toISOString().split('T')[0],
          status: 'approved'
        };
        addItem('testimonials', testimonial);
      }

      form.reset();
      form.removeAttribute('data-editing-id');
      closeModal(modal);
      await renderTable();
    });
  }

  // Delegated actions on tbody
  document.getElementById('admin-testimonials-tbody')?.addEventListener('click', async (e) => {
    // Delete
    const deleteBtn = e.target.closest('[data-delete-testimonial]');
    if (deleteBtn) {
      if (confirm('Delete this testimonial?')) {
        deleteItem('testimonials', deleteBtn.dataset.deleteTestimonial);
        await renderTable();
      }
      return;
    }

    // Approve
    const approveBtn = e.target.closest('[data-approve-testimonial]');
    if (approveBtn) {
      updateItem('testimonials', approveBtn.dataset.approveTestimonial, { status: 'approved' });
      await renderTable();
      return;
    }

    // Reject
    const rejectBtn = e.target.closest('[data-reject-testimonial]');
    if (rejectBtn) {
      updateItem('testimonials', rejectBtn.dataset.rejectTestimonial, { status: 'rejected' });
      await renderTable();
      return;
    }

    // Edit
    const editBtn = e.target.closest('[data-edit-testimonial]');
    if (editBtn && modal && form) {
      const testimonials = await getData('testimonials');
      const t = testimonials.find(item => item.id === editBtn.dataset.editTestimonial);
      if (!t) return;

      // Pre-fill form
      form.querySelector('#t-name').value = t.name || '';
      form.querySelector('#t-property').value = t.property || '';
      form.querySelector('#t-role').value = t.role || '';
      form.querySelector('#t-location').value = t.location || '';
      form.querySelector('#t-rating').value = t.rating || 5;
      form.querySelector('#t-text').value = t.text || '';
      form.querySelector('#t-photo').value = t.photo || '';

      form.dataset.editingId = t.id;
      const modalTitle = document.getElementById('modal-testimonial-title');
      const modalSubmitBtn = modal.querySelector('.modal__footer button[type="submit"]');
      if (modalTitle) modalTitle.textContent = 'Edit Testimonial';
      if (modalSubmitBtn) modalSubmitBtn.textContent = 'Save Changes';
      openModal(modal);
    }
  });

  // Export
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportData('testimonials');
      downloadJSON('testimonials.json', json);
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
