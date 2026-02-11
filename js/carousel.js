/**
 * Carousel – Homepage testimonials carousel
 */

import { getData } from './data-service.js';

export async function initCarousel() {
  const container = document.getElementById('testimonial-carousel');
  if (!container) return;

  const testimonials = await getData('testimonials');
  if (testimonials.length === 0) return;

  renderCarousel(container, testimonials);
}

function renderCarousel(container, testimonials) {
  const track = container.querySelector('.carousel__track');
  const dotsContainer = container.querySelector('.carousel__dots');
  const prevBtn = container.querySelector('.carousel__btn--prev');
  const nextBtn = container.querySelector('.carousel__btn--next');

  if (!track) return;

  // Render slides
  track.innerHTML = testimonials.map(t => `
    <div class="carousel__slide">
      <div class="carousel__card">
        <div class="stars" aria-label="${t.rating} out of 5 stars">
          ${'&#9733;'.repeat(t.rating)}${'&#9734;'.repeat(5 - t.rating)}
        </div>
        <p class="carousel__quote">"${escapeHtml(t.text)}"</p>
        <div class="carousel__author">
          <img class="carousel__avatar" src="${escapeHtml(t.photo)}" alt="${escapeHtml(t.name)}" width="48" height="48" loading="lazy">
          <div>
            <div class="carousel__name">${escapeHtml(t.name)}</div>
            <div class="carousel__role">${escapeHtml(t.role)}, ${escapeHtml(t.location)}</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = testimonials.map((_, i) => `
      <button class="carousel__dot${i === 0 ? ' is-active' : ''}"
              aria-label="Go to testimonial ${i + 1}"
              data-index="${i}"></button>
    `).join('');
  }

  let current = 0;
  const total = testimonials.length;

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel__dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
      });
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.carousel__dot');
      if (dot) goTo(Number(dot.dataset.index));
    });
  }

  // Auto-advance every 6 seconds
  let timer = setInterval(() => goTo(current + 1), 6000);

  container.addEventListener('mouseenter', () => clearInterval(timer));
  container.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo(current + 1), 6000);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
