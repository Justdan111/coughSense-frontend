import api from "@/lib/axios";

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
      const response = await api.post<AuthResponse>("/api/auth/register", {
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
      const response = await api.post<AuthResponse>("/api/auth/login", {
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
      const response = await api.get("/api/auth/me");
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch user";
      throw new Error(message);
    }
  },

  logout() {
    // Clear local storage and cookies
    localStorage.removeItem("cough_triage_user");
    localStorage.removeItem("access_token");
  },
};

// Analysis Service
export const analysisService = {
  async analyzeCough(audioFile: File) {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await api.post<AnalysisResponse>(
        "/api/analysis/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Analysis failed. Please try again.";
      throw new Error(message);
    }
  },

  async getAnalysisHistory() {
    try {
      const response = await api.get("/api/analysis/history");
      return response.data;
    } catch (error: Error | unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch history";
      throw new Error(message);
    }
  },
};
