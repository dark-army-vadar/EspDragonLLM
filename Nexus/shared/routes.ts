
import { z } from 'zod';
import { 
  insertAgentSchema, 
  insertCommandSchema, 
  insertLogSchema,
  insertDetectedAppSchema,
  insertAgentSuggestionSchema,
  agentScripts,
  insertAgentScriptSchema,
  generateScriptRequestSchema,
  agents,
  commands,
  logs,
  detectedApps,
  agentSuggestions,
  automationRules,
  insertAutomationRuleSchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === AGENT MANAGEMENT ===
  agents: {
    list: {
      method: 'GET' as const,
      path: '/api/agents',
      responses: {
        200: z.array(z.custom<typeof agents.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/agents/:id',
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/agents/register',
      input: insertAgentSchema,
      responses: {
        200: z.custom<typeof agents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    heartbeat: {
      method: 'POST' as const,
      path: '/api/agents/:id/heartbeat',
      responses: {
        200: z.object({ status: z.literal("ok") }),
        404: errorSchemas.notFound,
      },
    },
  },

  // === DETECTIONS & SUGGESTIONS ===
  detections: {
    list: {
      method: 'GET' as const,
      path: '/api/agents/:id/detections',
      responses: {
        200: z.array(z.custom<typeof detectedApps.$inferSelect>()),
      },
    },
  },
  suggestions: {
    listByAgent: {
      method: 'GET' as const,
      path: '/api/agents/:id/suggestions',
      responses: {
        200: z.array(z.custom<typeof agentSuggestions.$inferSelect>()),
      },
    },
    deploy: {
      method: 'POST' as const,
      path: '/api/suggestions/:id/deploy',
      responses: {
        200: z.object({ success: z.boolean(), commandId: z.number() }),
        404: errorSchemas.notFound,
      },
    },
  },

  // === COMMAND EXECUTION ===
  commands: {
    list: {
      method: 'GET' as const,
      path: '/api/commands', 
      input: z.object({ agentId: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof commands.$inferSelect>()),
      },
    },
    getPending: {
      method: 'GET' as const,
      path: '/api/agents/:id/commands',
      responses: {
        200: z.array(z.custom<typeof commands.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/commands',
      input: insertCommandSchema,
      responses: {
        201: z.custom<typeof commands.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    report: {
      method: 'POST' as const,
      path: '/api/commands/:id/result',
      input: z.object({ status: z.string(), output: z.string() }),
      responses: {
        200: z.custom<typeof commands.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === LOGS ===
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/agents/:id/logs',
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertLogSchema,
      responses: {
        201: z.custom<typeof logs.$inferSelect>(),
      },
    },
  },

  // === AUTOMATION ===
  automation: {
    list: {
      method: 'GET' as const,
      path: '/api/automation',
      responses: {
        200: z.array(z.custom<typeof automationRules.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/automation',
      input: insertAutomationRuleSchema,
      responses: {
        201: z.custom<typeof automationRules.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/automation/:id',
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },

  // === SCRIPTS & AI ===
  scripts: {
    list: {
      method: 'GET' as const,
      path: '/api/scripts',
      responses: {
        200: z.array(z.custom<typeof agentScripts.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scripts',
      input: insertAgentScriptSchema,
      responses: {
        201: z.custom<typeof agentScripts.$inferSelect>(),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/scripts/generate',
      input: generateScriptRequestSchema,
      responses: {
        200: z.object({
          code: z.string(),
          explanation: z.string(),
        }),
      },
    },
  }
};

// === DEVICE TELEMETRY (Safe, consent-first) ===
api['device'] = {
  consent: {
    method: 'POST' as const,
    path: '/api/device/consent',
    input: z.object({ agentId: z.string(), consent: z.boolean(), hostname: z.string().optional(), os: z.enum(['android','windows','linux']).optional() }),
    responses: {
      200: z.object({ success: z.boolean() }),
    },
  },
  telemetry: {
    method: 'POST' as const,
    path: '/api/device/telemetry',
    input: z.object({ agentId: z.string(), level: z.enum(['info','warn','error']).optional(), message: z.string() }),
    responses: {
      201: z.object({ id: z.number() }),
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
