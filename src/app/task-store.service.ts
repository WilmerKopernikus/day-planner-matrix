import { Injectable, signal } from '@angular/core';
import { Task } from '../task.model';

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly today = this.startOfDay(new Date());

  private readonly initialTasks: Task[] = [
    {
      id: 1,
      focusArea: 'Collaboration',
      name: 'Meeting with team',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 2,
      focusArea: 'Presentation',
      name: 'Client presentation',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 3,
      focusArea: 'Delivery',
      name: 'Project deadline',
      time: this.addDaysToDate(new Date(), 30),
      isDueToday: false,
      completed: false,
    },
    {
      id: 4,
      focusArea: 'Social',
      name: 'Team outing',
      time: this.startOfDay(new Date('Sat Apr 20 2024 00:00:00 GMT+0530')),
      isDueToday: false,
      completed: true,
    },
    {
      id: 5,
      focusArea: 'Planning',
      name: 'Software update',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 6,
      focusArea: 'Lernen',
      name: 'GitHub Copilot Certification Skill Path',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 7,
      focusArea: 'Bewerbungen',
      name: 'Client presentation',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 8,
      focusArea: 'Projekte',
      name: 'Banderas Nila López',
      time: this.addDaysToDate(new Date(), 30),
      isDueToday: false,
      completed: false,
    },
    {
      id: 9,
      focusArea: 'Deutsch',
      name: 'Traum und Traumdeutung - CG Jung',
      time: this.startOfDay(new Date('Sat Apr 20 2024 00:00:00 GMT+0530')),
      isDueToday: false,
      completed: true,
    },
    {
      id: 10,
      focusArea: 'Ordnung',
      name: 'Software update',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
  ];

  readonly tasks = signal<Task[]>(this.initialTasks);
  readonly focusAreas = signal<string[]>(this.extractFocusAreas(this.initialTasks));

  addTask(taskData: { name: string; date: string; focusArea: string }) {
    const taskDate = this.startOfDay(new Date(taskData.date));
    const newTask: Task = {
      id: this.nextTaskId(),
      focusArea: taskData.focusArea,
      name: taskData.name,
      time: taskDate,
      completed: false,
      isDueToday: taskDate.getTime() === this.today.getTime(),
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

  private startOfDay(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private addDaysToDate(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return this.startOfDay(result);
  }

  private nextTaskId(): number {
    const currentTasks = this.tasks();
    return currentTasks.length ? Math.max(...currentTasks.map((task) => task.id)) + 1 : 1;
  }
}