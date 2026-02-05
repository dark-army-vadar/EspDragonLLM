import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertAgentScript, GenerateScriptRequest } from "@shared/schema";

// GET /api/scripts
export function useScripts() {
  return useQuery({
    queryKey: [api.scripts.list.path],
    queryFn: async () => {
      const res = await fetch(api.scripts.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scripts");
      return api.scripts.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/scripts
export function useCreateScript() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAgentScript) => {
      const validated = api.scripts.create.input.parse(data);
      const res = await fetch(api.scripts.create.path, {
        method: api.scripts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save script");
      return api.scripts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scripts.list.path] });
    },
  });
}

// POST /api/scripts/generate (AI)
export function useGenerateScript() {
  return useMutation({
    mutationFn: async (data: GenerateScriptRequest) => {
      const validated = api.scripts.generate.input.parse(data);
      const res = await fetch(api.scripts.generate.path, {
        method: api.scripts.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to generate script");
      }
      return api.scripts.generate.responses[200].parse(await res.json());
    },
  });
}
