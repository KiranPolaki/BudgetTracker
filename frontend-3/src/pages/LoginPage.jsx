import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { loginUser, fetchUserProfile } from "../api/auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

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
      toast.success("Login successful!");
      navigate("/");
    },
    onError: () => {
      toast.error("Login failed. Please check your credentials.");
    },
  });

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Username is required.");
      return;
    }
    setStep(2);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required.");
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
          <div className="flex flex-col items-center space-y-1.5 px-6 my-4">
            <h2 className="text-2xl font-semibold text-white">
              {step === 1 ? "Sign in to your account" : "Enter your password"}
            </h2>
            {/* <p className="text-sm text-gray-400 text-center">
              {step === 1
                ? "Enter your username to continue"
                : `Welcome back, ${username}`}
            </p> */}
          </div>

          <div className="px-6 pb-6">
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
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" fullWidth>
                  Continue
                </Button>
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
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setPassword("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={mutation.isLoading}
                    className="flex-1"
                  >
                    {mutation.isLoading ? "Signing in..." : "Sign in"}
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
