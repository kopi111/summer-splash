/**
 * Admin Services – Add/edit/delete services, export JSON
 * Services use object-based structure: { commercial: [], residential: [] }
 */

import { getData, addItem, deleteItem, updateItem, exportData } from './data-service.js';
import { trapFocus } from './accessibility.js';

let cleanupFocusTrap = null;

export async function initAdminServices() {
  await renderTable();
  bindActions();
}

async function renderTable() {
  const tbody = document.getElementById('admin-services-tbody');
  if (!tbody) return;

  const services = await getData('services');
  const allServices = [
    ...(services.commercial || []).map(s => ({ ...s, category: 'commercial' })),
    ...(services.residential || []).map(s => ({ ...s, category: 'residential' }))
  ];

  if (allServices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty">No services yet. Add one above.</td></tr>';
    return;
  }

  tbody.innerHTML = allServices.map(s => `
    <tr>
      <td>
        ${s.image ? `<img src="${escapeHtml(s.image)}" alt="" style="width:60px;height:40px;object-fit:cover;border-radius:var(--radius-sm);">` : '<span style="color:var(--color-gray-400);">—</span>'}
      </td>
      <td><strong>${escapeHtml(s.title)}</strong></td>
      <td><span class="status-badge status-badge--${s.category === 'commercial' ? 'approved' : 'pending'}">${escapeHtml(s.category)}</span></td>
      <td class="truncate">${escapeHtml(s.description)}</td>
      <td class="actions">
        <button class="btn btn--primary btn--sm" data-edit-service="${escapeHtml(s.id)}">Edit</button>
        <button class="btn btn--danger" data-delete-service="${escapeHtml(s.id)}">Delete</button>
      </td>
    </tr>
  `).join('');
}

function bindActions() {
  const addBtn = document.getElementById('add-service-btn');
  const modal = document.getElementById('service-modal');
  const form = document.getElementById('service-form');
  const exportBtn = document.getElementById('export-services-btn');
  const imageInput = document.getElementById('s-image-file');
  const imagePreview = document.getElementById('s-image-preview');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => {
      form?.reset();
      if (imagePreview) { imagePreview.src = ''; imagePreview.style.display = 'none'; }
      const title = document.getElementById('modal-service-title');
      const submitBtn = modal.querySelector('.modal__footer button[type="submit"]');
      if (title) title.textContent = 'Add Service';
      if (submitBtn) submitBtn.textContent = 'Add Service';
      form?.removeAttribute('data-editing-id');
      openModal(modal);
    });
  }

  // Close modal
  if (modal) {
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

  // Image file upload -> base64
  if (imageInput) {
    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 500 * 1024) {
        alert('Image must be under 500KB for localStorage storage.');
        imageInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (imagePreview) {
          imagePreview.src = reader.result;
          imagePreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const editingId = form.dataset.editingId;

      let image = data.get('s-image-url')?.trim() || '';
      // Use base64 from file upload if available
      if (imagePreview?.src && imagePreview.style.display !== 'none' && imagePreview.src.startsWith('data:')) {
        image = imagePreview.src;
      }

      const featuresRaw = data.get('s-features')?.trim() || '';
      const features = featuresRaw.split('\n').map(f => f.trim()).filter(Boolean);

      const fields = {
        title: data.get('s-title').trim(),
        category: data.get('s-category'),
        description: data.get('s-description').trim(),
        features,
        image
      };

      if (editingId) {
        updateItem('services', editingId, fields);
      } else {
        const service = {
          id: 's_' + Date.now(),
          ...fields
        };
        addItem('services', service);
      }

      form.reset();
      form.removeAttribute('data-editing-id');
      if (imagePreview) { imagePreview.src = ''; imagePreview.style.display = 'none'; }
      closeModal(modal);
      await renderTable();
    });
  }

  // Delegated actions
  document.getElementById('admin-services-tbody')?.addEventListener('click', async (e) => {
    // Delete
    const deleteBtn = e.target.closest('[data-delete-service]');
    if (deleteBtn) {
      if (confirm('Delete this service?')) {
        deleteItem('services', deleteBtn.dataset.deleteService);
        await renderTable();
      }
      return;
    }

    // Edit
    const editBtn = e.target.closest('[data-edit-service]');
    if (editBtn && modal && form) {
      const services = await getData('services');
      const all = [
        ...(services.commercial || []).map(s => ({ ...s, category: 'commercial' })),
        ...(services.residential || []).map(s => ({ ...s, category: 'residential' }))
      ];
      const s = all.find(item => item.id === editBtn.dataset.editService);
      if (!s) return;

      form.querySelector('#s-title').value = s.title || '';
      form.querySelector('#s-category').value = s.category || 'commercial';
      form.querySelector('#s-description').value = s.description || '';
      form.querySelector('#s-features').value = (s.features || []).join('\n');
      form.querySelector('#s-image-url').value = (s.image && !s.image.startsWith('data:')) ? s.image : '';

      if (imagePreview && s.image) {
        imagePreview.src = s.image;
        imagePreview.style.display = 'block';
      }

      form.dataset.editingId = s.id;
      const title = document.getElementById('modal-service-title');
      const submitBtn = modal.querySelector('.modal__footer button[type="submit"]');
      if (title) title.textContent = 'Edit Service';
      if (submitBtn) submitBtn.textContent = 'Save Changes';
      openModal(modal);
    }
  });

  // Export
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      const json = await exportData('services');
      downloadJSON('services.json', json);
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
