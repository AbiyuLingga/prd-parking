const floorRows = ["A", "B"];

function densityFor(floor, rowIndex, columnIndex) {
  return ((floor * 3 + rowIndex * 4 + columnIndex * 2) % 10) + 1;
}

function distanceFromRightLobby(floor, rowLabel, columnIndex) {
  const sameSideDistance = 5 + columnIndex * 7;
  const crossingPenalty = rowLabel === "A" ? 22 : 0;
  const floorPenalty = floor === 2 ? 14 : 0;

  return sameSideDistance + crossingPenalty + floorPenalty;
}

function randomOccupiedIds(lots) {
  const minOccupied = Math.floor(lots.length * 0.2);
  const maxOccupied = Math.floor(lots.length * 0.75);
  const occupiedCount =
    minOccupied + Math.floor(Math.random() * (maxOccupied - minOccupied + 1));
  const shuffledIds = lots
    .map((lot) => lot.id)
    .sort(() => Math.random() - 0.5);

  return new Set(shuffledIds.slice(0, occupiedCount));
}

export function generateParkingLots() {
  const lots = [1, 2].flatMap((floor) =>
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
          isOccupied: false,
        };
      }),
    ),
  );

  const occupiedIds = randomOccupiedIds(lots);

  return lots.map((lot) => ({
    ...lot,
    isOccupied: occupiedIds.has(lot.id),
  }));
}
