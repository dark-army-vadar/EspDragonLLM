import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateDeviceRequest } from "@shared/routes";

export function useDevices() {
  return useQuery({
    queryKey: [api.devices.list.path],
    queryFn: async () => {
      const res = await fetch(api.devices.list.path);
      if (!res.ok) throw new Error("Failed to fetch devices");
      return api.devices.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll every 5s for live status
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: [api.devices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.devices.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch device");
      return api.devices.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDeviceRequest) => {
      const res = await fetch(api.devices.create.path, {
        method: api.devices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.devices.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create device");
      }
      return api.devices.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.devices.list.path] }),
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.devices.delete.path, { id });
      const res = await fetch(url, { method: api.devices.delete.method });
      if (!res.ok) throw new Error("Failed to delete device");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.devices.list.path] }),
  });
}

export function useDeviceMetrics(id: number) {
  return useQuery({
    queryKey: [api.devices.metrics.path, id],
    queryFn: async () => {
      const url = buildUrl(api.devices.metrics.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return api.devices.metrics.responses[200].parse(await res.json());
    },
    enabled: !!id,
    refetchInterval: 2000, // Frequent updates for charts
  });
}
