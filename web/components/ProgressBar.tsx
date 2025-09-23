type ProgressBarProps = {
  value: number;
  label?: string;
};

const ProgressBar = ({ value, label }: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  const accessibleLabel = label ?? 'Progreso';

  return (
    <div
      className="w-full"
      aria-label={accessibleLabel}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${clamped}%`,
            backgroundImage: 'linear-gradient(90deg, #81A742, #4A90E2)' // mastersJourney gradient
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
