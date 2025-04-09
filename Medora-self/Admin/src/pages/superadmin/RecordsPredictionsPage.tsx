import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Tag,
  DatePicker,
  Select,
  Input,
  Space,
  message,
  Popconfirm,
  Tooltip,
  Image,
  Spin,
  Alert
} from "antd";
import axios from "../../utils/api";
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface RecordItem {
  _id: string;
  userId: User;
  familyMember?: string;
  category: string;
  labName: string;
  description: string;
  condition: string;
  emergencyUse: boolean;
  tags: string[];
  imageUrl: string;
  doctor: string;
  createdAt: string;
  flagged?: boolean;
}

interface OCRResult {
  extractedText: string;
  extractedMetrics: Record<string, string | number | null>;
}

interface PredictionResult {
  bloodSugar: string;
  bloodPressure: string;
  cholesterol: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data: T;
}

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dateRange: [null, null] as [Dayjs | null, Dayjs | null],
  });

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchRecords = async (page = 1, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const { search, category, dateRange } = filters;
      const params: Record<string, any> = {
        page,
        pageSize,
        search: search.trim(),
        category,
      };

      if (dateRange?.length === 2 && dateRange[0] && dateRange[1]) {
        params.dateFrom = dateRange[0].startOf("day").toISOString();
        params.dateTo = dateRange[1].endOf("day").toISOString();
      }

      const response = await axios.get("/superadmin/records", { params });
      
      if (response.data && Array.isArray(response.data.data)) {
        setRecords(response.data.data);
        setPagination({
          current: page,
          pageSize,
          total: response.data.total || response.data.data.length
        });
      } else {
        console.error("Unexpected API response structure:", response.data);
        message.error("Unexpected data format received from server");
      }
    } catch (error: any) {
      console.error("Error fetching records:", error);
      message.error(error.response?.data?.message || "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(pagination.current, pagination.pageSize);
  }, [filters]);

  const applyFilters = () => {
    fetchRecords(1, pagination.pageSize);
  };

  const resetModal = () => {
    setSelectedRecord(null);
    setOcrResult(null);
    setPredictionResult(null);
    setError(null);
  };

  const viewDetails = async (record: RecordItem) => {
    setModalLoading(true);
    setSelectedRecord(record);
    setOcrResult(null);
    setPredictionResult(null);
    setError(null);
    
    try {
      const [ocrRes, predRes] = await Promise.allSettled([
        axios.get(`/superadmin/records/${record._id}/ocr`),
        axios.get(`/superadmin/records/${record._id}/prediction`),
      ]);

      // Handle OCR response
      if (ocrRes.status === "fulfilled") {
        const ocrData = ocrRes.value.data;
        if (ocrData && ocrData.data) {
          setOcrResult({
            extractedText: ocrData.data.extractedText || "",
            extractedMetrics: ocrData.data.extractedMetrics || {}
          });
        } else {
          message.warning("OCR data format is incorrect");
          setOcrResult({
            extractedText: "No text extracted",
            extractedMetrics: {}
          });
        }
      } else {
        message.warning("Failed to load OCR data");
        setOcrResult({
          extractedText: "Failed to load OCR data",
          extractedMetrics: {}
        });
      }

      // Handle Prediction response
      if (predRes.status === "fulfilled") {
        const predData = predRes.value.data;
        if (predData && predData.data) {
          setPredictionResult({
            bloodSugar: String(predData.data.bloodSugar || "N/A"),
            bloodPressure: String(predData.data.bloodPressure || "N/A"),
            cholesterol: String(predData.data.cholesterol || "N/A")
          });
        } else {
          message.warning("Prediction data format is incorrect");
          setPredictionResult({
            bloodSugar: "N/A",
            bloodPressure: "N/A",
            cholesterol: "N/A"
          });
        }
      } else {
        message.warning("Failed to load prediction data");
        setPredictionResult({
          bloodSugar: "N/A",
          bloodPressure: "N/A",
          cholesterol: "N/A"
        });
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Failed to load record details");
      message.error("Failed to load record details");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/superadmin/records/${id}`);
      message.success("Record deleted");
      const newTotal = pagination.total - 1;
      const lastPage = Math.ceil(newTotal / pagination.pageSize);
      const currentPage = Math.min(pagination.current, lastPage || 1);
      fetchRecords(currentPage, pagination.pageSize);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  const handleFlagToggle = async (id: string) => {
    try {
      const { data } = await axios.patch(`/superadmin/records/${id}/flag`);
      setRecords((prev) =>
        prev.map((record) =>
          record._id === id ? { ...record, flagged: data.flagged } : record
        )
      );
      message.success(`Record ${data.flagged ? "flagged" : "unflagged"} successfully`);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Failed to update flag status");
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "userId",
      key: "user",
      render: (user: User) => (
        <Tooltip title={`Phone: ${user?.phone || "N/A"}`}>
          <div className="min-w-[160px]">
            <div className="font-semibold truncate">{user?.name}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Family Member",
      dataIndex: "familyMember",
      key: "familyMember",
      render: (text: string) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Doctor",
      dataIndex: "doctor",
      key: "doctor",
      ellipsis: true,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a: RecordItem, b: RecordItem) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Flagged",
      dataIndex: "flagged",
      key: "flagged",
      render: (flagged: boolean) => (
        <Tag color={flagged ? "red" : "green"}>{flagged ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 200,
      render: (_: any, record: RecordItem) => (
        <Space>
          <Button onClick={() => viewDetails(record)}>View</Button>
          <Popconfirm
            title="Delete this record?"
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          <Button
            onClick={() => handleFlagToggle(record._id)}
            type="dashed"
            danger={record.flagged}
          >
            {record.flagged ? "Unflag" : "Flag"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Medical Records Management</h1>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Space wrap size={[16, 16]} className="w-full">
            <Input.Search
              placeholder="Search patients..."
              allowClear
              enterButton
              value={filters.search}
              onSearch={applyFilters}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="min-w-[300px]"
            />
            <Select
              placeholder="Category"
              allowClear
              onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
              className="min-w-[200px]"
              value={filters.category || undefined}
            >
              <Option value="Lab Report">Lab Report</Option>
              <Option value="Prescription">Prescription</Option>
              <Option value="Doctor Note">Doctor Note</Option>
              <Option value="Imaging">Imaging</Option>
              <Option value="Medical Expense">Medical Expense</Option>
            </Select>
            <RangePicker
              format="YYYY-MM-DD"
              value={filters.dateRange}
              onChange={(dates) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: dates ? [dates[0], dates[1]] : [null, null],
                }))
              }
              className="min-w-[300px]"
            />
            <Button type="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
          </Space>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Table
            dataSource={records}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) => `Total ${total} records`,
              onChange: (page, pageSize) => fetchRecords(page, pageSize),
            }}
            scroll={{ x: 1300 }}
            bordered
          />
        </div>

        <Modal
          open={!!selectedRecord}
          title="Record Details"
          onCancel={resetModal}
          footer={[
            <Button key="close" onClick={resetModal}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {modalLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <Alert message={error} type="error" showIcon className="mb-4" />
              )}

              <div>
                <h3 className="text-lg font-semibold">Record Information</h3>
                <p><strong>Description:</strong> {selectedRecord?.description}</p>
                <p><strong>Doctor:</strong> {selectedRecord?.doctor || "N/A"}</p>
                <p><strong>Category:</strong> {selectedRecord?.category}</p>
                <p><strong>Tags:</strong> {selectedRecord?.tags?.join(", ") || "N/A"}</p>
                <p><strong>Emergency Use:</strong> {selectedRecord?.emergencyUse ? "Yes" : "No"}</p>
                {selectedRecord?.imageUrl && (
                  <div className="mt-2">
                    <Image width={200} src={selectedRecord.imageUrl} alt="Record Image" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold">OCR Extracted Data</h3>
                {ocrResult ? (
                  <>
                    <p><strong>Extracted Text:</strong></p>
                    <div className="bg-gray-100 p-2 rounded max-h-40 overflow-auto">
                      <pre className="whitespace-pre-wrap">{ocrResult.extractedText}</pre>
                    </div>
                    <div className="mt-2">
                      <p><strong>Extracted Metrics:</strong></p>
                      <ul className="list-disc list-inside">
                        {Object.entries(ocrResult.extractedMetrics || {}).map(([key, value]) => (
                          <li key={key}>
                            {key}: {value !== null ? String(value) : "N/A"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 italic">No OCR data available.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold">Prediction Results</h3>
                {predictionResult ? (
                  <ul className="list-disc list-inside">
                    <li>Blood Sugar: {predictionResult.bloodSugar}</li>
                    <li>Blood Pressure: {predictionResult.bloodPressure}</li>
                    <li>Cholesterol: {predictionResult.cholesterol}</li>
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No prediction data available.</p>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default RecordsPage;