import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: 'app-task-name-input',
  templateUrl: './task-name-input.component.html'
})
export class TaskNameInputComponent {
  @Input() taskName = ''
  @Output() taskNameChange = new EventEmitter<string>()

  handleTaskNameChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.taskName = target.value
    this.taskNameChange.emit(this.taskName)
  }
}