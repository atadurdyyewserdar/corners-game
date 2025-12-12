/**
 * Winner banner component - displays game winner
 */

import React from 'react';
import type { PlayerType } from '../domain/models/Player';
import { COMPUTED } from '../constants/dimensions';
import { COLORS, SHADOWS } from '../constants/theme';

interface WinnerBannerProps {
  winner: PlayerType;
}

const WinnerBanner: React.FC<WinnerBannerProps> = ({ winner }) => {
  const winnerColor = COLORS.player[winner].primary;
  const textShadow = SHADOWS.winner[winner];

  return (
    <div
      className="mt-7 px-8 py-4 bg-gradient-to-br from-[#f7e0ac] to-[#a46d41] border border-[#d7ad81] rounded shadow text-2xl font-black text-[#7e511d] tracking-wide uppercase flex flex-col items-center"
      style={{ width: COMPUTED.wrapperWidth }}
    >
      <div>
        Winner:{' '}
        <span
          className="ml-2"
          style={{
            color: winnerColor,
            textShadow: textShadow,
          }}
        >
          Player {winner}
        </span>
      </div>
      <div className="mt-2 text-base tracking-wider font-medium text-[#9f6d35]">
        (Tap Restart to play again or roll back with history)
      </div>
    </div>
  );
};

export default WinnerBanner;
