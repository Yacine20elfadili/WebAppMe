import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";
import * as api from "./api";

vi.mock("./api");

const mockApi = api as unknown as { register: ReturnType<typeof vi.fn>; login: ReturnType<typeof vi.fn> };

describe("App", () => {
  beforeEach(() => {
    mockApi.register.mockReset();
    mockApi.login.mockReset();
  });

  it("renders register form by default", () => {
    render(<App />);
    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("switches to login tab", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    expect(screen.getByText("Access System")).toBeInTheDocument();
  });

  it("switches back to register tab", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.click(screen.getByRole("button", { name: /register/i }));
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("shows error on failed registration", async () => {
    mockApi.register.mockResolvedValue({ error: "Username already taken" });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText("Username already taken")).toBeInTheDocument();
  });

  it("shows success message on successful registration", async () => {
    mockApi.register.mockResolvedValue({ message: "Welcome, test! Account created." });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText("Welcome, test! Account created.")).toBeInTheDocument();
  });

  it("clears form on successful registration", async () => {
    mockApi.register.mockResolvedValue({ message: "Success" });
    render(<App />);
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    await screen.findByText("Success");
    expect((screen.getByLabelText("Username") as HTMLInputElement).value).toBe("");
  });

  it("shows error on failed login", async () => {
    mockApi.login.mockResolvedValue({ error: "Wrong username or password." });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /access system/i }));
    expect(await screen.findByText("Wrong username or password.")).toBeInTheDocument();
  });

  it("shows welcome screen on successful login", async () => {
    mockApi.login.mockResolvedValue({ 
      message: "Welcome back", 
      user: { id: 1, username: "testuser", created: "2024-01-01" } 
    });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
    fireEvent.click(screen.getByRole("button", { name: /access system/i }));
    expect(await screen.findByText("Welcome, testuser")).toBeInTheDocument();
    expect(screen.getByText("The session is now active.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /terminate session/i })).toBeInTheDocument();
  });

  it("logout returns to auth screen", async () => {
    mockApi.login.mockResolvedValue({ 
      message: "OK", 
      user: { id: 1, username: "test", created: "" } 
    });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /access system/i }));
    await screen.findByText("Welcome, test");
    fireEvent.click(screen.getByRole("button", { name: /terminate session/i }));
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });
});