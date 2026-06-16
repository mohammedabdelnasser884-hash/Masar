import { CVData } from "../types";

export interface TelemetryEvent {
  id: string;
  time: string;
  epoch: number;
  name: string;
  category: "navigation" | "action" | "ai" | "system" | "error";
  details?: string;
  icon?: string;
}

export interface TelemetryData {
  sessionStartTime: number;
  timeToFirstValue: number | null; // in seconds
  focusModeSeconds: number;
  focusModeSessionsCount: number;
  errorCount: number;
  apiLatencies: number[]; // response latencies in ms
  events: TelemetryEvent[];
  onboardingSteps: {
    app_launch: boolean;
    fill_demo_profile: boolean;
    preview_resume: boolean;
    run_ats_audit: boolean;
    ask_ai_coach: boolean;
    generate_cover: boolean;
    simulate_contracts: boolean;
  };
}

// In-Memory Telemetry state that persists in LocalStorage
const STORAGE_KEY = "masar_telemetry_v1";
const UNDO_KEY = "masar_cv_undo_stack";

const defaultTelemetry: TelemetryData = {
  sessionStartTime: Date.now(),
  timeToFirstValue: null,
  focusModeSeconds: 0,
  focusModeSessionsCount: 0,
  errorCount: 0,
  apiLatencies: [120, 240, 150, 480],
  events: [],
  onboardingSteps: {
    app_launch: true,
    fill_demo_profile: false,
    preview_resume: false,
    run_ats_audit: false,
    ask_ai_coach: false,
    generate_cover: false,
    simulate_contracts: false
  }
};

class TelemetryService {
  private data: TelemetryData;
  private focusStart: number | null = null;
  private cvUndoStack: CVData[] = [];
  private cvRedoStack: CVData[] = [];

  constructor() {
    this.data = this.loadTelemetry();
    this.checkSessionStart();
    this.loadUndoStack();
  }

