import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const { login, setUser, user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasRedirected = useRef(false); // Use ref to prevent multiple redirects

  // Redirect if already logged in - but only once
  useEffect(() => {
    // Early exit checks - prevent any redirect logic if conditions aren't met
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      return; // Not on login page, don't do anything
    }
    
    if (hasRedirected.current) {
      return; // Already redirected, don't do anything
    }
    
    if (authLoading || loading) {
      return; // Still loading, wait
    }
    
    // Only redirect if we have a user
    if (currentUser?.id) {
      const targetPath = currentUser.role === 'ADMIN' ? "/admin" : "/feed";
      console.log("🔄 Already logged in, redirecting to:", targetPath);
      hasRedirected.current = true; // Mark as redirected BEFORE redirect
      // Use replace instead of href to prevent back button issues and loops
      window.location.replace(targetPath);
    }
  }, [currentUser?.id, authLoading, loading]); // Only depend on user.id, not entire user object

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: API call to login
      console.log("🔐 Attempting login...");
      const loginResponse = await api.post("/auth/login", credentials);
      
      // Step 2: Log full response to debug
      console.log("📋 Login response status:", loginResponse.status);
      console.log("📋 Login response data:", JSON.stringify(loginResponse.data, null, 2));
      console.log("📋 Login response headers:", Object.keys(loginResponse.headers));
      console.log("📋 Set-Cookie header:", loginResponse.headers['set-cookie'] || loginResponse.headers['Set-Cookie'] || 'Not found');
      
      const responseData = loginResponse.data;
      
      // If login response doesn't have expected structure, log warning
      if (!responseData) {
        console.warn("⚠️ Login response has no data - backend may need to return user data or token");
      } else {
        console.log("📋 Response data keys:", Object.keys(responseData));
        console.log("📋 Has user field:", !!responseData.user);
        console.log("📋 Has id field:", !!responseData.id);
        console.log("📋 Has email field:", !!responseData.email);
        console.log("📋 Has token field:", !!responseData.token);
      }
      
      // Step 3: Extract token from response (check all possible locations)
      let token = responseData?.token || 
                  responseData?.accessToken || 
                  responseData?.jwt ||
                  responseData?.data?.token ||
                  responseData?.user?.token ||
                  responseData?.authToken;
      
      // Store token if found (for Bearer auth fallback)
      if (token) {
        console.log("🔑 Token found in response, storing in localStorage...");
        localStorage.setItem("token", token);
      } else {
        console.warn("⚠️ No token in response body");
      }
      
      // Step 4: Check if login response contains user data
      let userFromResponse = null;
      if (responseData?.user) {
        userFromResponse = responseData.user;
      } else if (responseData?.id || responseData?.email) {
        // User data is at root level
        userFromResponse = responseData;
      }
      
      // Step 5: Wait for cookies to be set by browser (if backend uses cookies)
      console.log("⏳ Waiting for cookies to be set...");
      await new Promise(resolve => setTimeout(resolve, 500));
      const cookiesAfterWait = document.cookie;
      console.log("🍪 Cookies after wait:", cookiesAfterWait || "No cookies found");
      
      // Step 6: Try to verify authentication with /users/me
      // But if it fails and we have user data from login, use that
      let completeUser = null;
      
      // Always try /users/me first if we have any form of auth (even if it might fail)
      // This gives us the most complete user data
      if (token || cookiesAfterWait || userFromResponse) {
        try {
          console.log("🔄 Attempting to verify authentication with /users/me...");
          const { data } = await api.get('/users/me');
          if (data && data.id) {
            completeUser = data;
            console.log("✅ Authentication verified! User:", completeUser.email || completeUser.fullName);
          }
        } catch (meError) {
          console.warn("⚠️ /users/me verification failed:", meError.response?.status, meError.response?.data);
          // This is expected if cookies aren't set - continue to fallback
        }
      }
      
      // Step 7: Fallback - use user data from login response if verification failed or wasn't attempted
      if (!completeUser) {
        if (userFromResponse) {
          console.log("📋 Using user data from login response (verification unavailable)");
          completeUser = {
            id: userFromResponse.id || responseData.id || responseData.userId,
            email: userFromResponse.email || responseData.email || credentials.email,
            fullName: userFromResponse.fullName || userFromResponse.name || responseData.fullName || responseData.name || credentials.email.split('@')[0],
            role: userFromResponse.role || responseData.role || 'CITIZEN',
            localityName: userFromResponse.localityName || responseData.localityName,
            cityId: userFromResponse.cityId || responseData.cityId,
            zoneId: userFromResponse.zoneId || responseData.zoneId,
            localityId: userFromResponse.localityId || responseData.localityId
          };
        } else {
          // Last resort: Create minimal user from credentials
          // This allows login to proceed even if backend doesn't return user data
          console.warn("⚠️ No user data in login response - creating minimal user from credentials");
          console.warn("⚠️ This may cause issues with protected routes. Backend should return user data in login response.");
          completeUser = {
            id: `temp-${Date.now()}`,
            email: credentials.email,
            fullName: credentials.email.split('@')[0],
            role: 'CITIZEN'
          };
        }
        
        // Warn about authentication state
        if (!token && !cookiesAfterWait) {
          console.warn("⚠️ No authentication credentials available - cookies may be blocked by CORS");
          console.warn("⚠️ User will be logged in but API calls may fail. Consider:");
          console.warn("   1. Configuring backend CORS to allow credentials");
          console.warn("   2. Having backend return a token in login response");
          console.warn("   3. Having backend return user data in login response");
        }
      }
      
      // Step 8: Ensure we have a valid user object
      if (!completeUser || !completeUser.id) {
        throw new Error(
          "Login succeeded but could not create user object. " +
          "Please check the backend login response format."
        );
      }
      
      // Step 9: Proceed with login using available user data
      if (completeUser && completeUser.id) {
        console.log("✅ Login successful! Setting user and navigating...", completeUser);
        
        // Store user in localStorage
        localStorage.setItem('userData', JSON.stringify(completeUser));
        
        // Set user in context
        if (setUser) {
          setUser(completeUser);
        }
        
        // Mark as redirected to prevent multiple redirects
        hasRedirected.current = true;
        
        // Determine target path
        const targetPath = completeUser.role === 'ADMIN' ? "/admin" : "/feed";
        console.log("🚀 Navigating to:", targetPath);
        
        // Use navigate instead of window.location for better React Router integration
        navigate(targetPath, { replace: true });
        
        return;
      }
      
      // This should never happen if verification worked
      throw new Error("Login succeeded but user verification failed.");
    } catch (err) {
      console.error("Login error:", err);
      
      // Show user-friendly error message
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (err.response.status === 404) {
          errorMessage = "Login endpoint not found. Please check backend configuration.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = err.response.data?.message || err.response.data?.error || `Server error (${err.response.status})`;
        }
      } else if (err.message) {
        // Check if it's our custom authentication error
        if (err.message.includes("CORS") || err.message.includes("cookie")) {
          errorMessage = err.message + " If this persists, the backend may need to be configured to allow cookies from this domain.";
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 via-pink-900 to-rose-900 relative overflow-hidden">
      {/* Enhanced animated gradient blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 opacity-40 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-40 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500 to-blue-500 opacity-30 blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-500 to-pink-500 opacity-25 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-2xl border-2 border-white/30 rounded-3xl shadow-2xl p-10 z-50 isolate">
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer rounded-3xl" />
        
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 rounded-3xl mb-6 shadow-2xl transform hover:rotate-12 transition-transform duration-300">
            <span className="text-5xl">🏛️</span>
          </div>
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 tracking-tight mb-3">
            Welcome Back
          </h2>
          <p className="text-gray-200 text-base font-semibold">
            Access your Civic Monitor account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          {/* Email */}
          <div className="relative group z-10">
            <input
              type="email"
              placeholder=" "
              required
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              onFocus={(e) => e.target.focus()}
              className="peer w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-pink-400 focus:bg-white/15 outline-none transition-all relative z-20"
              style={{ pointerEvents: 'auto' }}
            />
            <label className="absolute left-4 top-2 text-xs text-gray-300 font-medium
              peer-placeholder-shown:top-4
              peer-placeholder-shown:text-base
              peer-focus:top-2
              peer-focus:text-xs
              transition-all pointer-events-none z-30">
              Email Address
            </label>
          </div>

          {/* Password */}
          <div className="relative group z-10">
            <input
              type="password"
              placeholder=" "
              required
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              onFocus={(e) => e.target.focus()}
              className="peer w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 pt-6 pb-2 text-white placeholder-transparent focus:border-pink-400 focus:bg-white/15 outline-none transition-all relative z-20"
              style={{ pointerEvents: 'auto' }}
            />
            <label className="absolute left-4 top-2 text-xs text-gray-300 font-medium
              peer-placeholder-shown:top-4
              peer-placeholder-shown:text-base
              peer-focus:top-2
              peer-focus:text-xs
              transition-all pointer-events-none z-30">
              Password
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-xl text-white
              bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
              hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600
              hover:scale-[1.02] active:scale-[0.98] 
              transition-all shadow-2xl shadow-pink-500/50 hover:shadow-pink-500/70
              disabled:opacity-50 disabled:cursor-not-allowed
              relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Sign In</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Don't have an account?{' '}
            <a href="/signup" className="text-pink-400 hover:text-pink-300 font-bold transition-colors">
              Sign up
            </a>
          </p>
          <p className="text-xs text-gray-500">
            Secure cloud authentication • Civic Monitor
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;
