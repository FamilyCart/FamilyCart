import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: T[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private apiBasePath = environment.apiBasePath;
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  /**
   * Get headers with optional authentication token
   */
  private getHeaders(token?: string): HttpHeaders {
    if (token) {
      return this.headers.set('Authorization', `Bearer ${token}`);
    }
    return this.headers;
  }

  /**
   * Build full API endpoint URL
   */
  private buildEndpoint(endpoint: string): string {
    // If endpoint is already a full URL (from pagination), use it as is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    // Remove leading slash if present
    if (endpoint.startsWith('/')) {
      endpoint = endpoint.substring(1);
    }
    // Remove apiBasePath prefix if present (components may still have it)
    if (endpoint.startsWith(`${this.apiBasePath}/`)) {
      endpoint = endpoint.substring(this.apiBasePath.length + 1);
    }
    // Prepend base path from environment
    return `${this.apiUrl}/${this.apiBasePath}/${endpoint}`;
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any, token?: string): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    
    return this.http.get<T>(this.buildEndpoint(endpoint), {
      headers: this.getHeaders(token),
      params: httpParams
    });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any, token?: string): Observable<T> {
    return this.http.post<T>(this.buildEndpoint(endpoint), data, {
      headers: this.getHeaders(token)
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any, token?: string): Observable<T> {
    return this.http.put<T>(this.buildEndpoint(endpoint), data, {
      headers: this.getHeaders(token)
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any, token?: string): Observable<T> {
    return this.http.patch<T>(this.buildEndpoint(endpoint), data, {
      headers: this.getHeaders(token)
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, token?: string): Observable<T> {
    return this.http.delete<T>(this.buildEndpoint(endpoint), {
      headers: this.getHeaders(token)
    });
  }

  /**
   * POST request with FormData
   */
  postFormData<T>(endpoint: string, formData: FormData, token?: string): Observable<T> {
    const headers = token 
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();

    return this.http.post<T>(this.buildEndpoint(endpoint), formData, {
      headers: headers
    });
  }

  /**
   * PATCH request with FormData
   */
  patchFormData<T>(endpoint: string, formData: FormData, token?: string): Observable<T> {
    const headers = token 
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();

    return this.http.patch<T>(this.buildEndpoint(endpoint), formData, {
      headers: headers
    });
  }

  /**
   * Upload file
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any, token?: string): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.postFormData<T>(endpoint, formData, token);
  }
}
