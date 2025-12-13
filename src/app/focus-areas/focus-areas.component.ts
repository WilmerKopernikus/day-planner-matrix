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
  draggingArea: string | null = null;
  private dragImageElement: HTMLElement | null = null;

  selectArea(area: string) {
    this.selectedArea = area;
    this.selectedSubProjectId = null;
  }

  startDrag(area: string, event: DragEvent) {
    this.draggingArea = area;
    event.dataTransfer?.setData('text/plain', area);
    event.dataTransfer?.setData('application/focus-area', area);
    const sourceElement = event.currentTarget as HTMLElement | null;
    const dragImage = sourceElement ? this.createDragImage(sourceElement) : null;

    if (dragImage) {
      const { width, height } = dragImage.getBoundingClientRect();
      event.dataTransfer?.setDragImage(dragImage, width / 2, height / 2);
    }
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  dropArea(targetArea: string) {
    if (!this.draggingArea || this.draggingArea === targetArea) {
      this.draggingArea = null;
      this.removeDragImage();
      return;
    }

    this.taskStore.reorderFocusAreas(this.draggingArea, targetArea);
    this.draggingArea = null;
    this.removeDragImage();
  }

  endDrag() {
    this.draggingArea = null;
    this.removeDragImage();
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
  
  private createDragImage(source: HTMLElement): HTMLElement {
    const buttonRect = source.getBoundingClientRect();
    const clone = source.cloneNode(true) as HTMLElement;

    clone.classList.add('drag-image');
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.left = '-9999px';
    clone.style.width = `${buttonRect.width}px`;
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '1';

    document.body.appendChild(clone);
    this.dragImageElement = clone;

    return clone;
  }

  private removeDragImage() {
    if (this.dragImageElement?.parentElement) {
      this.dragImageElement.parentElement.removeChild(this.dragImageElement);
    }
    this.dragImageElement = null;
  }
}