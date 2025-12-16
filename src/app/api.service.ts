import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../task.model';

export interface ApiTask {
  id: number;
  name: string;
  focusArea: string;
  subProjectId?: number;
  isSubProject?: boolean;
  completed?: boolean;
  sortOrder?: number;
  scheduledDates: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  // Health check
  health(): Observable<{ status: string; timestamp: string }> {
    return this.http.get<{ status: string; timestamp: string }>(`${this.baseUrl}/health`);
  }

  // Tasks
  getTasks(): Observable<ApiTask[]> {
    return this.http.get<ApiTask[]>(`${this.baseUrl}/tasks`);
  }

  createTask(task: { name: string; focusArea: string; subProjectId?: number; isSubProject?: boolean }): Observable<ApiTask> {
    return this.http.post<ApiTask>(`${this.baseUrl}/tasks`, task);
  }

  updateTask(id: number, updates: Partial<Task>): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/tasks/${id}`, updates);
  }

  deleteTask(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/tasks/${id}`);
  }

  scheduleTask(id: number, date: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.baseUrl}/tasks/${id}/schedule`, { date });
  }

  // Focus Areas
  getFocusAreas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/focus-areas`);
  }

  createFocusArea(name: string): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.baseUrl}/focus-areas`, { name });
  }

  deleteFocusArea(name: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/focus-areas/${encodeURIComponent(name)}`);
  }

  reorderFocusAreas(order: string[]): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/focus-areas/reorder`, { order });
  }

  // Reorder tasks
  reorderTasks(taskIds: number[]): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.baseUrl}/tasks/reorder`, { taskIds });
  }
}
