import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-task-date-input',
  templateUrl: './task-date-input.component.html'
})
export class TaskDateInputComponent {
  @Input() taskDate = ''
  @Output() taskDateChange = new EventEmitter<string>()

  handleTaskDateChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.taskDate = target.value
    this.taskDateChange.emit(this.taskDate)
  }
}