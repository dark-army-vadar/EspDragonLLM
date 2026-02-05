import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertAgent } from "@shared/schema";

// GET /api/agents
export function useAgents() {
  return useQuery({
    queryKey: [api.agents.list.path],
    queryFn: async () => {
      const res = await fetch(api.agents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return api.agents.list.responses[200].parse(await res.json());
    },
    // Poll frequently for dashboard status
    refetchInterval: 5000, 
  });
}

// GET /api/agents/:id
export function useAgent(id: string) {
  return useQuery({
    queryKey: [api.agents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.agents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch agent");
      return api.agents.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/agents/register (Debugging/Manual use mainly)
export function useRegisterAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAgent) => {
      const validated = api.agents.register.input.parse(data);
      const res = await fetch(api.agents.register.path, {
        method: api.agents.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to register agent");
      return api.agents.register.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.agents.list.path] });
    },
  });
}
