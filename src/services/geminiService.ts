import { GoogleGenAI, Type } from "@google/genai";
import { Promotion } from "../types";

const getGenAI = (customKey?: string) => {
  const apiKey = customKey || process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Please set it in Settings.");
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
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
  }, history: string[], customKey?: string): Promise<string> {
    const ai = getGenAI(customKey);
    const historyContext = history.length > 0 
      ? `\nLịch sử phân tích các ngày trước để bạn nắm được tiến độ (Tham khảo):\n${history.join('\n---\n')}\n`
      : "";

    const prompt = `Bạn là một trợ lý phân tích KPI cho trình dược viên. Hãy phân tích các số liệu sau và đưa ra nhận xét:
    ${historyContext}
    Số liệu hiện tại:
    - Doanh số thực tế: ${data.totalSales} / Mục tiêu: ${data.targetSales} (${((data.totalSales / data.targetSales) * 100).toFixed(1)}%)
    - Độ phủ thực tế: ${data.totalCoverage} / Mục tiêu: ${data.targetCoverage} (${((data.totalCoverage / data.targetCoverage) * 100).toFixed(1)}%)
    - Số ngày làm việc đã qua: ${data.daysPassed} / Tổng: ${data.totalWorkingDays}
    - Số ngày còn lại: ${data.daysRemaining}
    
    Yêu cầu:
    1. Nhận xét ngắn gọn về hiệu suất hiện tại.
    2. Cảnh báo nguy cơ không đạt KPI (nếu có).
    3. Đề xuất hành động cụ thể để cải thiện.
    4. Trình bày bằng tiếng Việt, thân thiện, súc tích.
    
    Lưu ý: Bạn không cần tính toán lại các số liệu trên, hãy dùng chúng để phân tích.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Không thể thực hiện phân tích lúc này.";
  }
};
