import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getCourts,
  createCourt,
  updateCourt,
  deleteCourt,
  CreateCourtPayload,
  UpdateCourtPayload,
} from "@/lib/api/courts";

// ============================================================
// GET COURTS
// ============================================================

export function useCourts() {
  return useQuery({
    queryKey: ["courts"],
    queryFn: getCourts,
  });
}

// ============================================================
// CREATE COURT
// ============================================================

export function useCreateCourt() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: CreateCourtPayload
    ) =>
      createCourt(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courts"],
      });
    },
  });
}

// ============================================================
// UPDATE COURT
// ============================================================

export function useUpdateCourt() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCourtPayload;
    }) =>
      updateCourt(
        id,
        payload
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courts"],
      });
    },
  });
}

// ============================================================
// DELETE COURT
// ============================================================

export function useDeleteCourt() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: number
    ) =>
      deleteCourt(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courts"],
      });
    },
  });
}