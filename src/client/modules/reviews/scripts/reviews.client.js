const reviewForm = document.getElementById('reviewForm');
const reviewsList = document.getElementById('reviewsList');

const renderReviews = (reviews) => {
  if (!reviewsList) return;
  if (!reviews.length) {
    reviewsList.innerHTML = '<p class="text-muted">Aún no hay reseñas para este producto.</p>';
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="card mb-3">
      <div class="card-body">
        <h6 class="card-subtitle mb-2 text-muted">${review.primer_nombre} ${review.primer_apellido} - ${new Date(review.fechaResena).toLocaleDateString()}</h6>
        <p class="card-text">${review.comentario}</p>
        <p class="card-text"><strong>Calificación:</strong> ${review.calificacion} / 5</p>
      </div>
    </div>
  `).join('');
};

const loadReviews = async () => {
  const productId = document.getElementById('productId')?.value;
  if (!productId) return;

  const res = await fetch(`/api/reviews/${productId}`);
  const reviews = await res.json();
  renderReviews(Array.isArray(reviews) ? reviews : []);
};

if (reviewForm) {
  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const productId = document.getElementById('productId').value;
    const calificacion = document.getElementById('calificacion').value;
    const comentario = document.getElementById('comentario').value.trim();

    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, calificacion, comentario })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al publicar la reseña');
      }

      reviewForm.reset();
      loadReviews();
    } catch (error) {
      const errorDiv = document.getElementById('errorMsg');
      if (errorDiv) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
      }
    }
  });
}

loadReviews();
