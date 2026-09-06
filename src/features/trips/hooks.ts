import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTrip, deleteTrip, updateTrip } from "@/features/trips/api";
import { seedChecklistPresets } from "@/lib/checklist-seed";
import { tripQueryOptions, tripsKeys, tripsQueryOptions } from "@/features/trips/queries";
import { randomUUID } from "@/lib/id";
import type { CreateTripInput, Trip, UpdateTripInput } from "@/mocks/fixtures/trips";

export function useTrips() {
  return useQuery(tripsQueryOptions());
}

export function useTrip(id: string) {
  return useQuery(tripQueryOptions(id));
}

/**
 * 추가/수정/삭제는 즉시 DB(지금은 MSW)에 반영되어야 한다는 요구사항의
 * 표준 패턴: onMutate에서 캐시를 먼저 바꾸고, 실패하면 스냅샷으로 롤백한다.
 * Phase 4에서 shared/lib/optimistic.ts로 일반화할 예정 (docs/08 T-406).
 */
export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onMutate: async (input: CreateTripInput) => {
      await queryClient.cancelQueries({ queryKey: tripsKeys.all });
      const previous = queryClient.getQueryData<Trip[]>(tripsKeys.all);

      const optimisticTrip: Trip = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<Trip[]>(tripsKeys.all, (old) => [optimisticTrip, ...(old ?? [])]);

      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tripsKeys.all, context.previous);
      }
    },
    onSuccess: async (trip) => {
      try {
        await seedChecklistPresets(trip.id);
      } catch {
        // 시드 실패해도 여행은 만들어진 상태
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}

export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateTripInput) => updateTrip(tripId, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: tripsKeys.all });
      await queryClient.cancelQueries({ queryKey: tripsKeys.detail(tripId) });
      const previousList = queryClient.getQueryData<Trip[]>(tripsKeys.all);
      const previousDetail = queryClient.getQueryData<Trip>(tripsKeys.detail(tripId));
      queryClient.setQueryData<Trip[]>(tripsKeys.all, (old) =>
        (old ?? []).map((t) => (t.id === tripId ? { ...t, ...patch } : t)),
      );
      if (previousDetail) {
        queryClient.setQueryData<Trip>(tripsKeys.detail(tripId), { ...previousDetail, ...patch });
      }
      return { previousList, previousDetail };
    },
    onError: (_err, _patch, context) => {
      if (context?.previousList) queryClient.setQueryData(tripsKeys.all, context.previousList);
      if (context?.previousDetail) {
        queryClient.setQueryData(tripsKeys.detail(tripId), context.previousDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
      queryClient.invalidateQueries({ queryKey: tripsKeys.detail(tripId) });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: tripsKeys.all });
      const previous = queryClient.getQueryData<Trip[]>(tripsKeys.all);
      queryClient.setQueryData<Trip[]>(tripsKeys.all, (old) =>
        (old ?? []).filter((t) => t.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tripsKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tripsKeys.all });
    },
  });
}
