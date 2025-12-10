import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../task.model';
import { TaskStoreService } from '../task-store.service';

@Component({
  selector: 'app-focus-areas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus-areas.component.html',
  styleUrl: './focus-areas.component.css',
})
export class FocusAreasComponent {
  private readonly taskStore = inject(TaskStoreService);
  readonly tasks = this.taskStore.tasks;
  readonly focusAreas = this.taskStore.focusAreas;
  selectedArea: string | null = null;
  newFocusArea = '';

  selectArea(area: string) {
    this.selectedArea = area;
  }

  addFocusArea() {
    const trimmed = this.newFocusArea.trim();
    if (!trimmed) {
      return;
    }

    this.taskStore.addFocusArea(trimmed);
    this.newFocusArea = '';
    this.selectArea(trimmed);
  }

  tasksForSelectedArea(): Task[] {
    if (!this.selectedArea) {
      return [];
    }

    return this.tasks().filter((task) => task.focusArea === this.selectedArea);
  }
}