import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { generateParkingLots } from "../data/parkingData";
import { getRecommendations } from "../utils/algorithm";

const ParkingContext = createContext(null);

const initialState = {
  parkingLots: generateParkingLots(),
  parkedCarId: null,
  viewMode: "map",
  selectedFloor: 1,
  selectedLotId: null,
};

function parkingReducer(state, action) {
  switch (action.type) {
    case "PARK_CAR":
      return {
        ...state,
        parkedCarId: action.payload,
        selectedLotId: action.payload,
        viewMode: "map",
        parkingLots: state.parkingLots.map((lot) =>
          lot.id === action.payload ? { ...lot, isOccupied: true } : lot,
        ),
      };

    case "LEAVE_PARKING":
      return {
        ...state,
        viewMode: "map",
        selectedLotId: null,
        parkingLots: state.parkingLots.map((lot) =>
          lot.id === state.parkedCarId ? { ...lot, isOccupied: false } : lot,
        ),
        parkedCarId: null,
      };

    case "SET_VIEW_MODE":
      return {
        ...state,
        viewMode: action.payload,
      };

    case "SET_FLOOR":
      return {
        ...state,
        selectedFloor: action.payload,
      };

    case "SELECT_LOT":
      return {
        ...state,
        selectedLotId: action.payload,
        selectedFloor:
          state.parkingLots.find((lot) => lot.id === action.payload)?.floor ??
          state.selectedFloor,
      };

    default:
      return state;
  }
}

export function ParkingProvider({ children }) {
  const [state, dispatch] = useReducer(parkingReducer, initialState);

  const recommendations = useMemo(
    () => (state.parkedCarId ? [] : getRecommendations(state.parkingLots)),
    [state.parkedCarId, state.parkingLots],
  );

  const stats = useMemo(() => {
    const total = state.parkingLots.length;
    const occupied = state.parkingLots.filter((lot) => lot.isOccupied).length;
    const available = total - occupied;

    return {
      total,
      occupied,
      available,
      occupiedPercentage: Math.round((occupied / total) * 100),
    };
  }, [state.parkingLots]);

  const selectedLot = useMemo(
    () => state.parkingLots.find((lot) => lot.id === state.selectedLotId) ?? null,
    [state.parkingLots, state.selectedLotId],
  );

  const parkedLot = useMemo(
    () => state.parkingLots.find((lot) => lot.id === state.parkedCarId) ?? null,
    [state.parkingLots, state.parkedCarId],
  );

  const parkCar = useCallback((lotId) => {
    dispatch({ type: "PARK_CAR", payload: lotId });
  }, []);

  const leaveParking = useCallback(() => {
    dispatch({ type: "LEAVE_PARKING" });
  }, []);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const setFloor = useCallback((floor) => {
    dispatch({ type: "SET_FLOOR", payload: floor });
  }, []);

  const selectLot = useCallback((lotId) => {
    dispatch({ type: "SELECT_LOT", payload: lotId });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      recommendations,
      stats,
      selectedLot,
      parkedLot,
      parkCar,
      leaveParking,
      setViewMode,
      setFloor,
      selectLot,
    }),
    [
      state,
      recommendations,
      stats,
      selectedLot,
      parkedLot,
      parkCar,
      leaveParking,
      setViewMode,
      setFloor,
      selectLot,
    ],
  );

  return (
    <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);

  if (!context) {
    throw new Error("useParking must be used within ParkingProvider");
  }

  return context;
}
