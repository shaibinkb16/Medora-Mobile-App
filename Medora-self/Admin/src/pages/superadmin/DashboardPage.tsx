import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../hooks/useToast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { showToast } = useToast();
  const COLORS = ["#6366F1", "#F59E0B", "#10B981"];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          axios.get("/superadmin/dashboard/stats"),
          axios.get("/superadmin/dashboard/recent-users")
        ]);
        
        setStats(statsRes.data);
        setRecentUsers(recentRes.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        showToast("Failed to load dashboard data", "error");
      }
    };
    
    fetchData();
  }, []);

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/superadmin/users/${id}`);
      setRecentUsers(prev => prev.filter(u => u._id !== id));
      showToast("User deleted successfully", "success");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete user", "error");
    }
  };

  const toggleUserStatus = async (id: string, status: string) => {
    try {
      const newStatus = status === "active" ? "blocked" : "active";
      await axios.put(`/superadmin/users/${id}/status`, { status: newStatus });
      setRecentUsers(prev =>
        prev.map(u => u._id === id ? { ...u, status: newStatus } : u)
      );
      showToast(`User ${newStatus} successfully`, "success");
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("Failed to update user status", "error");
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <motion.h1 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
          >
            Admin Dashboard
          </motion.h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>

        {/* Stats Grid */}
        {!stats ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <StatCard 
              label="Total Users" 
              value={stats.totalUsers}
              isDarkMode={isDarkMode}
              variants={itemVariants}
            />
            <StatCard 
              label="Total Records" 
              value={stats.totalRecords}
              isDarkMode={isDarkMode}
              variants={itemVariants}
            />
            <StatCard 
              label="Total Predictions" 
              value={stats.totalPredictions}
              isDarkMode={isDarkMode}
              variants={itemVariants}
            />
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-xl`}
          >
            <h3 className="text-xl font-semibold mb-4">User Growth</h3>
            <div className="h-64">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth}>
                    <XAxis 
                      dataKey="month" 
                      stroke={isDarkMode ? '#fff' : '#64748b'} 
                    />
                    <YAxis 
                      allowDecimals={false} 
                      stroke={isDarkMode ? '#fff' : '#64748b'} 
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#1e293b' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#6366F1" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : <Skeleton height={256} />}
            </div>
          </motion.div>

          {/* Gender Distribution Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-3xl backdrop-blur-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-xl`}
          >
            <h3 className="text-xl font-semibold mb-4">Gender Distribution</h3>
            <div className="h-64">
              {stats ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.genderDistribution}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                      animationDuration={500}
                    >
                      {stats.genderDistribution.map((_entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#1e293b' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Skeleton height={256} />}
            </div>
          </motion.div>
        </div>

        {/* Recent Users Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} shadow-xl`}
        >
          <h3 className="text-xl font-semibold mb-6">Recent Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`text-left ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <tr>
                  {['Name', 'Email', 'Gender', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {recentUsers.map((user) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/20' : 'border-gray-100 hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3 capitalize">{user.gender || "N/A"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            user.status === "active"
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          onClick={() => toggleUserStatus(user._id, user.status)}
                        >
                          {user.status === "active" ? "Block" : "Unblock"}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          onClick={() => deleteUser(user._id)}
                        >
                          Delete
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {recentUsers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No recent users found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, isDarkMode, variants }: any) => (
  <motion.div
    variants={variants}
    className={`p-6 rounded-2xl backdrop-blur-lg shadow-lg ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-white'
    } transition-all duration-300 hover:shadow-xl`}
  >
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {label}
    </p>
    <h2 className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {value.toLocaleString()}
    </h2>
    <div className="mt-3 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
  </motion.div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
    {[...Array(3)].map((_, i) => (
      <Skeleton key={i} height={120} className="rounded-2xl" />
    ))}
  </div>
);

export default Dashboard;