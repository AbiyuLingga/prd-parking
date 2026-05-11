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

const initialState = {
  dataMode: "simulation",
  connectionStatus: "simulation",
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
    case "SET_DATA_MODE":
      return {
        ...state,
        dataMode: action.payload,
        connectionStatus: action.payload === "real" ? "connecting" : "simulation",
        dataError: null,
        parkedCarId: null,
        selectedLotId: null,
        viewMode: "map",
        parkingLots:
          action.payload === "simulation" ? generateParkingLots() : state.parkingLots,
      };

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

    case "PARK_CAR":
      if (state.dataMode === "real") {
        return state;
      }

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
      if (state.dataMode === "real") {
        return state;
      }

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

  const refreshRealData = useCallback(async () => {
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

    dispatch({
      type: "SET_CONNECTION_STATUS",
      payload: { status: "connecting" },
    });

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
    if (state.dataMode !== "real") {
      return undefined;
    }

    refreshRealData();

    const unsubscribe = subscribeToParkingChanges(
      refreshRealData,
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

    return () => {
      unsubscribe?.();
    };
  }, [refreshRealData, state.dataMode]);

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

    if (state.dataMode === "real") {
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

      return;
    }

    dispatch({ type: "PARK_CAR", payload: lot.id ?? lot });
  }, [refreshRealData, state.dataMode, state.parkedCarId]);

  const resetRealParking = useCallback(async () => {
    if (state.dataMode !== "real") {
      return;
    }

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
  }, [refreshRealData, state.dataMode]);

  const leaveParking = useCallback(async () => {
    if (state.dataMode === "real") {
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

      return;
    }

    dispatch({ type: "LEAVE_PARKING" });
  }, [refreshRealData, state.dataMode, state.parkedCarId, state.parkingLots]);

  const setViewMode = useCallback((mode) => {
    dispatch({ type: "SET_VIEW_MODE", payload: mode });
  }, []);

  const setFloor = useCallback((floor) => {
    dispatch({ type: "SET_FLOOR", payload: floor });
  }, []);

  const selectLot = useCallback((lotId) => {
    dispatch({ type: "SELECT_LOT", payload: lotId });
  }, []);

  const setDataMode = useCallback((mode) => {
    dispatch({ type: "SET_DATA_MODE", payload: mode });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      canManuallyPark: state.dataMode === "simulation",
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
      setDataMode,
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
      setDataMode,
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
