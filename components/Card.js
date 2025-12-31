export default function Card({ title, content, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition ${className}`}>
      {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
      <div>{content}</div>
    </div>
  );
}