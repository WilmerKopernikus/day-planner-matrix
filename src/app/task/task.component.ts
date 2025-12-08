import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from '../../task.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-task',
  imports: [NgClass],   // <-- REQUIRED
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent {

  @Input() task: Task | undefined;

  @Output() completeTask = new EventEmitter<Task>();

  onComplete() {
    if (this.task) {
      this.task.completed = true;
      this.completeTask.emit(this.task);
    }
  }
}