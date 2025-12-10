import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TaskNameInputComponent } from '../task-name-input/task-name-input.component';

@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  imports: [TaskNameInputComponent]
})
export class AddTaskComponent implements OnChanges {
  @Input() focusAreas: string[] = [];
  newTaskName = '';
  selectedFocusArea = '';

  @Output() addTaskEvent = new EventEmitter<{
    name: string;
    focusArea: string;
  }>();
  @Output() addFocusArea = new EventEmitter<string>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['focusAreas'] && !this.selectedFocusArea && this.focusAreas.length) {
      this.selectedFocusArea = this.focusAreas[0];
    }
  }

  addTask() {
    if (this.newTaskName && this.selectedFocusArea) {
      this.addTaskEvent.emit({
        name: this.newTaskName,
        focusArea: this.selectedFocusArea,
      });
      this.newTaskName = '';
    }
  }

  handleFocusAreaSelection(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedFocusArea = target.value;
  }
}