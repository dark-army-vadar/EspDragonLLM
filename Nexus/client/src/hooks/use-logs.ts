import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { AnalyzeLogsRequest } from "@shared/schema";

// GET /api/agents/:id/logs
export function useAgentLogs(agentId: string) {
  return useQuery({
    queryKey: [api.logs.list.path, agentId],
    queryFn: async () => {
      const url = buildUrl(api.logs.list.path, { id: agentId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.logs.list.responses[200].parse(await res.json());
    },
    enabled: !!agentId,
    refetchInterval: 5000,
  });
}

// POST /api/agents/:id/analyze (AI)
export function useAnalyzeLogs() {
  return useMutation({
    mutationFn: async (data: AnalyzeLogsRequest) => {
      const url = buildUrl(api.logs.analyze.path, { id: data.agentId });
      const res = await fetch(url, {
        method: api.logs.analyze.method,
        headers: { "Content-Type": "application/json" },
        // Body isn't strictly needed if we just use recent logs, but schema might evolve
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to analyze logs");
      return api.logs.analyze.responses[200].parse(await res.json());
    },
  });
}
