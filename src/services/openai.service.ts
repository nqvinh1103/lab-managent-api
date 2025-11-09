import { GoogleGenerativeAI } from '@google/generative-ai';
import { geminiConfig } from '../config/gemini';
import { ObjectId } from 'mongodb';
import { getCollection } from '../config/database';
import { ParameterDocument } from '../models/Parameter';
import { PatientDocument } from '../models/Patient';

const genAI = new GoogleGenerativeAI(geminiConfig.apiKey);

export interface AIAssessment {
  assessment: string;
  recommendations?: Array<{
    parameter_id: string;
    parameter_name?: string;
    current_value?: number;
    reason: string; // Explanation of the abnormality, not a correction suggestion
    confidence: 'high' | 'medium' | 'low';
  }>;
  flagged_issues: string[];
  overall_status: 'normal' | 'abnormal' | 'critical';
}

export interface TestResultForAI {
  parameter_name: string;
  parameter_code: string;
  parameter_id: string;
  result_value: number;
  unit: string;
  reference_range: string;
  is_flagged: boolean;
  flag_type?: string;
}

/**
 * Format test results for AI analysis
 */
const formatTestResultsForAI = async (
  testResults: any[],
  parameters: ParameterDocument[],
  patientGender?: 'male' | 'female'
): Promise<TestResultForAI[]> => {
  const parameterMap = new Map<string, ParameterDocument>();
  parameters.forEach(p => {
    parameterMap.set(p._id.toString(), p);
  });

  return testResults.map(result => {
    const parameter = parameterMap.get(result.parameter_id.toString());
    
    // Extract reference range min/max for AI
    let referenceRangeText = result.reference_range_text || 'N/A';
    let referenceRangeMin: number | undefined;
    let referenceRangeMax: number | undefined;
    
    if (parameter?.normal_range) {
      const range = parameter.normal_range as any;
      
      // Check if gender-specific ranges exist
      if (range.male && range.female && patientGender) {
        const genderRange = patientGender === 'male' ? range.male : range.female;
        referenceRangeMin = genderRange.min;
        referenceRangeMax = genderRange.max;
        referenceRangeText = genderRange.text || `${referenceRangeMin}-${referenceRangeMax} ${parameter.unit}`;
      } else if (range.min !== undefined && range.max !== undefined) {
        referenceRangeMin = range.min;
        referenceRangeMax = range.max;
        referenceRangeText = range.text || `${referenceRangeMin}-${referenceRangeMax} ${parameter.unit}`;
      }
    }
    
    // Format reference range for AI with min/max info
    const referenceRangeInfo = referenceRangeMin !== undefined && referenceRangeMax !== undefined
      ? `${referenceRangeText} (min: ${referenceRangeMin}, max: ${referenceRangeMax})`
      : referenceRangeText;

    return {
      parameter_name: parameter?.parameter_name || 'Unknown',
      parameter_code: parameter?.parameter_code || 'UNKNOWN',
      parameter_id: result.parameter_id.toString(),
      result_value: result.result_value,
      unit: result.unit,
      reference_range: referenceRangeInfo,
      is_flagged: result.is_flagged || false,
      flag_type: result.flag_type || undefined,
    };
  });
};

/**
 * Analyze test results with Gemini AI
 */
