/**
 * EvaluationBar - Chess.com style evaluation bar
 * Shows position advantage as a vertical bar with colors
 * Positive score = Player A advantage (blue fills from bottom)
 * Negative score = Player B advantage (red fills from top)
 */

interface EvaluationBarProps {
  score: number;
  className?: string;
}

export function EvaluationBar({ score, className = '' }: EvaluationBarProps) {
  // Clamp score to reasonable range for display
  // Typical evaluation scores range from -200 to +200
  const maxScore = 200;
  const clampedScore = Math.max(-maxScore, Math.min(maxScore, score));
  
  // Convert score to percentage (0% = full Player B advantage, 100% = full Player A advantage)
  const percentage = ((clampedScore + maxScore) / (maxScore * 2)) * 100;
  
  // Format score for display
  const displayScore = Math.abs(score).toFixed(0);
  const isPlayerAAdvantage = score > 0;
  const isEqual = Math.abs(score) < 5; // Consider scores near 0 as equal

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Label */}
      <div className="text-xs font-medium text-gray-600">
        Evaluation
      </div>

      {/* Bar container */}
      <div className="relative w-8 h-64 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
        {/* Player B advantage (top, red) */}
        <div
          className="absolute top-0 left-0 right-0 bg-gradient-to-b from-red-500 to-red-400 transition-all duration-300 ease-out"
          style={{
            height: `${100 - percentage}%`,
          }}
        />

        {/* Player A advantage (bottom, blue) */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-300 ease-out"
          style={{
            height: `${percentage}%`,
          }}
        />

        {/* Center line (equality) */}
        <div className="absolute left-0 right-0 h-0.5 bg-white/80" style={{ top: '50%' }} />

        {/* Score indicator */}
        {!isEqual && (
          <div
            className="absolute left-0 right-0 flex items-center justify-center transition-all duration-300 ease-out"
            style={{
              top: isPlayerAAdvantage ? `${100 - percentage / 2}%` : `${(100 - percentage) / 2}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <div className={`
              px-1.5 py-0.5 rounded text-xs font-bold shadow-md
              ${isPlayerAAdvantage ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'}
            `}>
              {displayScore}
            </div>
          </div>
        )}
      </div>

      {/* Player labels */}
      <div className="flex flex-col items-center gap-1 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-400" />
          <span className="font-medium text-gray-700">Player B</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-400" />
          <span className="font-medium text-gray-700">Player A</span>
        </div>
      </div>

      {/* Status text */}
      <div className="text-xs text-center text-gray-600 font-medium">
        {isEqual ? (
          <span>Equal position</span>
        ) : isPlayerAAdvantage ? (
          <span className="text-blue-600">Player A ahead</span>
        ) : (
          <span className="text-red-600">Player B ahead</span>
        )}
      </div>
    </div>
  );
}
