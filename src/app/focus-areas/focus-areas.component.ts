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
  selectedSubProjectId: number | null = null;
  newFocusArea = '';
  draggingArea: string | null = null;

  selectArea(area: string) {
    this.selectedArea = area;
    this.selectedSubProjectId = null;
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

    startDrag(area: string, event: DragEvent) {
    this.draggingArea = area;
    event.dataTransfer?.setData('text/plain', area);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
    event.dataTransfer?.setData('application/focus-area', area);
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  dropArea(targetArea: string) {
    if (!this.draggingArea || this.draggingArea === targetArea) {
      this.draggingArea = null;
      return;
    }

    this.taskStore.reorderFocusAreas(this.draggingArea, targetArea);
    this.draggingArea = null;
  }

  endDrag() {
    this.draggingArea = null;
  }

  deleteFocusArea(area: string) {
    this.taskStore.removeFocusArea(area);
    const remainingAreas = this.focusAreas();

    if (this.selectedArea === area) {
      this.selectedArea = remainingAreas.length ? remainingAreas[0] : null;
    }
    if (this.selectedArea === null) {
      this.selectedSubProjectId = null;
    }
  }

  deleteTask(taskId: number) {
    this.taskStore.removeTask(taskId);
    if (this.selectedSubProjectId === taskId) {
      this.selectedSubProjectId = null;
    }
  }

  tasksForSelectedArea(): Task[] {
    if (!this.selectedArea) {
      return [];
    }

    const subProjectIds = new Set(this.subProjectsForSelectedArea().map((task) => task.id));
    return this.tasks().filter(
      (task) => task.focusArea === this.selectedArea && !subProjectIds.has(task.id) && !task.subProjectId
    );
  }

  subProjectsForSelectedArea(): Task[] {
    if (!this.selectedArea) {
      return [];
    }

    return this.tasks().filter((task) => task.focusArea === this.selectedArea && task.isSubProject);
  }

  selectSubProject(subProjectId: number) {
    this.selectedSubProjectId = subProjectId;
  }

  deleteSubProject(subProjectId: number, event?: Event) {
    event?.stopPropagation();
    this.taskStore.removeTask(subProjectId);

    const remainingSubProjects = this.subProjectsForSelectedArea();
    const hasSelectedSubProject = remainingSubProjects.some(
      (task) => task.id === this.selectedSubProjectId
    );

    if (this.selectedSubProjectId === subProjectId || !hasSelectedSubProject) {
      this.selectedSubProjectId = null;
    }
  }

  selectedSubProjectName(): string | undefined {
    return this.subProjectsForSelectedArea().find(
      (task) => task.id === this.selectedSubProjectId
    )?.name;
  }


  tasksForSelectedSubProject(): Task[] {
    if (!this.selectedSubProjectId) {
      return [];
    }

    return this.tasks().filter((task) => task.subProjectId === this.selectedSubProjectId);
  }
}