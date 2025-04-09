import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import axios from "axios";
  import { jwtDecode } from "jwt-decode";
  import { useNavigate } from "react-router-dom";
  
  interface DecodedToken {
    id: string;
    name: string;
    email: string;
    role: "admin" | "superadmin" | "user";
    isAdminVerified: boolean;
    exp: number;
  }
  
  interface UserProfile extends Omit<DecodedToken, "exp"> {}
  
  interface AuthContextType {
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  }
  
  const API_URL = "http://192.168.162.200:5000/api";
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
  });
  
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(
      localStorage.getItem("admin_token")
    );
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const isExpired = decoded.exp * 1000 < Date.now();
  
          if (isExpired) {
            handleLogout();
          } else {
            const { exp, ...userInfo } = decoded;
            setUser(userInfo);
            authAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Invalid token:", error);
          handleLogout();
        }
      }
      setIsLoading(false);
    }, [token]);
  
    const login = async (email: string, password: string) => {
      try {
        setIsLoading(true);
        const res = await authAxios.post("/admin/login", { email, password });
        const { token } = res.data;
  
        localStorage.setItem("admin_token", token);
        setToken(token);
        authAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
        const decoded = jwtDecode<DecodedToken>(token);
        const { exp, ...userInfo } = decoded;
        setUser(userInfo);
  
        if (userInfo.role === "admin" && !userInfo.isAdminVerified) {
          navigate("/pending-approval");
        } else {
          navigate("/dashboard");
        }
      } catch (err: any) {
        console.error("Login failed:", err);
        throw new Error(err?.response?.data?.message || "Login failed");
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleLogout = () => {
      localStorage.removeItem("admin_token");
      setToken(null);
      setUser(null);
      delete authAxios.defaults.headers.common["Authorization"];
      navigate("/login");
    };
  
    return (
      <AuthContext.Provider
        value={{
          isAuthenticated: !!user,
          user,
          token,
          isLoading,
          login,
          logout: handleLogout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
  