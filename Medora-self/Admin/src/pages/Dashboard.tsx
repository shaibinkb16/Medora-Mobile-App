import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  FiUsers,
  FiActivity,
  FiShield,
  FiClock,
  FiMenu,
} from "react-icons/fi";
import API from "../utils/api";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [notifications, setNotifications] = useState<any[]>([]);

  const colors = {
    primary: "#6366f1",
    secondary: "#4f46e5",
    accent: "#a855f7",
    background: "#f8fafc",
    text: "#0f172a",
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await API.get("/admin/dashboard-stats");
        const notifsRes = await API.get("/admin/notifications");

        setStats({
          ...statsRes.data,
          userGrowth: [
            { date: "2025-01", count: 200 },
            { date: "2025-02", count: 300 },
            { date: "2025-03", count: 400 },
            { date: "2025-04", count: 500 },
          ],
          activityData: [
            { date: "2025-04-01", count: 40 },
            { date: "2025-04-02", count: 60 },
            { date: "2025-04-03", count: 50 },
            { date: "2025-04-04", count: 70 },
          ],
          roleDistribution: [
            { name: "Users", value: statsRes.data.totalUsers },
            { name: "Admins", value: statsRes.data.admins },
            { name: "Pending", value: statsRes.data.pendingAdmins },
          ],
        });

        setNotifications(notifsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number | React.ReactNode;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>
            {value}
          </p>
        </div>
        <div style={{ backgroundColor: `${color}20` }} className="p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="lg:hidden p-4 bg-white shadow-sm flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <FiMenu className="text-2xl" />
        </button>
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </header>

      <aside
        className={`lg:w-64 fixed h-screen bg-white shadow-lg transform lg:translate-x-0 transition-transform z-20 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <FiShield className="text-purple-500" /> Admin
          </h2>
          <nav className="space-y-3">
            {['Dashboard', 'Users', 'Notifications'].map((item) => (
              <button
                key={item}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 text-gray-600 hover:text-purple-600 transition-colors"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="lg:ml-64 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 0}
            icon={<FiUsers className="text-xl" style={{ color: colors.primary }} />}
            color={colors.primary}
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers || 0}
            icon={<FiActivity className="text-xl" style={{ color: colors.accent }} />}
            color={colors.accent}
          />
          <StatCard
            title="Verified Admins"
            value={stats.admins || 0}
            icon={<FiShield className="text-xl" style={{ color: colors.secondary }} />}
            color={colors.secondary}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingAdmins || 0}
            icon={<FiClock className="text-xl" style={{ color: "#f59e0b" }} />}
            color="#f59e0b"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.userGrowth}>
                  <Line type="monotone" dataKey="count" stroke={colors.primary} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">User Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityData}>
                  <Bar dataKey="count" fill={colors.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Notifications</h3>
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.message || notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.roleDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {stats.roleDistribution?.map((_entry: any, index: number) => (
                      <Cell
                        key={index}
                        fill={[colors.primary, colors.accent, colors.secondary][index % 3]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;