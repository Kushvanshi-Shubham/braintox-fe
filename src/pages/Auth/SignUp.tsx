import { useRef, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Input } from "../../components/ui/Input";
import { BACKEND_URL, GOOGLE_CLIENT_ID } from "../../config";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button.tsx";
import { GoogleSignInButton } from "../../components/ui/GoogleSignInButton";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utlis/cn";

function isPasswordStrong(password: string) {
  return (
    password.length >= 12 &&
    /\d/.test(password) &&
    /[a-zA-Z]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password)
  );
}

export function SignUp() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
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
      toast.success("Account created with Google!");
      navigate("/feed");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data?.message || "Google signup failed");
      } else {
        toast.error("Google signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();

    const username = usernameRef.current?.value.trim();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value.trim();
    const confirmPassword = confirmPasswordRef.current?.value.trim();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }

    if (username.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.error(
        "Password must be at least 12 characters, with uppercase, lowercase, number & special character."
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(BACKEND_URL + "/api/v1/signup", {
        username,
        email,
        password,
      });

      toast.success("Signed up successfully! Please log in.");
      navigate("/login");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response) {
          // Backend returned an error response
          const message = e.response.data?.message || "Signup failed";
          toast.error(message);
        } else if (e.request) {
          // Request was made but no response (backend down)
          toast.error("Cannot connect to server. Please ensure the backend is running.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      } else {
        toast.error("Network error. Please check your internet connection.");
      }
      console.error("Signup error:", e);
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

      {/* Signup Form */}
      <div className="flex justify-center items-center min-h-screen pt-16 px-4">
        <motion.div
          className={cn(
            "glass border border-purple-200/50 dark:border-purple-800/30",
            "p-8 sm:p-10 rounded-2xl shadow-xl",
            "w-full max-w-md"
          )}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h2
            className="text-4xl font-bold mb-8 text-center gradient-text"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create Account
          </motion.h2>

        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <Input ref={usernameRef} placeholder="Username" type="text" />
          </div>
          <div className="mb-4">
            <Input ref={emailRef} placeholder="Email" type="email" />
          </div>
          <div className="mb-4">
            <Input
              ref={passwordRef}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
            />
          </div>
          <div className="mb-2">
            <Input
              ref={confirmPasswordRef}
              placeholder="Confirm Password"
              type={showPassword ? "text" : "password"}
            />
          </div>

          <div className="flex items-center mb-4">
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

          <motion.p
            className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Password must be at least 12 characters with uppercase, lowercase, number, and special character.
          </motion.p>

          <div className="pt-2">
            <Button
              variant="primary"
              loading={loading}
              text={loading ? "Creating Account..." : "Sign Up"}
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
                <GoogleSignInButton text="signup_with" onCredential={handleGoogleCredential} />
              </>
            )}

            <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold gradient-text hover:opacity-80 transition-opacity duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
      </div>
    </div>
  );
}
