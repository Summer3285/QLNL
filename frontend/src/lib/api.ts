const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('nexnova_auth_token');
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; errors?: any[] }> {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('nexnova_auth_token');
          localStorage.removeItem('nexnova_auth_user');
          window.location.href = '/login';
        }
      }

      const data = await response.json();

      if (!response.ok) {
        let msg = data.message || 'Yêu cầu máy chủ thất bại.';
        if (data.errors && Array.isArray(data.errors)) {
          const details = data.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
          if (details) msg += ` (${details})`;
        }
        throw new Error(msg);
      }

      return data;
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // File download helper (PDF payslip)
  async downloadFile(endpoint: string, fallbackFileName: string): Promise<void> {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể tải tệp tin.');
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('content-disposition');
    let fileName = fallbackFileName;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    // Check if running in Electron Desktop App
    if (typeof window !== 'undefined' && (window as any).electronAPI?.savePdfFile) {
      const arrayBuffer = await blob.arrayBuffer();
      const saveRes = await (window as any).electronAPI.savePdfFile(arrayBuffer, fileName);
      if (!saveRes.success && saveRes.error && saveRes.error !== 'User canceled save') {
        throw new Error(saveRes.error);
      }
      return;
    }

    // Standard Browser download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }

  // Shortcut methods
  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
