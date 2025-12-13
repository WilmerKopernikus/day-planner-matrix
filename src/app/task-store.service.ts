import { Injectable, signal } from '@angular/core';
import { Task } from '../task.model';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {

private readonly initialTasks: Task[] = [];

  private readonly storageKey = 'day-planner-tasks';

  readonly tasks = signal<Task[]>(this.initialTasks);
  readonly focusAreas = signal<string[]>(this.extractFocusAreas(this.initialTasks));

  constructor() {
    const storedState = this.loadState();
    if (storedState) {
      this.tasks.set(storedState.tasks);
      this.focusAreas.set(storedState.focusAreas);
    }
  }

  addTask(taskData: { name: string; focusArea: string; subProjectId?: number | null }) {
    const newTask: Task = {
      id: this.nextTaskId(),
      focusArea: taskData.focusArea,
      name: taskData.name,
      subProjectId: taskData.subProjectId ?? undefined,
    };

    const targetSubProjectId = taskData.subProjectId;

    this.tasks.update((tasks) => {
      const updatedTasks = tasks.map((task) => {
        if (task.id === targetSubProjectId) {
          return { ...task, isSubProject: true };
        }

        return task;
      });

      return [...updatedTasks, newTask];
    });
    this.addFocusArea(taskData.focusArea, false);
    this.persistState();
  }

  addFocusArea(focusArea: string, persist = true) {
    const trimmed = focusArea.trim();
    if (!trimmed) {
      return;
    }

    this.focusAreas.update((areas) =>
      areas.includes(trimmed) ? areas : [...areas, trimmed]
    );
    if (persist) {
      this.persistState();
    }
  }

  addSubProject(subProjectData: { name: string; focusArea: string }) {
    const trimmedName = subProjectData.name.trim();

    if (!trimmedName) {
      return;
    }

    const newSubProject: Task = {
      id: this.nextTaskId(),
      focusArea: subProjectData.focusArea,
      name: trimmedName,
      isSubProject: true,
    };

    this.tasks.update((tasks) => [...tasks, newSubProject]);
    this.addFocusArea(subProjectData.focusArea, false);
    this.persistState();
  }

  removeTask(taskId: number) {
    this.tasks.update((tasks) => {
      const targetTask = tasks.find((task) => task.id === taskId);

      if (!targetTask) {
        return tasks;
      }

      if (targetTask.isSubProject) {
        return tasks.filter((task) => task.id !== taskId && task.subProjectId !== taskId);
      }
      const remaining = tasks.filter((task) => task.id !== taskId);
      return remaining.map((task) =>
        task.subProjectId === taskId ? { ...task, subProjectId: undefined } : task
      );
    });
    this.persistState();
  }

  removeFocusArea(focusArea: string) {
    const trimmed = focusArea.trim();
    if (!trimmed) {
      return;
    }

    this.focusAreas.update((areas) => areas.filter((area) => area !== trimmed));
    this.tasks.update((tasks) => tasks.filter((task) => task.focusArea !== trimmed));

    this.persistState();
  }

    reorderFocusAreas(sourceArea: string, targetArea: string) {
    const trimmedSource = sourceArea.trim();
    const trimmedTarget = targetArea.trim();

    if (!trimmedSource || !trimmedTarget || trimmedSource === trimmedTarget) {
      return;
    }

    this.focusAreas.update((areas) => {
      const sourceIndex = areas.indexOf(trimmedSource);
      const targetIndex = areas.indexOf(trimmedTarget);

      if (sourceIndex === -1 || targetIndex === -1) {
        return areas;
      }

      const updated = [...areas];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.indexOf(trimmedTarget);
      const insertIndex = sourceIndex < targetIndex
        ? targetIndexAfterRemoval + 1
        : targetIndexAfterRemoval;
      updated.splice(insertIndex, 0, moved);

      return updated;
    });

    this.persistState();
  }
  private extractFocusAreas(tasks: Task[]): string[] {
    return Array.from(new Set(tasks.map((task) => task.focusArea)));
  }

   reorderSubProjects(sourceSubProjectId: number, targetSubProjectId: number) {
    this.tasks.update((tasks) => {
      const sourceIndex = tasks.findIndex((task) => task.id === sourceSubProjectId);
      const targetIndex = tasks.findIndex((task) => task.id === targetSubProjectId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return tasks;
      }

      const sourceTask = tasks[sourceIndex];
      const targetTask = tasks[targetIndex];
      const sameGroup =
        sourceTask.isSubProject &&
        targetTask.isSubProject &&
        sourceTask.focusArea === targetTask.focusArea;

      if (!sameGroup) {
        return tasks;
      }

      const updated = [...tasks];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.findIndex((task) => task.id === targetSubProjectId);
      const insertIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;

      updated.splice(insertIndex, 0, moved);
      return updated;
    });

    this.persistState();
  }

  reorderTasks(sourceTaskId: number, targetTaskId: number) {
    this.tasks.update((tasks) => {
      const sourceIndex = tasks.findIndex((task) => task.id === sourceTaskId);
      const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return tasks;
      }

      const sourceTask = tasks[sourceIndex];
      const targetTask = tasks[targetIndex];
      const sameGroup =
        !sourceTask.isSubProject &&
        !targetTask.isSubProject &&
        sourceTask.focusArea === targetTask.focusArea &&
        sourceTask.subProjectId === targetTask.subProjectId;

      if (!sameGroup) {
        return tasks;
      }

      const updated = [...tasks];
      const [moved] = updated.splice(sourceIndex, 1);
      const targetIndexAfterRemoval = updated.findIndex((task) => task.id === targetTaskId);
      const insertIndex = sourceIndex < targetIndex ? targetIndexAfterRemoval + 1 : targetIndexAfterRemoval;

      updated.splice(insertIndex, 0, moved);
      return updated;
    });

    this.persistState();
  }

   scheduleTask(taskId: number, isoDate: string) {
    const trimmedDate = isoDate.trim();

    if (!trimmedDate || !this.isValidISODate(trimmedDate)) {
      return;
    }

    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, scheduledDate: trimmedDate } : task
      )
    );

    this.persistState();
  }

  scheduleAndCompleteTask(taskId: number, isoDate: string) {
    const trimmedDate = isoDate.trim();

    if (!trimmedDate || !this.isValidISODate(trimmedDate)) {
      return;
    }

    this.tasks.update((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, scheduledDate: trimmedDate, completed: true } : task
      )
    );

    this.persistState();
  }

  private nextTaskId(): number {
    const currentTasks = this.tasks();
    return currentTasks.length ? Math.max(...currentTasks.map((task) => task.id)) + 1 : 1;
  }

  private persistState() {
    if (!this.hasLocalStorage()) {
      return;
    }

    const state = JSON.stringify({
      tasks: this.tasks(),
      focusAreas: this.focusAreas(),
    });

    globalThis.localStorage.setItem(this.storageKey, state);
  }

  private loadState(): { tasks: Task[]; focusAreas: string[] } | null {
    if (!this.hasLocalStorage()) {
      return null;
    }

    const stored = globalThis.localStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<{ tasks: Task[]; focusAreas: string[] }>;
      if (Array.isArray(parsed.tasks) && Array.isArray(parsed.focusAreas)) {
        return {
          tasks: parsed.tasks,
          focusAreas: parsed.focusAreas,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  private hasLocalStorage(): boolean {
    return typeof globalThis !== 'undefined' && !!globalThis.localStorage;
  }

    private isValidISODate(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
  }
}