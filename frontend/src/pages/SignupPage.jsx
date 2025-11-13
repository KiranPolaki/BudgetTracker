import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { registerUser } from "../api/auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { ArrowLeftIcon } from "lucide-react";

const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: (payload) => registerUser(payload),
    onSuccess: (data) => {
      const access = data?.tokens?.access;
      const user = data?.user;
      if (access) setToken(access);
      if (user) setUser(user);
      toast.success("Account created — welcome!");
      navigate("/");
    },
    onError: (err) => {
      const message = err?.response?.data || "Failed to create account.";
      toast.error(
        typeof message === "string" ? message : JSON.stringify(message)
      );
    },
  });

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Username is required.");
      return;
    }
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email.");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required.");
      return;
    }
    if (!confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    mutation.mutate({ username, email, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md px-4">
        <div className="flex items-center justify-center">
          <img src="/budget.svg" alt="Logo" className="w-12 h-12" />
        </div>
        <div className="">
          <div className="flex flex-col items-center space-y-1.5 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white">
              {step === 1 ? "Create account" : "Set password"}
            </h2>
            <p className="text-sm text-gray-400 text-center">
              {step === 1
                ? "Register a new account to get started"
                : "Create a secure password for your account"}
            </p>
          </div>

          <div className="px-6 pb-6 transition-all duration-300 ease-in-out">
            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-white mb-2"
                  >
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white mb-2"
                  >
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" fullWidth disabled={false}>
                  Continue
                </Button>
                <div className="mt-2 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/login")}
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
                <div className="h-12 opacity-0 pointer-events-none"></div>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white mb-2"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-white mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    loading={mutation.isLoading}
                    fullWidth
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? "Creating..." : "Create account"}
                  </Button>
                </div>
                <div className="flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="flex gap-2"
                    disabled={mutation.isLoading}
                  >
                    <ArrowLeftIcon className="w-5 h-5 stroke-white/70" />
                    <span className="text-white/70">Go Back</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
