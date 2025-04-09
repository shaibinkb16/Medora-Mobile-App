import React, { useEffect, useState, useCallback, ReactNode } from "react";
import axios from "../../utils/api";
import {
  Button,
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Descriptions,
  message,
  Popconfirm,
  Skeleton,
  Tabs,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { User, UserRole, UserStatus } from "../../types/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import debounce from "lodash.debounce";
import * as XLSX from "xlsx";

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;

dayjs.extend(relativeTime);

interface UserData extends Omit<User, "phone" | "address"> {
  key: string;
  phone: ReactNode;
  recordsCount: number;
  predictionsCount: number;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/superadmin/users", {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchQuery,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });

      const usersWithCounts: UserData[] = await Promise.all(
        response.data.users.map(async (user: User) => {
          const [recordsRes, predictionsRes] = await Promise.all([
            axios.get(`/superadmin/users/${user._id}/records/count`),
            axios.get(`/superadmin/users/${user._id}/predictions/count`),
          ]);

          return {
            ...user,
            key: user._id,
            recordsCount: recordsRes.data.count,
            predictionsCount: predictionsRes.data.count,
            phone: user.phoneNumber || "—",
          };
        })
      );

      setUsers(usersWithCounts);
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalCount,
      }));
    } catch (error) {
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await axios.put(`/superadmin/users/${userId}/status`, {
        status: newStatus,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, status: newStatus } : u
        )
      );
      message.success(`User status updated to ${newStatus}`);
    } catch {
      message.error("Failed to update status.");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axios.put(`/superadmin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole as UserRole } : u))
      );
      message.success("Role updated");
    } catch {
      message.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`/superadmin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      message.success("User deleted successfully.");
    } catch {
      message.error("Failed to delete user.");
    }
  };

  const showDeleteConfirm = (userId: string) => {
    confirm({
      title: "Are you sure you want to delete this user?",
      icon: <ExclamationCircleFilled />,
      content: "This will remove all associated data.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDeleteUser(userId),
    });
  };

  const handleExport = () => {
    const exportData = users.map(({ name, email, phoneNumber, status, role }) => ({
      Name: name,
      Email: email,
      Phone: phoneNumber || "",
      Status: status,
      Role: role,
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Users.xlsx");
  };

  const handleBulkDelete = () => {
    selectedRowKeys.forEach((id) => handleDeleteUser(id.toString()));
    setSelectedRowKeys([]);
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500),
    []
  );

  const columns: ColumnsType<UserData> = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phoneNumber" },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      render: (dob) =>
        dob ? dayjs(dob).format("DD/MM/YYYY") : "—",
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record._id, value)}
          style={{ width: 100 }}
        >
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: UserStatus) => (
        <Tag color={status === "active" ? "green" : status === "blocked" ? "red" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setSelectedUser(record)}>Details</Button>
          <Select
            value={record.status}
            onChange={(value) => handleStatusChange(record._id, value)}
            style={{ width: 120 }}
          >
            <Option value="active">Active</Option>
            <Option value="blocked">Blocked</Option>
            <Option value="pending">Pending</Option>
          </Select>
          <Popconfirm
            title="Delete user?"
            onConfirm={() => showDeleteConfirm(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex gap-4 flex-wrap">
        <Search
          placeholder="Search users..."
          allowClear
          enterButton
          onChange={(e) => debouncedSearch(e.target.value)}
          className="max-w-md"
        />
        <Button icon={<DownloadOutlined />} onClick={handleExport}>Export</Button>
        <Button danger disabled={!selectedRowKeys.length} onClick={handleBulkDelete}>
          Delete Selected
        </Button>
      </div>

      <Tabs
        defaultActiveKey="all"
        onChange={(key: string) => {
          setStatusFilter(key as "all" | UserStatus);
          setPagination((prev) => ({ ...prev, current: 1 }));
        }}
      >
        <TabPane tab="All Users" key="all" />
        <TabPane tab="Active Users" key="active" />
        <TabPane tab="Blocked Users" key="blocked" />
        <TabPane tab="New Users" key="pending" />
      </Tabs>

      <Table
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }),
        }}
        scroll={{ x: true }}
      />

      <UserDetailsModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

interface UserDetailsModalProps {
  user: UserData | null;
  onClose: () => void;
  onStatusChange: (userId: string, newStatus: UserStatus) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onStatusChange,
}) => {
  const [currentStatus, setCurrentStatus] = useState<UserStatus>("active");

  useEffect(() => {
    if (user) setCurrentStatus(user.status);
  }, [user]);

  const handleSave = () => {
    if (user && currentStatus !== user.status) {
      onStatusChange(user._id, currentStatus);
    }
    onClose();
  };

  return (
    <Modal
      title="User Details"
      open={!!user}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Close</Button>,
        <Button key="save" type="primary" onClick={handleSave}>Save Changes</Button>,
      ]}
      width={800}
    >
      {user ? (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Name">{user.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{user.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="DOB">{user.dateOfBirth ? dayjs(user.dateOfBirth).format("DD/MM/YYYY") : "—"}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
          <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
          <Descriptions.Item label="Joined">{dayjs(user.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
          <Descriptions.Item label="Last Login">{user.lastLogin ? dayjs(user.lastLogin).fromNow() : "Never"}</Descriptions.Item>
          <Descriptions.Item label="Records">{user.recordsCount}</Descriptions.Item>
          <Descriptions.Item label="Predictions">{user.predictionsCount}</Descriptions.Item>
        </Descriptions>
      ) : (
        <Skeleton active />
      )}
    </Modal>
  );
};

export default UsersPage;
