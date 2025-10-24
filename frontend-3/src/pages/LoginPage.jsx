import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";
import { loginUser, fetchUserProfile } from "../api/auth";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const LoginPage = () => {
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
    onError: (error) => {
      toast.error("Login failed. Please check your credentials.");
      console.log("The exact issue is", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username and password are required.");
      return;
    }
    mutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Sign in to your account
          </h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={mutation.isLoading} fullWidth>
            {mutation.isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
