const floorRows = ["A", "B"];

function densityFor(floor, rowIndex, columnIndex) {
  return ((floor * 3 + rowIndex * 4 + columnIndex * 2) % 10) + 1;
}

function occupiedFor(floor, rowIndex, columnIndex) {
  const value = floor * 11 + rowIndex * 7 + columnIndex * 5;
  return value % 5 === 0 || value % 7 === 0;
}

function distanceFromRightLobby(floor, rowLabel, columnIndex) {
  const sameSideDistance = 5 + columnIndex * 7;
  const crossingPenalty = rowLabel === "A" ? 22 : 0;
  const floorPenalty = floor === 2 ? 14 : 0;

  return sameSideDistance + crossingPenalty + floorPenalty;
}

export function generateParkingLots() {
  return [1, 2].flatMap((floor) =>
    floorRows.flatMap((rowLabel, rowIndex) =>
      Array.from({ length: 6 }, (_, columnIndex) => {
        const column = columnIndex + 1;

        return {
          id: `L${floor}-${rowLabel}${column}`,
          floor,
          row: rowLabel,
          column,
          rowIndex,
          columnIndex,
          jarakLobby: distanceFromRightLobby(floor, rowLabel, columnIndex),
          kepadatanPrediksi: densityFor(floor, rowIndex, columnIndex),
          isOccupied: occupiedFor(floor, rowIndex, columnIndex),
        };
      }),
    ),
  );
}
