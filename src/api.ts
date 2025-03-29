import axios from 'axios';

export async function checkVulnerabilities(code: string): Promise<any> {
  try {
    const response = await axios.post('http://127.0.0.1:8000/analyze', { code });
    return response.data;
  } catch (error) {
    return "error";
  }
}
