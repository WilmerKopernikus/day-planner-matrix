import { Injectable, signal } from '@angular/core';
import { Task } from '../task.model';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {

  private readonly initialTasks: Task[] = [

    {
      id: 1,
      focusArea: 'Lernen',
      name: 'GitHub Copilot Certification',
    },
    {
      id: 2,
      focusArea: 'Bewerbungen',
      name: 'Client presentation',
    },
    {
      id: 3,
      focusArea: 'Projekte',
      name: 'Banderas Nila López',
    },
    {
      id: 4,
      focusArea: 'Deutsch',
      name: 'Traum und Traumdeutung - CG Jung',
    },
    {
      id: 5,
      focusArea: 'Ordnung',
      name: 'Comprar veneno contra las cucarachas',
    },
  ];

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

  private extractFocusAreas(tasks: Task[]): string[] {
    return Array.from(new Set(tasks.map((task) => task.focusArea)));
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
}