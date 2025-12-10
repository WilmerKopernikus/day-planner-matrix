import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../task.model';

@Component({
  selector: 'app-focus-areas',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './focus-areas.component.html',
  styleUrl: './focus-areas.component.css',
})
export class FocusAreasComponent {
  tasks: Task[] = [
    {
      id: 1,
      focusArea: 'Lernen',
      name: 'GitHub Copilot Certification Skill Path',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 2,
      focusArea: 'Bewerbungen',
      name: 'Client presentation',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 3,
      focusArea: 'Projekte',
      name: 'Banderas Nila López',
      time: this.addDaysToDate(new Date(), 30),
      isDueToday: false,
      completed: false,
    },
    {
      id: 4,
      focusArea: 'Deutsch',
      name: 'Traum und Traumdeutung - CG Jung',
      time: this.startOfDay(new Date('Sat Apr 20 2024 00:00:00 GMT+0530')),
      isDueToday: false,
      completed: true,
    },
    {
      id: 5,
      focusArea: 'Ordnung',
      name: 'Software update',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
  ];

  focusAreas = Array.from(new Set(this.tasks.map((task) => task.focusArea)));
  selectedArea: string | null = null;

  selectArea(area: string) {
    this.selectedArea = area;
  }

  tasksForSelectedArea(): Task[] {
    if (!this.selectedArea) {
      return [];
    }

    return this.tasks.filter((task) => task.focusArea === this.selectedArea);
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
}