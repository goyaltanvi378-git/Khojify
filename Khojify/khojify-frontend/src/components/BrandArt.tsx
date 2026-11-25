// Brand mark illustration: magnifier + location pin (used on auth and reunited pages)
export default function BrandArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Magnifier and location pin">
      <rect width="400" height="300" rx="28" fill="#35251D" />
      <g stroke="#79543B" strokeWidth="1" opacity=".5">{[60, 120, 180, 240].map((y) => <path key={y} d={`M0 ${y}H400`} />)}{[80, 160, 240, 320].map((x) => <path key={x} d={`M${x} 0V300`} />)}</g>
      <circle cx="170" cy="130" r="62" fill="#E5D2B8" /><circle cx="170" cy="130" r="62" fill="none" stroke="#B58A62" strokeWidth="14" />
      <path d="M215 176l62 62" stroke="#B58A62" strokeWidth="18" strokeLinecap="round" />
      <path d="M170 168s-30-26-30-50a30 30 0 0 1 60 0c0 24-30 50-30 50z" fill="#C47B59" /><circle cx="170" cy="118" r="11" fill="#FFFCF7" />
      <path d="M60 250c60-30 120 10 180-20" stroke="#B58A62" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round" fill="none" />
    </svg>
  )
}
