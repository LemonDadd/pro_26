import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  Trip,
  Expense,
  User,
  Vehicle,
  Activity,
  SettlementPlan,
} from '@/types';
import * as authService from '@/services/auth';
import * as tripService from '@/services/trip';
import * as expenseService from '@/services/expense';
import * as memberService from '@/services/member';
import * as vehicleService from '@/services/vehicle';
import * as settlementService from '@/services/settlement';
import * as activityService from '@/services/activity';
import { getToken, clearAuth } from '@/services/request';

const DEV_LOGIN_CODE = 'dev_mock_code_001';

const EMPTY_USER: User = {
  id: '',
  nickname: '',
  avatar: '',
  role: 'member',
};

interface TripStore {
  trips: Trip[];
  currentTripId: string | null;
  currentUser: User;
  settledItems: Record<string, boolean>;
  activities: Activity[];
  loading: boolean;
  initialized: boolean;

  initApp: () => Promise<void>;
  logout: () => void;

  setCurrentTrip: (tripId: string) => void;
  getCurrentTrip: () => Trip | undefined;

  fetchTrips: (status?: 'active' | 'completed') => Promise<Trip[]>;
  fetchTripDetail: (tripId: string) => Promise<Trip | undefined>;

  addTrip: (params: tripService.CreateTripParams) => Promise<Trip>;
  updateTrip: (tripId: string, updates: tripService.UpdateTripParams) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  completeTrip: (tripId: string) => Promise<void>;

  fetchExpenses: (tripId: string) => Promise<void>;
  addExpense: (
    tripId: string,
    params: expenseService.CreateExpenseParams
  ) => Promise<Expense>;
  updateExpense: (
    tripId: string,
    expenseId: string,
    updates: expenseService.UpdateExpenseParams
  ) => Promise<void>;
  deleteExpense: (tripId: string, expenseId: string) => Promise<void>;
  getExpenseById: (expenseId: string) => Expense | undefined;

  fetchMembers: (tripId: string) => Promise<void>;
  addMember: (tripId: string, params: memberService.AddMemberParams) => Promise<void>;
  removeMember: (tripId: string, userId: string) => Promise<void>;
  generateInviteCode: (
    tripId: string
  ) => Promise<{ inviteCode: string; qrCodeUrl: string; expireAt: number }>;
  joinByCode: (inviteCode: string) => Promise<void>;

  fetchVehicles: (tripId: string) => Promise<void>;
  addVehicle: (tripId: string, params: vehicleService.CreateVehicleParams) => Promise<Vehicle>;
  updateVehicle: (
    tripId: string,
    vehicleId: string,
    updates: vehicleService.UpdateVehicleParams
  ) => Promise<void>;
  deleteVehicle: (tripId: string, vehicleId: string) => Promise<void>;

  fetchSettlement: (tripId: string) => Promise<SettlementPlan>;
  markSettled: (settlementId: string, localKey: string) => Promise<void>;
  toggleSettled: (key: string) => void;
  isItemSettled: (key: string) => boolean;

  fetchActivities: (tripId: string) => Promise<void>;
  getActivitiesByTrip: (tripId: string) => Activity[];

  updateCurrentUser: (updates: authService.UpdateProfileParams) => Promise<void>;
}

