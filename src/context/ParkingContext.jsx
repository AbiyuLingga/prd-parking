import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { generateParkingLots } from "../data/parkingData";
import {
  fetchRealParkingLots,
  isSupabaseConfigured,
  randomizeRealParkingSlots,
  subscribeToParkingChanges,
  updateRealParkingSlot,
} from "../services/supabaseParking";
import { getRecommendations } from "../utils/algorithm";

const ParkingContext = createContext(null);
const AUTO_REFRESH_INTERVAL_MS = 5000;

const initialState = {
  dataMode: "real",
  connectionStatus: "connecting",
  dataError: null,
  lastUpdatedAt: null,
  parkingLots: generateParkingLots(),
  parkedCarId: null,
  viewMode: "map",
  selectedFloor: 1,
  selectedLotId: null,
};

function parkingReducer(state, action) {
  switch (action.type) {
    case "SET_CONNECTION_STATUS":
      return {
        ...state,
        connectionStatus: action.payload.status,
        dataError: action.payload.error ?? null,
      };

    case "SET_REAL_LOTS":
      return {
        ...state,
        parkingLots: action.payload,
        connectionStatus: "live",
        dataError: null,
        lastUpdatedAt: new Date().toISOString(),
      };

    case "SET_PARKED_CAR":
      return {
        ...state,
        parkedCarId: action.payload,
        selectedLotId: action.payload,
        selectedFloor:
          state.parkingLots.find((lot) => lot.id === action.payload)?.floor ??
          state.selectedFloor,
        viewMode: "map",
      };

    case "CLEAR_PARKED_CAR":
      return {
        ...state,
        parkedCarId: null,
        selectedLotId: null,
        viewMode: "map",
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

  const refreshRealData = useCallback(async ({ silent = false } = {}) => {
    if (!isSupabaseConfigured()) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: {
          status: "offline",
          error: "Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dulu.",
        },
      });
      return;
    }

    if (!silent) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: { status: "connecting" },
      });
    }

    try {
      const lots = await fetchRealParkingLots();
      dispatch({ type: "SET_REAL_LOTS", payload: lots });
    } catch (error) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: {
          status: "offline",
          error: error.message ?? "Gagal membaca Supabase.",
        },
      });
    }
  }, []);

  useEffect(() => {
    refreshRealData();

    const unsubscribe = subscribeToParkingChanges(
      () => refreshRealData({ silent: true }),
      (error) => {
        dispatch({
          type: "SET_CONNECTION_STATUS",
          payload: {
            status: "offline",
            error: error.message,
          },
        });
      },
    );
    const refreshInterval = window.setInterval(() => {
      refreshRealData({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(refreshInterval);
      unsubscribe?.();
    };
  }, [refreshRealData]);

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

  const parkCar = useCallback(async (lot) => {
    if (state.parkedCarId) {
      return;
    }

    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { status: "connecting" },
    });

    try {
      const lotId = lot.id ?? lot;
      await updateRealParkingSlot(lot, true);
      await refreshRealData();
      dispatch({ type: "SET_PARKED_CAR", payload: lotId });
    } catch (error) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: {
          status: "offline",
          error: error.message ?? "Gagal update Supabase.",
        },
      });
    }
  }, [refreshRealData, state.parkedCarId]);

  const resetRealParking = useCallback(async () => {
    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { status: "connecting" },
    });

    try {
      await randomizeRealParkingSlots();
      await refreshRealData();
      dispatch({ type: "CLEAR_PARKED_CAR" });
    } catch (error) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: {
          status: "offline",
          error: error.message ?? "Gagal reset data Supabase.",
        },
      });
    }
  }, [refreshRealData]);

  const leaveParking = useCallback(async () => {
    const lot = state.parkingLots.find((item) => item.id === state.parkedCarId);

    if (!lot) {
      dispatch({ type: "CLEAR_PARKED_CAR" });
      return;
    }

    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { status: "connecting" },
    });

    try {
      await updateRealParkingSlot(lot, false);
      await refreshRealData();
      dispatch({ type: "CLEAR_PARKED_CAR" });
    } catch (error) {
      dispatch({
        type: "SET_CONNECTION_STATUS",
        payload: {
          status: "offline",
          error: error.message ?? "Gagal keluar parkir di Supabase.",
        },
      });
    }
  }, [refreshRealData, state.parkedCarId, state.parkingLots]);

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
      canManuallyPark: false,
      recommendations,
      stats,
      selectedLot,
      parkedLot,
      parkCar,
      leaveParking,
      refreshRealData,
      resetRealParking,
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
      refreshRealData,
      resetRealParking,
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
