import { useRef, useState, useEffect, useCallback } from "react";
import { Input } from "../../components/ui/Input";
import { BACKEND_URL, GOOGLE_CLIENT_ID } from "../../config";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button.tsx";
import { GoogleSignInButton } from "../../components/ui/GoogleSignInButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utlis/cn";


export function Login() {
  const usernameOrEmailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/feed", { replace: true });
    }
  }, [navigate]);

  // Google OAuth — exchange the ID-token credential for our app JWT
  const handleGoogleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const res = await axios.post(BACKEND_URL + "/api/v1/auth/google", {
        credential,
      });
      localStorage.setItem("token", res.data.token);
      toast.success("Logged in with Google!");
      navigate("/feed");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Google login failed");
      } else {
        toast.error("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    const usernameOrEmail = usernameOrEmailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();

    if (!usernameOrEmail || !password) {
      toast.error("Please enter both username/email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(BACKEND_URL + "/api/v1/login", {
        usernameOrEmail,
        password,
      });

      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      toast.success("Login successful!");
      navigate("/feed");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Backend returned an error response
          const message = error.response.data?.message || "An error occurred";
          toast.error(message);
        } else if (error.request) {
          // Request was made but no response (backend down)
          toast.error("Cannot connect to server. Please ensure the backend is running.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      } else {
        toast.error("Network error. Please check your internet connection.");
      }
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-200/50 dark:border-purple-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className={cn(
                "flex items-center gap-2 text-gray-700 dark:text-gray-300",
                "hover:text-purple-600 dark:hover:text-purple-400",
                "transition-colors duration-200 font-medium"
              )}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold gradient-text">Braintox</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex justify-center items-center min-h-screen pt-16 px-4">
        <motion.div
          className={cn(
            "glass border border-purple-200/50 dark:border-purple-800/30",
            "p-8 sm:p-10 rounded-2xl shadow-xl",
            "w-full max-w-md"
          )}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-8 text-center gradient-text">
            Welcome Back
          </h2>

         <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Input 
              ref={usernameOrEmailRef} 
              placeholder="Username or Email" 
              type="text" 
            />
          </div>
          <div className="mb-2">
            <Input
              ref={passwordRef}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="show-password-checkbox"
                type="checkbox"
                onChange={() => setShowPassword(!showPassword)}
                className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
              />
              <label htmlFor="show-password-checkbox" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                Show Password
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-semibold gradient-text hover:opacity-80 transition-opacity duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              loading={loading}
              text={loading ? "Logging In..." : "Log In"}
              size="md"
              fullWidth={true}
              type="submit"
              disabled={loading}
            />

            {GOOGLE_CLIENT_ID && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                </div>
                <GoogleSignInButton text="signin_with" onCredential={handleGoogleCredential} />
              </>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold gradient-text hover:opacity-80 transition-opacity duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
}