function upsertTrip(list: Trip[], trip: Trip): Trip[] {
  const exists = list.some((t) => t.id === trip.id);
  return exists ? list.map((t) => (t.id === trip.id ? trip : t)) : [trip, ...list];
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  currentTripId: null,
  currentUser: EMPTY_USER,
  settledItems: {},
  activities: [],
  loading: false,
  initialized: false,

  initApp: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const token = getToken();
      let user: User;
      if (token) {
        user = (await authService.getCurrentUser()) as User;
      } else {
        const result = await authService.wxLogin({ code: DEV_LOGIN_CODE });
        user = { ...result.user } as User;
      }
      set({ currentUser: { ...EMPTY_USER, ...user } });
      await get().fetchTrips();
    } catch (err) {
      clearAuth();
      Taro.showToast({ title: '初始化失败,请重试', icon: 'none' });
    } finally {
      set({ loading: false, initialized: true });
    }
  },

  logout: () => {
    clearAuth();
    set({
      currentUser: EMPTY_USER,
      trips: [],
      currentTripId: null,
      activities: [],
      settledItems: {},
      initialized: false,
    });
  },

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  getCurrentTrip: () => {
    const { trips, currentTripId } = get();
    return trips.find((t) => t.id === currentTripId);
  },

  fetchTrips: async (status) => {
    const page = await tripService.listTrips({ status, pageSize: 50 });
    set((state) => ({
      trips: page.list,
      currentTripId: state.currentTripId || page.list[0]?.id || null,
    }));
    return page.list;
  },

  fetchTripDetail: async (tripId) => {
    set({ currentTripId: tripId, loading: true });
    try {
      const trip = await tripService.getTripDetail(tripId);
      const [expensesPage, vehiclesPage, activitiesPage] = await Promise.all([
        expenseService.listExpenses({ tripId, pageSize: 100 }),
        vehicleService.listVehicles(tripId),
        activityService.listActivities({ tripId, pageSize: 100 }),
      ]);
      const fullTrip: Trip = {
        ...trip,
        expenses: expensesPage.list,
        vehicles: vehiclesPage.list,
      };
      set((state) => ({
        trips: upsertTrip(state.trips, fullTrip),
        activities: activitiesPage.list,
      }));
      return fullTrip;
    } finally {
      set({ loading: false });
    }
  },

  addTrip: async (params) => {
    const trip = await tripService.createTrip(params);
    set((state) => ({
      trips: [trip, ...state.trips],
      currentTripId: trip.id,
    }));
    return trip;
  },

  updateTrip: async (tripId, updates) => {
    const trip = await tripService.updateTrip(tripId, updates);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },

  deleteTrip: async (tripId) => {
    await tripService.deleteTrip(tripId);
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== tripId),
      currentTripId:
        state.currentTripId === tripId ? state.trips[0]?.id || null : state.currentTripId,
    }));
  },

  completeTrip: async (tripId) => {
    const trip = await tripService.completeTrip(tripId);
    set((state) => ({ trips: upsertTrip(state.trips, trip) }));
  },

  fetchExpenses: async (tripId) => {
    const page = await expenseService.listExpenses({ tripId, pageSize: 100 });
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, expenses: page.list } : t
      ),
    }));
  },

  addExpense: async (tripId, params) => {
    const expense = await expenseService.createExpense(tripId, params);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, expenses: [expense, ...(t.expenses || [])] }
          : t
      ),
    }));
    return expense;
  },

  updateExpense: async (tripId, expenseId, updates) => {
    const expense = await expenseService.updateExpense(expenseId, updates);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              expenses: t.expenses?.map((e) => (e.id === expenseId ? expense : e)),
            }
          : t
      ),
    }));
  },

  deleteExpense: async (tripId, expenseId) => {
    await expenseService.deleteExpense(expenseId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, expenses: t.expenses?.filter((e) => e.id !== expenseId) }
          : t
      ),
    }));
  },

  getExpenseById: (expenseId) => {
    const { trips } = get();
    for (const trip of trips) {
      const expense = trip.expenses?.find((e) => e.id === expenseId);
      if (expense) return expense;
    }
    return undefined;
  },

  fetchMembers: async (tripId) => {
    const page = await memberService.listMembers(tripId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, members: page.list } : t
      ),
    }));
  },

  addMember: async (tripId, params) => {
    const member = await memberService.addMember(tripId, params);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, members: [...t.members, member] } : t
      ),
    }));
  },

  removeMember: async (tripId, userId) => {
    await memberService.removeMember(tripId, userId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, members: t.members.filter((m) => m.id !== userId) }
          : t
      ),
    }));
  },

  generateInviteCode: async (tripId) => {
    const res = await memberService.generateInviteCode(tripId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, inviteCode: res.inviteCode } : t
      ),
    }));
    return res;
  },

  joinByCode: async (inviteCode) => {
    await memberService.joinByCode(inviteCode);
    await get().fetchTrips();
  },

  fetchVehicles: async (tripId) => {
    const page = await vehicleService.listVehicles(tripId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, vehicles: page.list } : t
      ),
    }));
  },

  addVehicle: async (tripId, params) => {
    const vehicle = await vehicleService.createVehicle(tripId, params);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, vehicles: [...(t.vehicles || []), vehicle] } : t
      ),
    }));
    return vehicle;
  },

  updateVehicle: async (tripId, vehicleId, updates) => {
    const vehicle = await vehicleService.updateVehicle(vehicleId, updates);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              vehicles: t.vehicles?.map((v) => (v.id === vehicleId ? vehicle : v)),
            }
          : t
      ),
    }));
  },

  deleteVehicle: async (tripId, vehicleId) => {
    await vehicleService.deleteVehicle(vehicleId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, vehicles: t.vehicles?.filter((v) => v.id !== vehicleId) }
          : t
      ),
    }));
  },

  fetchSettlement: async (tripId) => {
    return settlementService.getSettlementPlan(tripId);
  },

  markSettled: async (settlementId, localKey) => {
    await settlementService.markSettled(settlementId);
    set((state) => ({
      settledItems: { ...state.settledItems, [localKey]: true },
    }));
  },

  toggleSettled: (key) => {
    set((state) => {
      const next = { ...state.settledItems };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = true;
      }
      return { settledItems: next };
    });
  },

  isItemSettled: (key) => {
    return get().settledItems[key] || false;
  },

  fetchActivities: async (tripId) => {
    const page = await activityService.listActivities({ tripId, pageSize: 100 });
    set({ activities: page.list });
  },

  getActivitiesByTrip: (tripId) => {
    return get().activities.filter((a) => a.tripId === tripId);
  },

  updateCurrentUser: async (updates) => {
    const user = await authService.updateProfile(updates);
    set((state) => ({
      currentUser: { ...state.currentUser, ...user },
    }));
  },
}));
