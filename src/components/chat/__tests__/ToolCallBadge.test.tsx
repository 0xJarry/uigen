import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("ToolCallBadge shows green dot and message when completed", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "components/Button.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Creating Button.tsx")).toBeDefined();
  
  // Check for green dot (emerald-500 background)
  const container = screen.getByText("📝 Creating Button.tsx").parentElement;
  const greenDot = container?.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
});

test("ToolCallBadge shows spinner when in progress", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "components/Button.tsx" }}
      state="calling"
    />
  );

  expect(screen.getByText("📝 Creating Button.tsx")).toBeDefined();
  
  // Check for spinning loader
  const container = screen.getByText("📝 Creating Button.tsx").parentElement;
  const spinner = container?.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

// Tests for str_replace_editor tool commands
test("ToolCallBadge formats view command correctly", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "view", path: "src/utils/helper.ts" }}
      state="result"
      result="File content"
    />
  );

  expect(screen.getByText("📄 Viewing helper.ts")).toBeDefined();
});

test("ToolCallBadge formats create command correctly", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "components/Modal.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Creating Modal.tsx")).toBeDefined();
});

test("ToolCallBadge formats str_replace command correctly", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "str_replace", path: "components/Button.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("✏️ Editing Button.tsx")).toBeDefined();
});

test("ToolCallBadge formats insert command correctly", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "insert", path: "components/Card.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Updating Card.tsx")).toBeDefined();
});

test("ToolCallBadge formats undo_edit command correctly", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "undo_edit", path: "components/Button.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("↩️ Reverting Button.tsx")).toBeDefined();
});

// Tests for file_manager tool commands
test("ToolCallBadge formats rename command correctly", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      toolArgs={{ 
        command: "rename", 
        path: "components/OldButton.tsx",
        new_path: "components/NewButton.tsx"
      }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📂 Renaming OldButton.tsx → NewButton.tsx")).toBeDefined();
});

test("ToolCallBadge formats delete command correctly", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      toolArgs={{ command: "delete", path: "components/UnusedComponent.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("🗑️ Deleting UnusedComponent.tsx")).toBeDefined();
});

// Tests for edge cases
test("ToolCallBadge handles missing path gracefully", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Creating file")).toBeDefined();
});

test("ToolCallBadge handles missing toolArgs", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("str_replace_editor")).toBeDefined();
});

test("ToolCallBadge handles unknown command", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "unknown_command", path: "test.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📄 Processing test.tsx")).toBeDefined();
});

test("ToolCallBadge handles unknown tool name", () => {
  render(
    <ToolCallBadge
      toolName="unknown_tool"
      toolArgs={{ some: "args" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("ToolCallBadge handles complex file paths", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "src/components/ui/buttons/PrimaryButton.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Creating PrimaryButton.tsx")).toBeDefined();
});

test("ToolCallBadge handles Windows-style paths", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "view", path: "src\\components\\Button.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📄 Viewing Button.tsx")).toBeDefined();
});

test("ToolCallBadge handles rename without new_path", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      toolArgs={{ command: "rename", path: "components/Button.tsx" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📂 Renaming Button.tsx")).toBeDefined();
});

test("ToolCallBadge handles empty path", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "" }}
      state="result"
      result="Success"
    />
  );

  expect(screen.getByText("📝 Creating file")).toBeDefined();
});

test("ToolCallBadge applies correct CSS classes", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "test.tsx" }}
      state="result"
      result="Success"
    />
  );

  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("gap-2");
  expect(badge.className).toContain("bg-neutral-50");
  expect(badge.className).toContain("rounded-lg");
  expect(badge.className).toContain("text-xs");
  expect(badge.className).toContain("font-mono");
  expect(badge.className).toContain("border");
});

test("ToolCallBadge shows correct text color", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      toolArgs={{ command: "create", path: "test.tsx" }}
      state="result"
      result="Success"
    />
  );

  const textSpan = container.querySelector("span");
  expect(textSpan?.className).toContain("text-neutral-700");
});