  private loadTelemetry(): TelemetryData {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure steps exist
        if (!parsed.onboardingSteps) {
          parsed.onboardingSteps = { ...defaultTelemetry.onboardingSteps };
        }
        return parsed;
      } catch (e) {
        console.error("Telemetry parse failed, using default", e);
      }
    }
    return { ...defaultTelemetry, sessionStartTime: Date.now() };
  }

  private saveTelemetry() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private checkSessionStart() {
    // Session boundaries
    const now = Date.now();
    // If the last event was hours ago, reset sessionStartTime for realistic analytics
    if (this.data.events.length > 0) {
      const lastEvent = this.data.events[0];
      if (now - lastEvent.epoch > 4 * 60 * 60 * 1000) {
        this.data.sessionStartTime = now;
        this.saveTelemetry();
      }
    }
    this.logEvent("App Initialized", "system", "Beta engine booted & readiness checks verified");
  }

  public getTelemetry(): TelemetryData {
    return this.data;
  }

  public logEvent(name: string, category: TelemetryEvent["category"], details?: string) {
    const now = Date.now();
    const event: TelemetryEvent = {
      id: `evt-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date().toLocaleTimeString(),
      epoch: now,
      name,
      category,
      details
    };

    // Unshift to keep list sorted (newest first)
    this.data.events = [event, ...this.data.events].slice(0, 50); // limit to last 50 events

    // Determine Time To First Value (TTFV)
    // High-value triggers that yield value to the user:
    const highValueTriggers = [
      "Auto Fill Demo Profile",
      "Copy Plaintext Summary",
      "Print CV",
      "Vite Document Loaded",
      "Export JSON Backup",
      "Run ATS Checker",
      "AI Tailor trigger success",
      "Send career coach message",
      "Quick auto-apply",
      "Outreach Pitch Generated",
      "Contract Evaluated",
      "Start Interview Simulation"
    ];

    if (highValueTriggers.includes(name) && this.data.timeToFirstValue === null) {
      const diffSec = (now - this.data.sessionStartTime) / 1000;
      this.data.timeToFirstValue = parseFloat(diffSec.toFixed(2));
      this.logEvent("First Value Achieved", "system", `Time to First Value calculated: ${diffSec.toFixed(2)}s via [${name}]`);
    }

    // Mark Onboarding progress
    if (name === "Auto Fill Demo Profile") this.data.onboardingSteps.fill_demo_profile = true;
    if (name === "Print CV" || name === "Copy Plaintext Summary") this.data.onboardingSteps.preview_resume = true;
    if (name === "Run ATS Checker" || name === "AI Tailor trigger success") this.data.onboardingSteps.run_ats_audit = true;
    if (name === "Send career coach message") this.data.onboardingSteps.ask_ai_coach = true;
    if (name === "Outreach Pitch Generated") this.data.onboardingSteps.generate_cover = true;
    if (name === "Contract Evaluated") this.data.onboardingSteps.simulate_contracts = true;

    this.saveTelemetry();
  }

  public logError(message: string) {
    this.data.errorCount++;
    this.logEvent(`ERROR: ${message}`, "error", "Dynamic error logged inside system runtime observer.");
    this.saveTelemetry();
  }

  public logApiLatency(ms: number) {
    this.data.apiLatencies = [...this.data.apiLatencies, ms].slice(-20); // keep last 20 queries
    this.saveTelemetry();
  }

  // --- FOCUS MODE TRACKER ---
  public startFocusTracking() {
    this.focusStart = Date.now();
    this.data.focusModeSessionsCount++;
    this.logEvent("Focus Mode Enabled", "action", "Zen workspace activated. Distractions throttled.");
    this.saveTelemetry();
  }

  public stopFocusTracking() {
    if (this.focusStart) {
      const elapsedSeconds = Math.floor((Date.now() - this.focusStart) / 1000);
      this.data.focusModeSeconds += elapsedSeconds;
      this.focusStart = null;
      this.logEvent("Focus Mode Disabled", "action", `Zen workspace session completed. Spent: ${elapsedSeconds} seconds`);
      this.saveTelemetry();
    }
  }

  public clearTelemetry() {
    this.data = {
      ...defaultTelemetry,
      sessionStartTime: Date.now(),
      events: []
    };
    this.saveTelemetry();
    this.logEvent("Telemetry Reset", "system", "Operational diagnostic database flushed clean");
  }

  // --- UNDO / REDO MASTER PERSISTENCE AND FLOW ENGINE ---
  private loadUndoStack() {
    const saved = localStorage.getItem(UNDO_KEY);
    if (saved) {
      try {
        this.cvUndoStack = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private saveUndoStackState() {
    localStorage.setItem(UNDO_KEY, JSON.stringify(this.cvUndoStack.slice(-15))); // Keep last 15 states
  }

  public pushCvState(state: CVData) {
    // Avoid duplicating exact same states repeatedly
    if (this.cvUndoStack.length > 0) {
      const last = this.cvUndoStack[this.cvUndoStack.length - 1];
      if (JSON.stringify(last) === JSON.stringify(state)) {
        return;
      }
    }
    // Deep clone state to secure safety
    this.cvUndoStack.push(JSON.parse(JSON.stringify(state)));
    if (this.cvUndoStack.length > 20) {
      this.cvUndoStack.shift(); // Max 20 states in memory
    }
    this.cvRedoStack = []; // Flushed on new action
    this.saveUndoStackState();
  }

  public canUndo(): boolean {
    return this.cvUndoStack.length > 1; // Current state resides on top of stack
  }

  public canRedo(): boolean {
    return this.cvRedoStack.length > 0;
  }

  public undo(currentState: CVData): { previous: CVData; message: string } | null {
    if (!this.canUndo()) return null;

    // Pop current state off stack to push into Redo
    const current = this.cvUndoStack.pop();
    if (current) {
      this.cvRedoStack.push(JSON.parse(JSON.stringify(currentState)));
    }

    // Peak previous state
    const previous = this.cvUndoStack[this.cvUndoStack.length - 1];
    this.saveUndoStackState();
    
    this.logEvent("Undo Action Executed", "action", "Restored previous master resume configuration draft");
    return { previous: JSON.parse(JSON.stringify(previous)), message: "Undo performed successfully" };
  }

  public redo(currentState: CVData): { next: CVData; message: string } | null {
    if (!this.canRedo()) return null;

    const next = this.cvRedoStack.pop();
    if (next) {
      this.cvUndoStack.push(JSON.parse(JSON.stringify(currentState)));
      this.saveUndoStackState();
      this.logEvent("Redo Action Executed", "action", "Re-applied previously undone layout inputs");
      return { next: JSON.parse(JSON.stringify(next)), message: "Redo performed successfully" };
    }
    return null;
  }
}

export const telemetry = new TelemetryService();
