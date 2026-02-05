import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertCommand } from "@shared/schema";

// GET /api/commands (optional filter by agentId)
export function useCommands(agentId?: string) {
  return useQuery({
    queryKey: [api.commands.list.path, agentId],
    queryFn: async () => {
      // Manual URL construction because wouter doesn't handle query params automatically like buildUrl handles path params
      const url = agentId 
        ? `${api.commands.list.path}?agentId=${agentId}`
        : api.commands.list.path;
        
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch commands");
      return api.commands.list.responses[200].parse(await res.json());
    },
    refetchInterval: 2000, // Frequent polling for "terminal" feel
  });
}

// POST /api/commands
export function useCreateCommand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCommand) => {
      const validated = api.commands.create.input.parse(data);
      const res = await fetch(api.commands.create.path, {
        method: api.commands.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send command");
      return api.commands.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.commands.list.path] });
      if (variables.agentId) {
        queryClient.invalidateQueries({ queryKey: [api.commands.list.path, variables.agentId] });
      }
    },
  });
}
