import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Modal,
  Input,
  Select,
  Form,
  message,
  Space,
  Popconfirm,
} from "antd";
import { DownloadOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import axios from "../../utils/api";
import { saveAs } from "file-saver";
import Papa from "papaparse";

const { Option } = Select;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  const [form] = Form.useForm();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/superadmin/notifications/history");
      setNotifications(res.data.notifications);
    } catch (error) {
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/superadmin/users");
      setUserOptions(res.data.users || []);
    } catch {
      message.error("Failed to load user list");
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
    const interval = setInterval(fetchNotifications, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleSendNotification = async (values: any) => {
    try {
      await axios.post("/superadmin/notifications/send", {
        ...values,
        delay: values.delay ? parseInt(values.delay) * 1000 : 0,
      });
      message.success("Notification sent successfully");
      setSendModalVisible(false);
      fetchNotifications();
      form.resetFields();
    } catch {
      message.error("Failed to send notification");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/superadmin/notifications/${id}`);
      message.success("Notification deleted");
      fetchNotifications();
    } catch {
      message.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete(`/superadmin/notifications`);
      message.success("All notifications deleted");
      fetchNotifications();
    } catch {
      message.error("Failed to delete all notifications");
    }
  };

  const handleExportCSV = () => {
    const csvData = notifications.map((n) => ({
      Title: n.title,
      Message: n.message,
      Name: n.userId?.name,
      Email: n.userId?.email,
      Role: n.role,
      SentAt: new Date(n.createdAt).toLocaleString(),
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "notifications.csv");
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "User",
      render: (text: any, record: any) =>
        record.userId ? `${record.userId.name} (${record.userId.email})` : "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color={role === "admin" ? "volcano" : "blue"}>{role}</Tag>,
    },
    {
      title: "Status",
      render: () => <Tag color="green">Sent</Tag>,
    },
    {
      title: "Sent At",
      dataIndex: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Action",
      render: (text: any, record: any) => (
        <Popconfirm title="Delete this notification?" onConfirm={() => handleDelete(record._id)}>
          <Button danger size="small">Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">📢 Notifications</h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchNotifications}>
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button danger onClick={handleDeleteAll}>
            Delete All
          </Button>
          <Button type="primary" icon={<SendOutlined />} onClick={() => setSendModalVisible(true)}>
            Send Notification
          </Button>
        </Space>
      </div>

      <Table
        rowKey="_id"
        dataSource={notifications}
        columns={columns}
        loading={loading}
        scroll={{ x: true }}
      />

      <Modal
        title="Send Notification"
        open={sendModalVisible}
        onCancel={() => setSendModalVisible(false)}
        onOk={() => form.submit()}
        okText="Send"
      >
        <Form layout="vertical" form={form} onFinish={handleSendNotification}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Enter message" />
          </Form.Item>

          <Form.Item name="role" label="Send To" rules={[{ required: true }]}>
            <Select placeholder="Choose audience" onChange={(val) => val !== "specific" && form.setFieldValue("userIds", [])}>
              <Option value="all">All Users & Admins</Option>
              <Option value="user">Users</Option>
              <Option value="admin">Admins</Option>
              <Option value="specific">Specific Users</Option>
            </Select>
          </Form.Item>

          {form.getFieldValue("role") === "specific" && (
            <Form.Item name="userIds" label="Select Users" rules={[{ required: true }]}>
              <Select mode="multiple" placeholder="Choose specific users">
                {userOptions.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item name="delay" label="Delay (seconds)">
            <Input type="number" min={0} placeholder="Optional: delay in seconds" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
