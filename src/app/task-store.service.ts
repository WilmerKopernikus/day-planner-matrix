import { Injectable, inject, signal } from '@angular/core';
import { Task } from '../task.model';
import { ApiService, ApiTask } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly api = inject(ApiService);
  private readonly storageKey = 'day-planner-tasks';

  readonly tasks = signal<Task[]>([]);
  readonly focusAreas = signal<string[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly useBackend = signal<boolean>(true);

  constructor() {
    this.loadFromBackend();
  }

  private async loadFromBackend() {
    try {
      const [tasks, focusAreas] = await Promise.all([
        firstValueFrom(this.api.getTasks()),
        firstValueFrom(this.api.getFocusAreas())
      ]);

      this.tasks.set(this.mapApiTasksToTasks(tasks));
      this.focusAreas.set(focusAreas);
      this.useBackend.set(true);
      console.log('✅ Loaded from backend:', tasks.length, 'tasks,', focusAreas.length, 'focus areas');
    } catch (error) {
      console.warn('⚠️ Backend unavailable, falling back to localStorage');
      this.useBackend.set(false);
      this.loadFromLocalStorage();
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadFromLocalStorage() {
    if (!this.hasLocalStorage()) return;

    const stored = globalThis.localStorage.getItem(this.storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as Partial<{ tasks: unknown[]; focusAreas: string[] }>;
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.focusAreas)) {
        const migratedTasks = parsed.tasks.map((task: unknown) => {
          const t = task as Record<string, unknown>;
          if (t['scheduledDate'] && !t['scheduledDates']) {
            const { scheduledDate, ...rest } = t;
            return { ...rest, scheduledDates: [scheduledDate as string] };
          }
          return t;
        }) as unknown as Task[];

        this.tasks.set(migratedTasks);
        this.focusAreas.set(parsed.focusAreas);
      }
    } catch {
      // Ignore parse errors
    }
  }

  private mapApiTasksToTasks(apiTasks: ApiTask[]): Task[] {
    return apiTasks.map((t) => ({
      id: t.id,
      name: t.name,
      focusArea: t.focusArea,
      subProjectId: t.subProjectId,
      isSubProject: t.isSubProject,
      completed: t.completed,
      scheduledDates: t.scheduledDates?.length ? t.scheduledDates : undefined,
    }));
  }

  async addTask(taskData: { name: string; focusArea: string; subProjectId?: number | null }) {
    const targetSubProjectId = taskData.subProjectId;

    if (this.useBackend()) {
      try {
        if (targetSubProjectId) {
          const parentTask = this.tasks().find((t) => t.id === targetSubProjectId);
          if (parentTask && !parentTask.isSubProject) {
            await firstValueFrom(this.api.updateTask(targetSubProjectId, { isSubProject: true }));
          }
        }

        await firstValueFrom(this.api.createTask({
          name: taskData.name,
          focusArea: taskData.focusArea,
          subProjectId: taskData.subProjectId ?? undefined,
        }));

        const tasks = await firstValueFrom(this.api.getTasks());
        this.tasks.set(this.mapApiTasksToTasks(tasks));
        this.addFocusArea(taskData.focusArea, false);
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    } else {
      const newTask: Task = {
        id: this.nextTaskId(),
        focusArea: taskData.focusArea,
        name: taskData.name,
        subProjectId: taskData.subProjectId ?? undefined,
      };

      this.tasks.update((tasks) => {
        const updatedTasks = tasks.map((task) =>
          task.id === targetSubProjectId ? { ...task, isSubProject: true } : task
        );
        return [...updatedTasks, newTask];
      });
      this.addFocusArea(taskData.focusArea, false);
      this.persistToLocalStorage();
    }
  }

  async addFocusArea(focusArea: string, persist = true) {
    const trimmed = focusArea.trim();
    if (!trimmed || this.focusAreas().includes(trimmed)) return;

    this.focusAreas.update((areas) => [...areas, trimmed]);

    if (persist && this.useBackend()) {
      try {
        await firstValueFrom(this.api.createFocusArea(trimmed));
      } catch (error) {
        console.error('Failed to add focus area:', error);
      }
    } else if (persist) {
      this.persistToLocalStorage();
    }
  }

  async addSubProject(subProjectData: { name: string; focusArea: string }) {
    const trimmedName = subProjectData.name.trim();
    if (!trimmedName) return;

    if (this.useBackend()) {
      try {
        await firstValueFrom(this.api.createTask({
          name: trimmedName,
          focusArea: subProjectData.focusArea,
          isSubProject: true,
        }));

        const tasks = await firstValueFrom(this.api.getTasks());
        this.tasks.set(this.mapApiTasksToTasks(tasks));
        this.addFocusArea(subProjectData.focusArea, false);
      } catch (error) {
        console.error('Failed to add subproject:', error);
      }
    } else {
      const newSubProject: Task = {
        id: this.nextTaskId(),
        focusArea: subProjectData.focusArea,
        name: trimmedName,
        isSubProject: true,
      };

      this.tasks.update((tasks) => [...tasks, newSubProject]);
      this.addFocusArea(subProjectData.focusArea, false);
      this.persistToLocalStorage();
    }
  }

  async removeTask(taskId: number) {
    if (this.useBackend()) {
      try {
        await firstValueFrom(this.api.deleteTask(taskId));
        const tasks = await firstValueFrom(this.api.getTasks());
        this.tasks.set(this.mapApiTasksToTasks(tasks));
      } catch (error) {
        console.error('Failed to remove task:', error);
      }
    } else {
      this.tasks.update((tasks) => {
        const targetTask = tasks.find((task) => task.id === taskId);
        if (!targetTask) return tasks;

        if (targetTask.isSubProject) {
          return tasks.filter((task) => task.id !== taskId && task.subProjectId !== taskId);
        }
        const remaining = tasks.filter((task) => task.id !== taskId);
        return remaining.map((task) =>
          task.subProjectId === taskId ? { ...task, subProjectId: undefined } : task
        );
      });
      this.persistToLocalStorage();
    }
  }

  async removeFocusArea(focusArea: string) {
    const trimmed = focusArea.trim();
    if (!trimmed) return;

    if (this.useBackend()) {
      try {
        await firstValueFrom(this.api.deleteFocusArea(trimmed));
        const [tasks, focusAreas] = await Promise.all([
          firstValueFrom(this.api.getTasks()),
          firstValueFrom(this.api.getFocusAreas())
        ]);
        this.tasks.set(this.mapApiTasksToTasks(tasks));
        this.focusAreas.set(focusAreas);
      } catch (error) {
        console.error('Failed to remove focus area:', error);
      }
    } else {
      this.focusAreas.update((areas) => areas.filter((area) => area !== trimmed));
      this.tasks.update((tasks) => tasks.filter((task) => task.focusArea !== trimmed));
      this.persistToLocalStorage();
    }
  }

  async reorderFocusAreas(sourceArea: string, targetArea: string) {
    const trimmedSource = sourceArea.trim();
    const trimmedTarget = targetArea.trim();
    if (!trimmedSource || !trimmedTarget || trimmedSource === trimmedTarget) return;

    this.focusAreas.update((areas) => {
      const sourceIndex = areas.indexOf(trimmedSource);
      const targetIndex = areas.indexOf(trimmedTarget);
      if (sourceIndex === -1 || targetIndex === -1) return areas;

      const updated = [...areas];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.indexOf(trimmedTarget);
      const insertIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;
      updated.splice(insertIndex, 0, moved);
      return updated;
    });

    if (this.useBackend()) {
      try {
        await firstValueFrom(this.api.reorderFocusAreas(this.focusAreas()));
      } catch (error) {
        console.error('Failed to reorder focus areas:', error);
      }
    } else {
      this.persistToLocalStorage();
    }
  }

  reorderSubProjects(sourceSubProjectId: number, targetSubProjectId: number) {
    this.tasks.update((tasks) => {
      const sourceIndex = tasks.findIndex((task) => task.id === sourceSubProjectId);
      const targetIndex = tasks.findIndex((task) => task.id === targetSubProjectId);
      if (sourceIndex === -1 || targetIndex === -1) return tasks;

      const sourceTask = tasks[sourceIndex];
      const targetTask = tasks[targetIndex];
      const sameGroup = sourceTask.isSubProject && targetTask.isSubProject &&
        sourceTask.focusArea === targetTask.focusArea;
      if (!sameGroup) return tasks;

      const updated = [...tasks];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.findIndex((task) => task.id === targetSubProjectId);
      const insertIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;
      updated.splice(insertIndex, 0, moved);
      return updated;
    });

    this.persistToLocalStorage();
  }

  reorderTasks(sourceTaskId: number, targetTaskId: number) {
    this.tasks.update((tasks) => {
      const sourceIndex = tasks.findIndex((task) => task.id === sourceTaskId);
      const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);
      if (sourceIndex === -1 || targetIndex === -1) return tasks;

      const sourceTask = tasks[sourceIndex];
      const targetTask = tasks[targetIndex];
      const sameGroup = !sourceTask.isSubProject && !targetTask.isSubProject &&
        sourceTask.focusArea === targetTask.focusArea &&
        sourceTask.subProjectId === targetTask.subProjectId;
      if (!sameGroup) return tasks;

      const updated = [...tasks];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.findIndex((task) => task.id === targetTaskId);
      const insertIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;
      updated.splice(insertIndex, 0, moved);
      return updated;
    });

    this.persistToLocalStorage();
  }

  async scheduleTask(taskId: number, isoDate: string) {
    const trimmedDate = isoDate.trim();
    if (!trimmedDate || !this.isValidISODate(trimmedDate)) return;

    this.tasks.update((tasks) =>
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        const existingDates = task.scheduledDates ?? [];
        if (existingDates.includes(trimmedDate)) return task;
        return { ...task, scheduledDates: [...existingDates, trimmedDate] };
      })
    );

    if (this.useBackend()) {
      try {
        await firstValueFrom(this.api.scheduleTask(taskId, trimmedDate));
      } catch (error) {
        console.error('Failed to schedule task:', error);
      }
    } else {
      this.persistToLocalStorage();
    }
  }

  async scheduleAndCompleteTask(taskId: number, isoDate: string) {
    const trimmedDate = isoDate.trim();
    if (!trimmedDate || !this.isValidISODate(trimmedDate)) return;

    this.tasks.update((tasks) =>
      tasks.map((task) => {
        if (task.id !== taskId) return task;
        const existingDates = task.scheduledDates ?? [];
        const newDates = existingDates.includes(trimmedDate) ? existingDates : [...existingDates, trimmedDate];
        return { ...task, scheduledDates: newDates, completed: true };
      })
    );

    if (this.useBackend()) {
      try {
        const task = this.tasks().find((t) => t.id === taskId);
        await firstValueFrom(this.api.updateTask(taskId, {
          scheduledDates: task?.scheduledDates,
          completed: true,
        }));
      } catch (error) {
        console.error('Failed to complete task:', error);
      }
    } else {
      this.persistToLocalStorage();
    }
  }

  private nextTaskId(): number {
    const currentTasks = this.tasks();
    return currentTasks.length ? Math.max(...currentTasks.map((task) => task.id)) + 1 : 1;
  }

  private persistToLocalStorage() {
    if (!this.hasLocalStorage()) return;
    const state = JSON.stringify({ tasks: this.tasks(), focusAreas: this.focusAreas() });
    globalThis.localStorage.setItem(this.storageKey, state);
  }

  private hasLocalStorage(): boolean {
    return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
  }

  private isValidISODate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }
}
