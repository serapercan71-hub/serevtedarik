// Yıldız puanı gösterimi (0-5 arası, yarım yıldız desteği).
export default function Stars({ value = 0 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (value >= i) stars.push('full');
    else if (value >= i - 0.5) stars.push('half');
    else stars.push('empty');
  }
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {stars.map((type, i) => (
        <span key={i} className={`star star-${type}`}>
          ★
        </span>
      ))}
    </span>
  );
}
