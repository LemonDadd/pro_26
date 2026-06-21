import { create } from 'zustand';
import { Trip, Expense, User, Vehicle, SettlementItem, Activity, Participant, TripDayPlan } from '@/types';
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
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'inviteCode' | 'leaderId'> & { leaderId?: string }) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  updateCurrentUser: (updates: Partial<User>) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'> & { participants: string[] | Participant[] }) => void;
  updateExpense: (tripId: string, expenseId: string, updates: Partial<Expense>) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  getExpenseById: (expenseId: string) => Expense | undefined;

  addMember: (tripId: string, member: Omit<User, 'id' | 'role'> & { id?: string; role?: 'leader' | 'member' }) => void;
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

function buildParticipantsFromUserIds(
  amount: number,
  userIds: string[],
  members: User[]
): Participant[] {
  const perPerson = Number((amount / userIds.length).toFixed(2));
  return userIds.map((id) => {
    const user = members.find((m) => m.id === id);
    return {
      id,
      nickname: user?.nickname || '',
      avatar: user?.avatar || '',
      splitAmount: perPerson,
    };
  });
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
    const { currentUser } = get();
    const leaderId = trip.leaderId || currentUser.id;
    const leader = currentUser;
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      createdAt: Date.now(),
      leaderId,
      leader,
      members: [{ ...currentUser, role: 'leader' as const }],
      status: trip.status || 'active',
      inviteCode: generateId().slice(0, 6).toUpperCase(),
    } as Trip;
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
    const { trips, currentUser } = get();
    const trip = trips.find((t) => t.id === expense.tripId);
    const members = trip?.members || [];

    const participantList: Participant[] = Array.isArray(expense.participants) && expense.participants.length > 0 && typeof expense.participants[0] === 'string'
      ? buildParticipantsFromUserIds(expense.amount, expense.participants as string[], members)
      : (expense.participants as Participant[]);

    const payer = members.find((m) => m.id === expense.payerId);

    const newExpense: Expense = {
      ...expense,
      participants: participantList,
      payer,
      id: generateId(),
      createdAt: Date.now(),
      createdBy: expense.createdBy || currentUser.id,
    } as Expense;

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
      userId: expense.createdBy || currentUser.id,
      content: `记了一笔：${expense.description}`,
      amount: expense.amount,
    });
  },

  updateExpense: (tripId, expenseId, updates) => {
    const { trips } = get();
    const trip = trips.find((t) => t.id === tripId);
    const members = trip?.members || [];
    const expense = trip?.expenses?.find((e) => e.id === expenseId);

    let finalUpdates = { ...updates };
    if (updates.participants && Array.isArray(updates.participants) && updates.participants.length > 0 && typeof updates.participants[0] === 'string') {
      const amount = updates.amount || expense?.amount || 0;
      finalUpdates.participants = buildParticipantsFromUserIds(
        amount,
        updates.participants as unknown as string[],
        members
      ) as unknown as Participant[];
    }

    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              expenses: t.expenses?.map((e) =>
                e.id === expenseId ? { ...e, ...finalUpdates } : e
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
      amount: expense ? -expense.amount : undefined,
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
    const newMember: User = {
      ...member,
      id: member.id || generateId(),
      role: member.role || 'member',
    } as User;
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? { ...t, members: [...t.members, newMember] }
          : t
      ),
    }));

    get().addActivity({
      tripId,
      type: 'member_join',
      userId: newMember.id,
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
    const { trips } = get();
    const trip = trips.find((t) => t.id === tripId);
    const owner = trip?.members.find((m) => m.id === vehicle.ownerId);
    const newVehicle: Vehicle = {
      ...vehicle,
      id: generateId(),
      tripId,
      owner,
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
