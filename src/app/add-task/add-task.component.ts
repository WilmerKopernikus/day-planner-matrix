import { Component, EventEmitter, Output  } from '@angular/core';
import { TaskNameInputComponent } from '../task-name-input/task-name-input.component';
import { TaskDateInputComponent } from '../task-date-input/task-date-input.component';


@Component({
  selector: 'app-add-task',
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  imports: [TaskDateInputComponent, TaskNameInputComponent]
})
export class AddTaskComponent {
  newTaskName: string = ''
  newTaskDate: string = ''

  @Output() addTaskEvent = new EventEmitter<{ 
    name: string 
    date: string 
    }>();

  addTask() {
    if (this.newTaskName && this.newTaskDate) {
      this.addTaskEvent.emit({
        name: this.newTaskName,
        date: this.newTaskDate
      })
      this.newTaskName = ""
      this.newTaskDate = ""
    }
  }
}