import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TaskNameInputComponent } from '../task-name-input/task-name-input.component';
import { Task } from '../../task.model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  imports: [TaskNameInputComponent]
})
export class AddTaskComponent implements OnChanges {
  @Input() focusAreas: string[] = [];
  @Input() tasks: Task[] = [];
  newTaskName = '';
  newSubProjectName = '';
  newFocusArea = '';
  selectedFocusArea = '';
  selectedSubProjectId: number | null = null;

  @Output() addTaskEvent = new EventEmitter<{
    name: string;
    focusArea: string;
    subProjectId?: number | null;
  }>();
  @Output() addFocusArea = new EventEmitter<string>();
  @Output() addSubProjectEvent = new EventEmitter<{
    name: string;
    focusArea: string;
  }>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['focusAreas'] && !this.selectedFocusArea && this.focusAreas.length) {
      this.selectedFocusArea = this.focusAreas[0];
    }

    if (changes['selectedFocusArea'] || changes['tasks'] || changes['focusAreas']) {
      this.syncSubProjectSelection();
    }
  }

  addTask() {
    if (this.newTaskName && this.selectedFocusArea) {
      this.addTaskEvent.emit({
        name: this.newTaskName,
        focusArea: this.selectedFocusArea,
        subProjectId: this.selectedSubProjectId,
      });
      this.newTaskName = '';
    }
  }

  addNewFocusArea() {
    const trimmed = this.newFocusArea.trim();

    if (!trimmed) {
      return;
    }

    this.addFocusArea.emit(trimmed);
    this.selectedFocusArea = trimmed;
    this.selectedSubProjectId = null;
    this.newFocusArea = '';
  }

  handleFocusAreaSelection(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFocusArea = target.value;
    this.syncSubProjectSelection();
  }

  addSubProject() {
    const trimmedName = this.newSubProjectName.trim();

    if (!this.selectedFocusArea || !trimmedName) {
      return;
    }

    this.addSubProjectEvent.emit({
      name: trimmedName,
      focusArea: this.selectedFocusArea,
    });

    this.newSubProjectName = '';
  }


  handleSubProjectSelection(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedSubProjectId = value ? Number(value) : null;
  }

  handleSubProjectNameChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newSubProjectName = target.value;
  }

  handleFocusAreaNameChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.newFocusArea = target.value;
  }

  availableSubProjects(): Task[] {
    if (!this.selectedFocusArea) {
      return [];
    }

    return this.tasks.filter(
      (task) => task.focusArea === this.selectedFocusArea && task.isSubProject
    );
  }

  private syncSubProjectSelection() {
    const available = this.availableSubProjects();
    if (!available.length) {
      this.selectedSubProjectId = null;
      return;
    }

    if (this.selectedSubProjectId) {
      const stillValid = available.some((task) => task.id === this.selectedSubProjectId);
      if (!stillValid) {
        this.selectedSubProjectId = null;
      }
    }
  }
}