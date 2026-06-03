export default function Logo({ size = 24, className = '' }) {
  return (
    <svg
      width={size * 3.5}
      height={size}
      viewBox="0 0 84 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Onoma"
    >
      <path
        d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12Zm12-8a8 8 0 1 0 0 16A8 8 0 0 0 12 4Zm14 0h4l4 5.5L38 4h4v16h-4V11l-4 5h-.08l-3.92-5v9h-4V4Zm16 0h4l6 16h-4.2l-1.1-3H41.3l-1.1 3H36L42 4Zm3.5 9.5-1.5-4-1.5 4h3Zm8.5-9.5h3.8l7.2 9.5V4H64v16h-3.8L53 10.5V20h-3V4Zm14 0h4l4 5.5 4-5.5h4v16h-4V11l-4 5h-.08L77.92 11V20H74V4Z"
        fill="currentColor"
      />
    </svg>
  )
}
