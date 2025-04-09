import axios from "axios";

const LOCAL_API = "http://192.168.162.200:5000/api";

export async function fetchExtractedData(recordId: string, token: string): Promise<{
  extractedMetrics: {
    bloodPressure: string | null;
    bloodSugar: number | null;
    cholesterol: number | null;
  };
  rawText: string;
}> {
  if (!/^[0-9a-fA-F]{24}$/.test(recordId)) {
    throw new Error("Invalid record ID format");
  }

  try {
    const { data } = await axios.get(
      `${LOCAL_API}/records/${recordId}/ocr`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return {
      extractedMetrics: {
        bloodPressure: data.extractedMetrics?.bloodPressure ?? null,
        bloodSugar: data.extractedMetrics?.bloodSugar ?? null,
        cholesterol: data.extractedMetrics?.cholesterol ?? null,
      },
      rawText: data.extractedText || ''
    };
  } catch (error: any) {
    console.error("OCR Fetch Error:", {
      url: `${LOCAL_API}/records/${recordId}/ocr`,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(
      error.response?.data?.error || 
      `Failed to fetch health data: ${error.message}`
    );
  }
}

export async function fetchUserRecords(token: string): Promise<Array<{
  id: string;
  category: string;
  description: string;
  createdAt: string;
  metrics: Record<string, any>;
  imageUrl?: any;
}>> {
  try {
    const { data } = await axios.get(
      `${LOCAL_API}/records`,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data.records?.map((record: any) => ({
      id: record._id,
      category: record.category,
      description: record.description,
      createdAt: record.createdAt,
      metrics: record.ocrData?.extractedMetrics || {},
      imageUrl: record.imageUrl
    })) || [];
  } catch (error) {
    console.error("Records Fetch Error:", error);
    throw new Error("Failed to load medical records");
  }
}