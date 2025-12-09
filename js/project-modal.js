document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const closeBtn = modal ? modal.querySelector('.close') : null;
  const galleryImages = document.querySelectorAll('.gallery-img');

  if (!modal || !modalImg || !closeBtn || galleryImages.length === 0) {
    return;
  }

  const showModal = (src, alt) => {
    modal.style.display = 'block';
    modalImg.src = src;
    modalImg.alt = alt || '';
  };

  const hideModal = () => {
    modal.style.display = 'none';
    modalImg.removeAttribute('src');
    modalImg.removeAttribute('alt');
  };

  galleryImages.forEach((image) => {
    image.addEventListener('click', () => {
      showModal(image.src, image.alt);
    });
  });

  closeBtn.addEventListener('click', hideModal);

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideModal();
    }
  });
});
