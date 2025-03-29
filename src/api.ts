import axios from 'axios';

export async function checkVulnerabilities(code: string): Promise<any> {
  try {
    const response = await axios.post('http://127.0.0.1:8000/analyze', { code });
    return response.data;
  } catch (error) {
    return "error";
  }
}

export async function getComplexity(code: string): Promise<any> {
  try {
    const response = await axios.post('http://127.0.0.1:8000/complexity', { code });
    return response.data;
  } catch (error) {
    return "error";
  }
}

export async function refactorCode(code: string): Promise<string | null> {
  try {
    const response = await axios.post('http://127.0.0.1:8000/refactor', { code });
    return response.data.optimized_code;
  } catch (error) {
    return null;
  }
}