export const analyzeTestResults = async (
  testResults: any[],
  patientInfo?: PatientDocument | null
): Promise<AIAssessment> => {
  if (!geminiConfig.apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  // Get parameters for test results
  const parameterCollection = getCollection<ParameterDocument>('parameters');
  const parameterIds = testResults.map(r => new ObjectId(r.parameter_id));
  const parameters = await parameterCollection.find({
    _id: { $in: parameterIds }
  }).toArray();

  // Format test results
  const formattedResults = await formatTestResultsForAI(testResults, parameters, patientInfo?.gender);

  // Calculate patient age if DOB is available
  let patientAge: number | undefined;
  if (patientInfo?.date_of_birth) {
    const dob = new Date(patientInfo.date_of_birth);
    const today = new Date();
    patientAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      patientAge--;
    }
  }

  // Create prompt in Vietnamese
  const systemInstruction = 'Bạn là chuyên viên xét nghiệm y tế chuyên nghiệp. Phân tích kết quả xét nghiệm và đưa ra nhận xét chính xác, ngắn gọn. QUAN TRỌNG: Trả về JSON hợp lệ, đảm bảo tất cả các chuỗi được đóng đúng cách và không bị cắt giữa chừng.';
  
  const prompt = `
Bạn là chuyên viên xét nghiệm.
Dưới đây là kết quả CBC (Complete Blood Count) của bệnh nhân:
${JSON.stringify({
  patient: {
    gender: patientInfo?.gender || 'unknown',
  },
  test_results: formattedResults,
}, null, 2)}

Hãy:
1. Phân tích các chỉ số bất thường (nếu có).
2. Đưa ra nhận xét ngắn gọn (tối đa 200 từ cho assessment, tối đa 100 từ cho mỗi reason).
3. Giải thích ý nghĩa của các giá trị bất thường và tầm quan trọng của chúng.
4. Kết luận cuối cùng: "Bình thường" hoặc "Cần xem lại".

QUAN TRỌNG:
- CHỈ phân tích và giải thích, KHÔNG đề xuất sửa đổi giá trị
- Giá trị bất thường là dấu hiệu quan trọng về sức khỏe, KHÔNG được "sửa" thành giá trị bình thường
- Nếu phát hiện giá trị bất thường, giải thích ý nghĩa y học và tầm quan trọng
- Đưa ra khuyến nghị về cách xử lý (ví dụ: "Cần xét nghiệm lại", "Cần tham khảo bác sĩ", "Theo dõi thêm")
- Giữ các lý do (reason) ngắn gọn và súc tích
- Đảm bảo JSON hợp lệ, tất cả các chuỗi phải được đóng bằng dấu ngoặc kép
- Không để JSON bị cắt giữa chừng

Trả lời bằng JSON với format sau (KHÔNG có markdown, chỉ JSON thuần):
{
  "assessment": "Nhận xét tổng quan về kết quả xét nghiệm (ngắn gọn, tối đa 200 từ)",
  "recommendations": [
    {
      "parameter_id": "id của parameter",
      "current_value": giá trị hiện tại,
      "reason": "Giải thích về giá trị bất thường và ý nghĩa y học (ngắn gọn, tối đa 100 từ)",
      "confidence": "high|medium|low"
    }
  ],
  "flagged_issues": ["Danh sách các vấn đề đáng chú ý (ngắn gọn)"],
  "overall_status": "normal|abnormal|critical"
}
`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: geminiConfig.model,
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: geminiConfig.temperature,
        maxOutputTokens: geminiConfig.maxOutputTokens,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    if (!responseText) {
      throw new Error('No response from Gemini');
    }

    // Clean the response text to handle common issues
    // Remove markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
    }
    responseText = responseText.trim();

    // Helper function to repair truncated JSON
    const repairTruncatedJSON = (jsonStr: string): string => {
      let repaired = jsonStr.trim();
      if (!repaired) return '{}';
      
      // Track string state and brackets
      let inString = false;
      let escapeNext = false;
      const stack: string[] = []; // Track opening brackets/braces
      let lastValidPosition = -1;
      
      // Scan through to find where we are in the JSON structure
      for (let i = 0; i < repaired.length; i++) {
        const char = repaired[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"') {
          inString = !inString;
          if (!inString) {
            lastValidPosition = i;
          }
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            stack.push('}');
            lastValidPosition = i;
          } else if (char === '[') {
            stack.push(']');
            lastValidPosition = i;
          } else if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) {
              stack.pop();
              lastValidPosition = i;
            }
          } else if (char === ',' || char === ':') {
            lastValidPosition = i;
          }
        }
      }
      
      // If we ended inside a string, try to close it properly
      if (inString) {
        // Find where this string started (the opening quote)
        // Walk backwards from the end to find the unescaped opening quote
        let stringStartIdx = -1;
        let foundQuotes = 0;
        for (let i = repaired.length - 1; i >= 0; i--) {
          if (repaired[i] === '"' && (i === 0 || repaired[i - 1] !== '\\')) {
            foundQuotes++;
            if (foundQuotes === 1) {
              stringStartIdx = i;
            } else {
              break; // Found the opening quote
            }
          }
        }
        
        if (stringStartIdx >= 0) {
          // We have an unterminated string starting at stringStartIdx
          // Check what comes before this string
          const beforeString = repaired.substring(0, stringStartIdx);
          const lastColon = beforeString.lastIndexOf(':');
          
          if (lastColon > 0 && lastColon > beforeString.lastIndexOf('{') && lastColon > beforeString.lastIndexOf('[')) {
            // This string is a property value (after a colon)
            // Find the property name
            const beforeColon = beforeString.substring(0, lastColon).trim();
            const propMatch = beforeColon.match(/"([^"]+)":?\s*$/);
            
            if (propMatch) {
              // Remove this incomplete property entirely
              // Find where the property starts (after comma or opening brace)
              let propStart = beforeColon.lastIndexOf(',');
              if (propStart < 0) {
                propStart = beforeColon.lastIndexOf('{');
                if (propStart < 0) {
                  propStart = beforeColon.lastIndexOf('[');
                }
              }
              
              if (propStart >= 0) {
                const beforeProp = beforeString.substring(0, propStart + (beforeString[propStart] === ',' ? 1 : 0));
                repaired = beforeProp.trim();
                // Remove trailing comma if any
                if (repaired.endsWith(',')) {
                  repaired = repaired.slice(0, -1).trim();
                }
              } else {
                // This might be the first/only property, try to close the string and remove it
                repaired = beforeColon.trim();
              }
            } else {
              // Just close the string
              repaired = beforeString + '"';
            }
          } else {
            // String is not a property value, just close it
            repaired += '"';
          }
        } else {
          // Couldn't find string start, just close it
          repaired += '"';
        }
      } else {
        // Not in a string, but might have incomplete property
        // Look for incomplete value after last colon
        const lastColonIndex = repaired.lastIndexOf(':');
        if (lastColonIndex > 0) {
          const afterColon = repaired.substring(lastColonIndex + 1).trim();
          // If the value after colon looks incomplete (not properly closed)
          if (afterColon && 
              !afterColon.match(/^(null|true|false|-?\d+\.?\d*)$/) && // not a primitive
              !afterColon.startsWith('{') && !afterColon.startsWith('[') && // not object/array
              !afterColon.startsWith('"') && // not a string
              !afterColon.match(/}$/) && !afterColon.match(/]$/) && !afterColon.match(/",?$/)) {
            // Remove the incomplete property
            const beforeColon = repaired.substring(0, lastColonIndex);
            const propMatch = beforeColon.match(/,?\s*"([^"]+)":\s*$/);
            if (propMatch) {
              repaired = beforeColon.replace(/,?\s*"([^"]+)":\s*$/, '').trim();
              // Ensure we don't leave a trailing comma
              if (repaired.endsWith(',')) {
                repaired = repaired.slice(0, -1).trim();
              }
            }
          }
        }
      }
      
      // Close all unclosed brackets/braces
      while (stack.length > 0) {
        repaired += stack.pop();
      }
      
      // Final cleanup: remove trailing commas before closing brackets/braces
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      
      return repaired.trim();
    };

    // Try to parse JSON with better error handling
    let assessment: AIAssessment;
    try {
      assessment = JSON.parse(responseText) as AIAssessment;
    } catch (parseError) {
      // Log the problematic response for debugging
      const errorPos = parseError instanceof SyntaxError && (parseError as any).position 
        ? (parseError as any).position 
        : responseText.length;
      
      console.error('Raw Gemini response:', responseText);
      console.error('Response length:', responseText.length);
      if (responseText.length > 500) {
        console.error('Response preview (first 500 chars):', responseText.substring(0, 500));
        console.error(`Response preview (around error position ${errorPos}):`, 
          responseText.substring(Math.max(0, errorPos - 100), Math.min(responseText.length, errorPos + 100)));
      } else {
        console.error('Full response:', responseText);
      }
      
      // Try to fix common JSON issues
      try {
        // Remove trailing commas before closing braces/brackets (but not inside strings)
        let cleaned = responseText.replace(/,(\s*[}\]])/g, '$1');
        assessment = JSON.parse(cleaned) as AIAssessment;
        console.log('Successfully parsed JSON after cleaning trailing commas');
      } catch (secondParseError) {
        // Try to repair truncated JSON
        try {
          const repaired = repairTruncatedJSON(responseText);
          console.log('Attempting to repair truncated JSON...');
          assessment = JSON.parse(repaired) as AIAssessment;
          console.log('Successfully parsed JSON after repair');
        } catch (repairError) {
          // If still failing, try a simpler approach: remove the last incomplete recommendation
          console.error('JSON parse error details:', parseError instanceof SyntaxError ? 
            (parseError as SyntaxError).message : 'Unknown error');
          console.error('Failed to parse JSON even after repair attempts');
          
          try {
            // Try to find the last complete recommendation and cut everything after it
            // Look for pattern: }, (end of a recommendation object)
            const lastCompleteRecMatch = responseText.lastIndexOf('},');
            if (lastCompleteRecMatch > 0) {
              // Cut at the end of the last complete recommendation
              let simplified = responseText.substring(0, lastCompleteRecMatch + 1);
              // Close the recommendations array
              if (simplified.includes('"recommendations"') && !simplified.includes(']')) {
                simplified += '\n  ]';
              }
              // Close the main object
              if (!simplified.endsWith('}')) {
                // Check if we need to add missing fields
                if (!simplified.includes('"flagged_issues"')) {
                  simplified += ',\n  "flagged_issues": []';
                }
                if (!simplified.includes('"overall_status"')) {
                  simplified += ',\n  "overall_status": "abnormal"';
                }
                simplified += '\n}';
              }
              simplified = simplified.replace(/,(\s*[}\]])/g, '$1');
              assessment = JSON.parse(simplified) as AIAssessment;
              console.log('Successfully parsed JSON after removing incomplete recommendation');
            } else {
              throw new Error('Could not find complete recommendation');
            }
          } catch (simpleRepairError) {
            // Try to extract and repair JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*/);
            if (jsonMatch) {
              try {
                let extractedJson = jsonMatch[0];
                // Clean and repair the extracted JSON
                extractedJson = extractedJson.replace(/,(\s*[}\]])/g, '$1');
                extractedJson = repairTruncatedJSON(extractedJson);
                assessment = JSON.parse(extractedJson) as AIAssessment;
                console.log('Successfully parsed extracted and repaired JSON');
              } catch (extractError) {
                // Last resort: create a minimal valid response
                console.error('Failed to parse even after extraction and repair. Creating fallback response.');
                assessment = {
                  assessment: responseText.substring(0, 500) || 'Không thể phân tích kết quả do lỗi định dạng response.',
                  recommendations: [],
                  flagged_issues: ['Lỗi khi phân tích response từ AI'],
                  overall_status: 'abnormal'
                };
                console.warn('Using fallback assessment due to JSON parsing failure');
              }
            } else {
              // No JSON found, create fallback
              console.error('No JSON object found in response');
              assessment = {
                assessment: responseText.substring(0, 500) || 'Không thể phân tích kết quả do lỗi định dạng response.',
                recommendations: [],
                flagged_issues: ['Lỗi khi phân tích response từ AI'],
                overall_status: 'abnormal'
              };
              console.warn('Using fallback assessment - no JSON structure found');
            }
          }
        }
      }
    }

    return assessment;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to analyze test results: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

