export default function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-700 rounded-xl p-5 ${
        hover ? 'hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
