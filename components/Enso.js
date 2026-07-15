export default function Enso({ size = 34 }) {
  return (
    <svg className="enso" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path className="petal petal-a" d="M50.0,80.0 C32.0,79.9 18.6,66.0 21.2,62.0 C23.7,58.0 42.1,63.8 50.0,80.0 Z" />
      <path className="petal petal-b" d="M50.0,80.0 C32.5,66.7 25.8,43.0 30.0,40.8 C34.3,38.6 49.5,58.0 50.0,80.0 Z" />
      <path className="petal petal-c" d="M50.0,80.0 C40.5,56.6 45.2,28.0 50.0,28.0 C54.8,28.0 59.5,56.6 50.0,80.0 Z" />
      <path className="petal petal-b" d="M50.0,80.0 C50.5,58.0 65.7,38.6 70.0,40.8 C74.2,43.0 67.5,66.7 50.0,80.0 Z" />
      <path className="petal petal-a" d="M50.0,80.0 C57.9,63.8 76.3,58.0 78.8,62.0 C81.4,66.0 68.0,79.9 50.0,80.0 Z" />
      <circle className="dot" cx="50" cy="79" r="4" />
    </svg>
  );
}
