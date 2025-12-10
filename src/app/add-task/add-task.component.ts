import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TaskNameInputComponent } from '../task-name-input/task-name-input.component';
import { TaskDateInputComponent } from '../task-date-input/task-date-input.component';


@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  imports: [TaskDateInputComponent, TaskNameInputComponent]
})
export class AddTaskComponent implements OnChanges {
  @Input() focusAreas: string[] = []
  newTaskName: string = ''
  newTaskDate: string = ''
  newFocusArea = ''
  selectedFocusArea = ''

  @Output() addTaskEvent = new EventEmitter<{
    name: string
    date: string
    focusArea: string
    }>();
      @Output() addFocusArea = new EventEmitter<string>()

  ngOnChanges(changes: SimpleChanges) {
    if (changes['focusAreas'] && !this.selectedFocusArea && this.focusAreas.length) {
      this.selectedFocusArea = this.focusAreas[0]
    }
  }

  addTask() {
    if (this.newTaskName && this.newTaskDate && this.selectedFocusArea) {
      this.addTaskEvent.emit({
        name: this.newTaskName,
        date: this.newTaskDate,
        focusArea: this.selectedFocusArea
      })
      this.newTaskName = ""
      this.newTaskDate = ""
    }
  }
  
  handleAddFocusArea() {
    const trimmed = this.newFocusArea.trim()
    if (trimmed) {
      this.addFocusArea.emit(trimmed)
      this.selectedFocusArea = trimmed
      this.newFocusArea = ''
    }
  }

  handleFocusAreaSelection(event: Event) {
    const target = event.target as HTMLSelectElement
    this.selectedFocusArea = target.value
  }
}