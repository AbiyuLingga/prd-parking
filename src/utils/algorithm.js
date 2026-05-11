const WEIGHTS = {
  distance: 0.5,
  floorPenalty: 15,
  density: 2,
};

export function calculateScore(lot) {
  const floorPenalty = lot.floor === 2 ? 1 : 0;

  return (
    WEIGHTS.distance * lot.jarakLobby +
    WEIGHTS.floorPenalty * floorPenalty +
    WEIGHTS.density * lot.kepadatanPrediksi
  );
}

export function getRecommendations(parkingLots) {
  return parkingLots
    .filter((lot) => !lot.isOccupied)
    .map((lot) => ({
      ...lot,
      costScore: Number(calculateScore(lot).toFixed(1)),
    }))
    .sort((first, second) => {
      if (first.costScore !== second.costScore) {
        return first.costScore - second.costScore;
      }

      return first.jarakLobby - second.jarakLobby;
    })
    .slice(0, 3);
}
