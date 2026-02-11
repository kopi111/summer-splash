/**
 * Components – Fetch and inject header/footer HTML fragments
 */

export async function loadComponents() {
  const headerSlot = document.getElementById('header-slot');
  const footerSlot = document.getElementById('footer-slot');

  const loads = [];

  if (headerSlot) {
    loads.push(
      fetch('components/header.html')
        .then(r => r.text())
        .then(html => {
          headerSlot.innerHTML = html;
        })
    );
  }

  if (footerSlot) {
    loads.push(
      fetch('components/footer.html')
        .then(r => r.text())
        .then(html => {
          footerSlot.innerHTML = html;
        })
    );
  }

  await Promise.all(loads);
}
