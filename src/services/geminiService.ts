import { GoogleGenAI, Type } from "@google/genai";
import { Promotion, KpiEntry } from "../types";

const getGenAI = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Please set it in Settings.");
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async extractKpiFromCsv(csvText: string, employeeName: string, customKey?: string): Promise<KpiEntry[]> {
    const ai = getGenAI(customKey);
    const prompt = `Dưới đây là file dữ liệu KPI chung (định dạng CSV) của team Miền Tây 2.
    Bạn hãy lọc và rút trích độc lập CHỈ CÁC DÒNG dữ liệu liên quan đến nhân viên "${employeeName}".
    Dữ liệu cần trả về là một mảng JSON theo định dạng sau (chỉ trả về JSON Array, KHÔNG kèm giải thích thêm):
    [
      { "date": "YYYY-MM-DD", "sales": 1000000, "coverage": 5 }
    ]
    
    Yêu cầu:
    - Tìm đúng tên nhân viên (có thể viết hoa/thường, không dấu).
    - Cột nào tương ứng với "Ngày" (Date), cột nào tương ứng với "Doanh số" (Sales/Doanh thu), cột nào tương ứng với "Độ phủ" (Coverage / Phủ điểm / PC).
    - Đảm bảo sales và coverage phải là kiểu [number].
    
    Dữ liệu CSV gốc:
    ${csvText.substring(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              sales: { type: Type.NUMBER },
              coverage: { type: Type.NUMBER }
            },
            required: ["date", "sales", "coverage"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  },

  async extractKpiTargetsFromCsv(csvText: string, employeeName: string, customKey?: string): Promise<{name: string, target: number}[]> {
    if (!csvText.trim()) return [];
    const ai = getGenAI(customKey);
    const prompt = `Dưới đây là file dữ liệu KPI (Tab CHỈ TIÊU định dạng CSV) của team.
    Bạn hãy lọc và rút trích độc lập CHỈ CÁC CHỈ TIÊU liên quan đến nhân viên "${employeeName}".
    Thường một nhân viên sẽ có 2 đến 5 chỉ tiêu (như doanh số, độ phủ, khách hàng mới, v.v.).
    Dữ liệu cần trả về là một mảng JSON theo định dạng sau (chỉ trả về JSON Array, KHÔNG kèm giải thích thêm):
    [
      { "name": "Doanh số", "target": 1000000 },
      { "name": "Độ phủ", "target": 5 }
    ]
    
    Yêu cầu:
    - Tìm đúng tên nhân viên "${employeeName}" (có thể viết hoa/thường, không dấu).
    - name: Tên chỉ tiêu, target: Mục tiêu bằng số.
    - Đảm bảo target là numeric type.
    
    Dữ liệu CSV gốc:
    ${csvText.substring(0, 8000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              target: { type: Type.NUMBER }
            },
            required: ["name", "target"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  },

  async extractPromotions(text: string, customKey?: string): Promise<Promotion[]> {
    const ai = getGenAI(customKey);
    const prompt = `Trích xuất thông tin chương trình khuyến mãi từ văn bản dưới đây. 
    Trả về một mảng JSON các đối tượng khuyến mãi với các trường:
    - name (string: tên chương trình)
    - products (array of string: danh sách sản phẩm)
    - conditions (string: điều kiện tham gia)
    - startDate (string: ISO Date)
    - endDate (string: ISO Date)
    
    Văn bản:
    ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              products: { type: Type.ARRAY, items: { type: Type.STRING } },
              conditions: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
            },
            required: ["name", "products", "conditions", "startDate", "endDate"],
          },
        },
      },
    });

    const result = JSON.parse(response.text || "[]");
    return result.map((p: any) => ({
      ...p,
      id: Math.random().toString(36).substr(2, 9)
    }));
  },

  async analyzePerformance(data: {
    totalSales: number;
    targetSales: number;
    totalCoverage: number;
    targetCoverage: number;
    daysPassed: number;
    daysRemaining: number;
    totalWorkingDays: number;
    userProfile?: { name: string; region: string; experience: string };
    kpiItems?: KpiItem[];
  }, history: string[], customKey?: string): Promise<string> {
    const ai = getGenAI(customKey);
    const historyContext = history.length > 0 
      ? `\nLịch sử phân tích các ngày trước để bạn nắm được tiến độ (Tham khảo):\n${history.join('\n---\n')}\n`
      : "";

    const userContext = data.userProfile 
      ? `Trình dược viên: ${data.userProfile.name}, Khu vực: ${data.userProfile.region}, Kinh nghiệm: ${data.userProfile.experience}.` 
      : "";

    const kpiItemsContext = data.kpiItems && data.kpiItems.length > 0
      ? `\nChi tiết các chỉ tiêu (Tab 2 - rất quan trọng để tính lương KPI):\n${data.kpiItems.map(k => `- ${k.name}: Đạt ${k.actual} / Mục tiêu ${k.target} (${((k.actual/k.target)*100).toFixed(1)}%)`).join('\n')}`
      : "";

    const prompt = `Bạn là một chuyên gia tư vấn chiến lược KPI cho trình dược viên Nam Dược. Hãy phân tích các số liệu sau và đưa ra nhận xét cá nhân hóa:
    ${userContext}
    ${historyContext}
    Số liệu hiện tại (Tổng quan):
    - Doanh số thực tế: ${data.totalSales} / Mục tiêu: ${data.targetSales} (${data.targetSales ? ((data.totalSales / data.targetSales) * 100).toFixed(1) : 0}%)
    - Độ phủ thực tế: ${data.totalCoverage} / Mục tiêu: ${data.targetCoverage} (${data.targetCoverage ? ((data.totalCoverage / data.targetCoverage) * 100).toFixed(1) : 0}%)
    - Số ngày làm việc đã qua: ${data.daysPassed} / Tổng: ${data.totalWorkingDays}
    - Số ngày còn lại: ${data.daysRemaining}
    ${kpiItemsContext}

    Yêu cầu:
    1. Nhận xét ngắn gọn, sắc sảo (dưới 150 từ).
    2. Tập trung phân tích sâu vào các chỉ tiêu chi tiết (Tab 2) vì đây là các yếu tố quyết định lương KPI.
    3. Nếu tiến độ chỉ tiêu nào đang chậm so với thời gian (Tiến độ thời gian là ${(data.daysPassed / data.totalWorkingDays * 100).toFixed(1)}%), hãy cảnh báo và gợi ý giải pháp.
    4. Luôn giữ tinh thần hỗ trợ và thúc đẩy năng lượng tích cực cho Sales.
    
    Lưu ý: Bạn không cần tính toán lại các số liệu trên, hãy dùng chúng để phân tích.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Không thể thực hiện phân tích lúc này.";
  }
};
