const BOARD_SIZE = 8 // or 6 (choose, can edit later)

const GameBoard = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-8 gap-1 border border-gray-400 bg-white rounded-md shadow-md">
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, idx) => (
          <div
            key={idx}
            className="w-8 h-8 bg-green-200 border border-gray-300 flex items-center justify-center"
          >
            {/* cell content comes later */}
          </div>
        ))}
      </div>
      <p className="mt-2 text-sm text-gray-500">Board size: {BOARD_SIZE}×{BOARD_SIZE}</p>
    </div>
  )
}

export default GameBoard