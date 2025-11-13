import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { loginUser, fetchUserProfile } from "../api/auth";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import { ArrowLeftIcon } from "lucide-react";

const LoginPage = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      setToken(data.access);
      const userProfile = await fetchUserProfile();
      setUser(userProfile);
      toast.success("Signed in — welcome back!");
      navigate("/");
    },
    onError: () => {
      toast.error("Sign in failed. Please check your username and password.");
    },
  });

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter your username.");
      return;
    }
    setStep(2);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    mutation.mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-full max-w-md px-4">
        <div className="flex items-center justify-center">
          <img src="/budget.svg" alt="Logo" className="w-12 h-12"></img>
        </div>
        <div className="">
          <div className="flex flex-col items-center space-y-1.5 px-6 py-4">
            <h2 className="text-2xl font-semibold text-white">
              {step === 1 ? "Sign in to your account" : "Enter your password"}
            </h2>
            <p className="text-sm text-gray-400 text-center">
              {step === 1
                ? "Enter your username to continue"
                : `Welcome back, ${username}`}
            </p>
          </div>

          <div className="px-6 pb-6 transition-all duration-300 ease-in-out">
            {step === 1 ? (
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
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
                    placeholder="admin"
                    maxLength={50}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" fullWidth disabled={false}>
                  Continue
                </Button>
                <div className="mt-2 flex items-center justify-center">
                  <a href={"/signup"} className="text-white">
                    Create account
                  </a>
                </div>
                <div className="h-12 opacity-0 pointer-events-none"></div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white mb-2"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    placeholder="Enter your password"
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    loading={mutation.isLoading}
                    fullWidth
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
                <div className="flex items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep(1);
                      setPassword("");
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

export default LoginPage;
