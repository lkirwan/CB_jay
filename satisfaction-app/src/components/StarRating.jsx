export default function StarRating({ value, onChange, size = 'md', readOnly = false }) {
  const sizes = { sm: '1.2rem', md: '2rem', lg: '2.8rem' };
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating" role="group" aria-label="Satisfaction rating">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${value >= star ? 'filled' : ''} ${readOnly ? 'read-only' : ''}`}
          style={{ fontSize: sizes[size] }}
          onClick={!readOnly ? () => onChange(star) : undefined}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value >= star}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
}
