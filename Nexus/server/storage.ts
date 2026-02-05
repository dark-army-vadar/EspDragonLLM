
import { db } from "./db";
import { 
  agents, commands, logs, detectedApps, agentSuggestions, agentScripts, automationRules,
  type Agent, type InsertAgent, 
  type Command, type InsertCommand,
  type Log, type InsertLog,
  type DetectedApp, type AgentSuggestion,
  type AgentScript, type InsertAgentScript,
  type AutomationRule, type InsertAutomationRule
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Agents
  getAgent(id: string): Promise<Agent | undefined>;
  getAgents(): Promise<Agent[]>;
  createOrUpdateAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: string, status: string): Promise<void>;

  // Detections & Suggestions
  getDetections(agentId: string): Promise<DetectedApp[]>;
  createDetection(detection: any): Promise<DetectedApp>;
  getSuggestions(agentId: string): Promise<AgentSuggestion[]>;
  getSuggestion(id: number): Promise<AgentSuggestion | undefined>;
  createSuggestion(suggestion: any): Promise<AgentSuggestion>;
  updateSuggestionStatus(id: number, status: string): Promise<void>;

  // Commands
  getCommands(agentId?: string): Promise<Command[]>;
  getPendingCommands(agentId: string): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommandStatus(id: number, status: string, output?: string): Promise<Command | undefined>;

  // Logs
  getLogs(agentId: string): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;

  // Scripts
  getScripts(): Promise<AgentScript[]>;
  createScript(script: InsertAgentScript): Promise<AgentScript>;

  // Automation
  getAutomationRules(): Promise<AutomationRule[]>;
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  deleteAutomationRule(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgents(): Promise<Agent[]> {
    return db.select().from(agents).orderBy(desc(agents.lastSeen));
  }

  async createOrUpdateAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents)
      .values(insertAgent)
      .onConflictDoUpdate({
        target: agents.id,
        set: {
          hostname: insertAgent.hostname,
          os: insertAgent.os,
          status: 'online',
          lastSeen: new Date(),
          metadata: insertAgent.metadata
        }
      })
      .returning();
    return agent;
  }

  async updateAgentStatus(id: string, status: string): Promise<void> {
    await db.update(agents)
      .set({ status, lastSeen: new Date() })
      .where(eq(agents.id, id));
  }

  async getDetections(agentId: string): Promise<DetectedApp[]> {
    return db.select().from(detectedApps).where(eq(detectedApps.agentId, agentId));
  }

  async createDetection(detection: any): Promise<DetectedApp> {
    const [d] = await db.insert(detectedApps).values(detection).returning();
    return d;
  }

  async getSuggestions(agentId: string): Promise<AgentSuggestion[]> {
    return db.select().from(agentSuggestions).where(eq(agentSuggestions.agentId, agentId));
  }

  async getSuggestion(id: number): Promise<AgentSuggestion | undefined> {
    const [s] = await db.select().from(agentSuggestions).where(eq(agentSuggestions.id, id));
    return s;
  }

  async createSuggestion(suggestion: any): Promise<AgentSuggestion> {
    const [s] = await db.insert(agentSuggestions).values(suggestion).returning();
    return s;
  }

  async updateSuggestionStatus(id: number, status: string): Promise<void> {
    await db.update(agentSuggestions).set({ status }).where(eq(agentSuggestions.id, id));
  }

  async getCommands(agentId?: string): Promise<Command[]> {
    if (agentId) {
      return db.select().from(commands)
        .where(eq(commands.agentId, agentId))
        .orderBy(desc(commands.createdAt));
    }
    return db.select().from(commands).orderBy(desc(commands.createdAt));
  }

  async getPendingCommands(agentId: string): Promise<Command[]> {
    return db.select().from(commands)
      .where(and(
        eq(commands.agentId, agentId),
        eq(commands.status, 'pending')
      ))
      .orderBy(commands.createdAt);
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const [command] = await db.insert(commands).values(insertCommand).returning();
    return command;
  }

  async updateCommandStatus(id: number, status: string, output?: string): Promise<Command | undefined> {
    const [command] = await db.update(commands)
      .set({ 
        status, 
        output, 
        executedAt: status !== 'pending' ? new Date() : undefined 
      })
      .where(eq(commands.id, id))
      .returning();
    return command;
  }

  async getLogs(agentId: string): Promise<Log[]> {
    return db.select().from(logs)
      .where(eq(logs.agentId, agentId))
      .orderBy(desc(logs.timestamp))
      .limit(100);
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  // Scripts
  async getScripts(): Promise<AgentScript[]> {
    return db.select().from(agentScripts).orderBy(desc(agentScripts.createdAt));
  }

  async createScript(insertScript: InsertAgentScript): Promise<AgentScript> {
    const [script] = await db.insert(agentScripts).values(insertScript).returning();
    return script;
  }

  // Automation
  async getAutomationRules(): Promise<AutomationRule[]> {
    return db.select().from(automationRules).orderBy(desc(automationRules.createdAt));
  }

  async createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule> {
    const [newRule] = await db.insert(automationRules).values(rule).returning();
    return newRule;
  }

  async deleteAutomationRule(id: number): Promise<void> {
    await db.delete(automationRules).where(eq(automationRules.id, id));
  }
}

export const storage = new DatabaseStorage();
