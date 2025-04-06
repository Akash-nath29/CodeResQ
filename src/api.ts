import axios from 'axios';

export async function checkVulnerabilities(code: string): Promise<any> {
  try {
    const response = await axios.post('https://akash-nath29-web--8000.prod1.defang.dev/analyze', { code });
    return response.data;
  } catch (error) {
    return "error";
  }
}

export async function getComplexity(code: string): Promise<any> {
  try {
    const response = await axios.post('https://akash-nath29-web--8000.prod1.defang.dev/complexity', { code });
    return response.data;
  } catch (error) {
    return "error";
  }
}

export async function refactorCode(code: string): Promise<string | null> {
  try {
    const response = await axios.post('https://akash-nath29-web--8000.prod1.defang.dev/refactor', { code });
    return response.data.optimized_code;
  } catch (error) {
    return null;
  }
}
