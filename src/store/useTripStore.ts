import { create } from 'zustand';
import { Trip, Expense, User, Vehicle, SettlementItem, Activity } from '@/types';
import { generateId } from '@/utils/format';
import { mockTrips, mockCurrentUser } from '@/data/mockTrips';

interface TripStore {
  trips: Trip[];
  currentTripId: string | null;
  currentUser: User;
  settledItems: Record<string, boolean>;
  activities: Activity[];

  setCurrentTrip: (tripId: string) => void;
  getCurrentTrip: () => Trip | undefined;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  updateCurrentUser: (updates: Partial<User>) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (tripId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  getExpenseById: (expenseId: string) => Expense | undefined;

  addMember: (tripId: string, member: User) => void;
  removeMember: (tripId: string, userId: string) => void;

  addVehicle: (tripId: string, vehicle: Omit<Vehicle, 'id' | 'tripId'>) => void;
  updateVehicle: (tripId: string, vehicleId: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (tripId: string, vehicleId: string) => void;

  markSettled: (fromUserId: string, toUserId: string, amount: number) => void;
  isSettled: (fromUserId: string, toUserId: string, amount: number) => boolean;
  toggleSettled: (key: string) => void;
  isItemSettled: (key: string) => boolean;

  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getActivitiesByTrip: (tripId: string) => Activity[];
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: mockTrips,
  currentTripId: mockTrips[0]?.id || null,
  currentUser: mockCurrentUser,
  settledItems: {},
  activities: [],

  setCurrentTrip: (tripId) => set({ currentTripId: tripId }),

  getCurrentTrip: () => {
    const { trips, currentTripId } = get();
    return trips.find((t) => t.id === currentTripId);
  },

  addTrip: (trip) => {
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({
      trips: [newTrip, ...state.trips],
      currentTripId: newTrip.id,
    }));
  },

  updateTrip: (tripId, updates) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId ? { ...t, ...updates } : t
      ),
    }));
  },

  addExpense: (expense) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === expense.tripId
          ? { ...t, expenses: [newExpense, ...(t.expenses || [])] }
          : t
      ),
    }));

    get().addActivity({
      tripId: expense.tripId,
      type: 'expense',
      userId: expense.createdBy,
      content: `记了一笔：${expense.description}`,
      amount: expense.amount,
    });
  },

  updateExpense: (tripId, expenseId, updates) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              expenses: t.expenses?.map((e) =>
                e.id === expenseId ? { ...e, ...updates } : e
              ),
            }
          : t
      ),
    }));

    get().addActivity({
      tripId,
      type: 'expense',
      userId: get().currentUser.id,
      content: `修改了费用：${updates.description || ''}`,
      amount: updates.amount,
    });
  },

  deleteExpense: (tripId, expenseId) => {
    const expense = get().getExpenseById(expenseId);
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, expenses: t.expenses?.filter((e) => e.id !== expenseId) }
          : t
      ),
    }));

    get().addActivity({
      tripId,
      type: 'expense',
      userId: get().currentUser.id,
      content: `删除了费用：${expense?.description || ''}`,
      amount: -expense?.amount,
    });
  },

  getExpenseById: (expenseId) => {
    const { trips } = get();
    for (const trip of trips) {
      const expense = trip.expenses?.find((e) => e.id === expenseId);
      if (expense) return expense;
    }
    return undefined;
  },

  addMember: (tripId, member) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, members: [...t.members, member] }
          : t
      ),
    }));

    get().addActivity({
      tripId,
      type: 'member_join',
      userId: member.id,
      content: '加入了行程',
    });
  },

  removeMember: (tripId, userId) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, members: t.members.filter((m) => m.id !== userId) }
          : t
      ),
    }));
  },

  addVehicle: (tripId, vehicle) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateId(),
      tripId,
    };
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, vehicles: [...(t.vehicles || []), newVehicle] }
          : t
      ),
    }));
  },

  updateVehicle: (tripId, vehicleId, updates) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              vehicles: t.vehicles?.map((v) =>
                v.id === vehicleId ? { ...v, ...updates } : v
              ),
            }
          : t
      ),
    }));
  },

  deleteVehicle: (tripId, vehicleId) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, vehicles: t.vehicles?.filter((v) => v.id !== vehicleId) }
          : t
      ),
    }));
  },

  markSettled: (fromUserId, toUserId, amount) => {
    const key = `${fromUserId}-${toUserId}-${amount}`;
    set((state) => ({
      settledItems: { ...state.settledItems, [key]: true },
    }));
  },

  isSettled: (fromUserId, toUserId, amount) => {
    const key = `${fromUserId}-${toUserId}-${amount}`;
    return get().settledItems[key] || false;
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

  addActivity: (activity) => {
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({
      activities: [newActivity, ...state.activities],
    }));
  },

  getActivitiesByTrip: (tripId) => {
    return get().activities.filter((a) => a.tripId === tripId);
  },

  updateCurrentUser: (updates) => {
    set((state) => ({
      currentUser: { ...state.currentUser, ...updates },
    }));
  },
}));
