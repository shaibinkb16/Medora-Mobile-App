import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Use the custom hook

const PendingApproval = () => {
  const { user, logout } = useAuth(); // ✅ No more TS error!
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-50 px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-semibold text-yellow-700 mb-4">
          Account Pending Approval
        </h1>

        <p className="text-gray-600 mb-6">
          Hello <span className="font-medium">{user?.name}</span>, your admin account is currently under review by a superadmin.
          Once approved, you'll get access to the admin dashboard.
        </p>

        <button
          onClick={handleLogout}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;
