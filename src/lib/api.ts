import api from "@/lib/axios";
import axios from "axios";

// Response types based on your FastAPI response structure
export interface AnalysisResponse {
  user_id: string;
  severity: string;
  confidence: number;
  risk_level: "low" | "medium" | "high";
  summary: string;
  recommendation: string;
  actions: string[];
  disclaimer: string;
}

export interface AssessResponse {
  user_id: string;
  result: "risky" | "less_risky";
  cough_confidence_pct: number;
  score: number;
  summary: string;
  recommendation: string;
  actions: string[];
  disclaimer: string;
}

export interface AuthResponse {
  user_id: string;
  email: string;
  name?: string;
  access_token: string;
  token_type: string;
}

// Auth Service
export const authService = {
  async register(email: string, password: string, name?: string) {
    try {
      const response = await api.post<AuthResponse>("/auth/register", {
        email,
        password,
        name: name || email.split("@")[0],
      });
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      throw new Error(message);
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error: Error | unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      throw new Error(message);
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user";
      throw new Error(message);
    }
  },

  async getAccount() {
    try {
      const response = await api.get("/auth/account");
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch account";
      throw new Error(message);
    }
  },

  async patchAccount(payload: { name?: string }) {
    try {
      const response = await api.patch("/auth/account", payload);
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update account";
      throw new Error(message);
    }
  },

  logout() {
    localStorage.removeItem("cough_triage_user");
    localStorage.removeItem("access_token");
  },
};

// Shared error message extractor
function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "msg" in item)
            return String(item.msg);
          return null;
        })
        .filter(Boolean)
        .join(" ");
    }
    if (typeof error.message === "string" && error.message.trim())
      return error.message;
  } else if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

function normalizeConfidenceValue(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as Record<string, unknown>;
  const candidates = [
    data.confidence,
    data.confidence_score,
    data.confidence_pct,
    data.cough_confidence,
    data.cough_confidence_pct,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate > 1 ? candidate / 100 : candidate;
    }
  }

  if (data.data && typeof data.data === "object") {
    return normalizeConfidenceValue(data.data);
  }

  return null;
}

function normalizeAnalysisResponse(responseData: unknown): AnalysisResponse {
  if (!responseData || typeof responseData !== "object") {
    throw new Error("Analysis succeeded but returned unexpected data.");
  }

  const data = responseData as Record<string, unknown>;
  const confidence = normalizeConfidenceValue(data);

  if (confidence === null) {
    console.error("Unexpected analyze response:", data);
    throw new Error("Analysis succeeded but returned unexpected data. Missing confidence value.");
  }

  return {
    user_id: String(data.user_id ?? ""),
    severity: String(data.severity ?? "unknown"),
    confidence,
    risk_level: (data.risk_level as AnalysisResponse["risk_level"]) ?? "medium",
    summary: String(data.summary ?? ""),
    recommendation: String(data.recommendation ?? ""),
    actions: Array.isArray(data.actions) ? data.actions.map(String) : [],
    disclaimer: String(data.disclaimer ?? ""),
  };
}

// Analysis Service
export const analysisService = {
  async analyzeCough(audioFile: File): Promise<AnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append("audio", audioFile, audioFile.name);

      const response = await api.post<AnalysisResponse>(
        "/analysis/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return normalizeAnalysisResponse(response.data);
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Analysis failed. Please try again."));
    }
  },

  async assess(payload: {
    cough_confidence: number;
    fever: boolean;
    blood: boolean;
    chest_pain: boolean;
    difficulty_breathing: boolean;
    save_for_training: boolean;
  }): Promise<AssessResponse> {
    try {
      console.log("assess service payload:", payload);
      // FastAPI expects the fields at the top level (not wrapped in `data`)
      const response = await api.post<AssessResponse>(
        "/analysis/assess",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractErrorMessage(error, "Assessment failed. Please try again."));
    }
  },
};