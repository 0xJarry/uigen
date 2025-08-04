import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "../use-auth";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

const mockPush = vi.fn();
const mockSignInAction = vi.fn();
const mockSignUpAction = vi.fn();
const mockGetAnonWorkData = vi.fn();
const mockClearAnonWork = vi.fn();
const mockGetProjects = vi.fn();
const mockCreateProject = vi.fn();

// Import mocked modules
import { useRouter } from "next/navigation";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    
    (signInAction as any).mockImplementation(mockSignInAction);
    (signUpAction as any).mockImplementation(mockSignUpAction);
    (getAnonWorkData as any).mockImplementation(mockGetAnonWorkData);
    (clearAnonWork as any).mockImplementation(mockClearAnonWork);
    (getProjects as any).mockImplementation(mockGetProjects);
    (createProject as any).mockImplementation(mockCreateProject);
  });

  describe("initialization", () => {
    it("should return initial state with isLoading false", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    it("should handle successful sign in with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "Hello" }],
        fileSystemData: { "file1.tsx": "content" },
      };
      const mockProject = { id: "project-123" };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const signInResult = await result.current.signIn("test@example.com", "password123");
        expect(signInResult).toEqual({ success: true });
      });

      await waitFor(() => {
        expect(mockSignInAction).toHaveBeenCalledWith("test@example.com", "password123");
        expect(mockGetAnonWorkData).toHaveBeenCalled();
        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
          messages: mockAnonWork.messages,
          data: mockAnonWork.fileSystemData,
        });
        expect(mockClearAnonWork).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/project-123");
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should handle successful sign in with existing projects", async () => {
      const mockProjects = [{ id: "existing-project-1" }, { id: "existing-project-2" }];

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project-1");
        expect(mockCreateProject).not.toHaveBeenCalled();
      });
    });

    it("should handle successful sign in with no existing projects", async () => {
      const mockNewProject = { id: "new-project-456" };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue(mockNewProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^New Design #\d+$/),
          messages: [],
          data: {},
        });
        expect(mockPush).toHaveBeenCalledWith("/new-project-456");
      });
    });

    it("should handle failed sign in", async () => {
      const mockError = { success: false, error: "Invalid credentials" };
      mockSignInAction.mockResolvedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const signInResult = await result.current.signIn("test@example.com", "wrongpassword");
        expect(signInResult).toEqual(mockError);
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it("should manage loading state during sign in", async () => {
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      mockSignInAction.mockReturnValue(signInPromise);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signIn("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignIn!({ success: false });
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle sign in errors and reset loading state", async () => {
      mockSignInAction.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should handle successful sign up with anonymous work", async () => {
      const mockAnonWork = {
        messages: [{ role: "user", content: "Create a button" }],
        fileSystemData: { "button.tsx": "button content" },
      };
      const mockProject = { id: "signup-project-123" };

      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const signUpResult = await result.current.signUp("newuser@example.com", "password123");
        expect(signUpResult).toEqual({ success: true });
      });

      await waitFor(() => {
        expect(mockSignUpAction).toHaveBeenCalledWith("newuser@example.com", "password123");
        expect(mockGetAnonWorkData).toHaveBeenCalled();
        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
          messages: mockAnonWork.messages,
          data: mockAnonWork.fileSystemData,
        });
        expect(mockClearAnonWork).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/signup-project-123");
      });
    });

    it("should handle successful sign up with no anonymous work but existing projects", async () => {
      const mockProjects = [{ id: "existing-project-1" }];

      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("newuser@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project-1");
      });
    });

    it("should handle failed sign up", async () => {
      const mockError = { success: false, error: "Email already exists" };
      mockSignUpAction.mockResolvedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const signUpResult = await result.current.signUp("existing@example.com", "password123");
        expect(signUpResult).toEqual(mockError);
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it("should manage loading state during sign up", async () => {
      let resolveSignUp: (value: any) => void;
      const signUpPromise = new Promise((resolve) => {
        resolveSignUp = resolve;
      });
      mockSignUpAction.mockReturnValue(signUpPromise);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.signUp("test@example.com", "password123");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveSignUp!({ success: false });
        await signUpPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle sign up errors and reset loading state", async () => {
      mockSignUpAction.mockRejectedValue(new Error("Server error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password123");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn edge cases", () => {
    it("should handle anonymous work with empty messages array", async () => {
      const mockAnonWork = {
        messages: [],
        fileSystemData: { "file1.tsx": "content" },
      };
      const mockProjects = [{ id: "existing-project" }];

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockGetProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockCreateProject).not.toHaveBeenCalled();
        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project");
      });
    });

    it("should handle null anonymous work data", async () => {
      const mockProjects = [{ id: "existing-project" }];

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue(mockProjects);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockClearAnonWork).not.toHaveBeenCalled();
        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project");
      });
    });

    it("should generate unique project names when creating new projects", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "test-project" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^New Design #\d+$/),
          messages: [],
          data: {},
        });
      });

      const callArgs = mockCreateProject.mock.calls[0][0];
      const projectName = callArgs.name;
      const numberMatch = projectName.match(/^New Design #(\d+)$/);
      expect(numberMatch).toBeTruthy();
      const randomNumber = parseInt(numberMatch![1]);
      expect(randomNumber).toBeGreaterThanOrEqual(0);
      expect(randomNumber).toBeLessThan(100000);
    });
  });

  describe("error handling", () => {
    it("should handle errors in handlePostSignIn during project creation", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Database error");
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle errors in getProjects", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockRejectedValue(new Error("Failed to fetch projects"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password123");
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe("Failed to fetch projects");
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});