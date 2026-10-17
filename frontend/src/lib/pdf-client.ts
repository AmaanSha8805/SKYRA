import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class PDFClient {
  async downloadPDF(content: string, filename: string, type: 'cover_letter' | 'roadmap' | 'interview' | 'resume'): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authClient.getToken()) {
      headers['Authorization'] = `Bearer ${authClient.getToken()}`;
    }

    const response = await fetch(`${API_URL}/pdf/download`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        filename,
        type
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(error.detail || 'Download failed');
    }

    // Get the blob from the response
    const blob = await response.blob();
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const pdfClient = new PDFClient();
