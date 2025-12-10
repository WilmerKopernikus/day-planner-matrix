import { Injectable, signal } from '@angular/core';
import { Task } from '../task.model';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {

  private readonly initialTasks: Task[] = [

    {
      id: 1,
      focusArea: 'Lernen',
      name: 'GitHub Copilot Certification',
      completed: false,
    },
    {
      id: 2,
      focusArea: 'Bewerbungen',
      name: 'Client presentation',
      completed: false,
    },
    {
      id: 3,
      focusArea: 'Projekte',
      name: 'Banderas Nila López',
      completed: false,
    },
    {
      id: 4,
      focusArea: 'Deutsch',
      name: 'Traum und Traumdeutung - CG Jung',
      completed: true,
    },
    {
      id: 5,
      focusArea: 'Ordnung',
      name: 'Comprar veneno contra las cucarachas',
      completed: false,
    },
  ];

  readonly tasks = signal<Task[]>(this.initialTasks);
  readonly focusAreas = signal<string[]>(this.extractFocusAreas(this.initialTasks));

addTask(taskData: { name: string; focusArea: string }) {
    const newTask: Task = {
      id: this.nextTaskId(),
      focusArea: taskData.focusArea,
      name: taskData.name,
      completed: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
    this.addFocusArea(taskData.focusArea);
  }

  addFocusArea(focusArea: string) {
    const trimmed = focusArea.trim();
    if (!trimmed) {
      return;
    }

    this.focusAreas.update((areas) =>
      areas.includes(trimmed) ? areas : [...areas, trimmed]
    );
  }

  private extractFocusAreas(tasks: Task[]): string[] {
    return Array.from(new Set(tasks.map((task) => task.focusArea)));
  }

  private nextTaskId(): number {
    const currentTasks = this.tasks();
    return currentTasks.length ? Math.max(...currentTasks.map((task) => task.id)) + 1 : 1;
  }
}