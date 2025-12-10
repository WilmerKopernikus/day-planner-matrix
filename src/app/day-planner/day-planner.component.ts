import { Component, inject } from '@angular/core';
import { Task } from '../../task.model';
import { TaskComponent } from '../task/task.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { DatePipe } from '@angular/common';
import { TimeLeftPipe } from '../time-left.pipe';
import { HighlightDirective } from '../highlight.directive';
import { TaskStoreService } from "../task-store.service";

@Component({
  selector: 'app-day-planner',
  standalone: true,
  imports: [TaskComponent, AddTaskComponent, DatePipe, TimeLeftPipe, HighlightDirective],
  templateUrl: './day-planner.component.html',
  styleUrl: './day-planner.component.css'
})
export class DayPlannerComponent {
  private readonly taskStore = inject(TaskStoreService);
  readonly tasks = this.taskStore.tasks;
  readonly focusAreas = this.taskStore.focusAreas;
  selectedTask = this.tasks()[0] ?? null;


  selectTask(task: Task) {
    this.selectedTask = task;
  }

  handleCompleteTask() {
    this.selectedTask = null;
  }

  handleNewTask(taskData: { name: string; date: string; focusArea: string }) {
    this.taskStore.addTask(taskData);
  }

  addFocusArea(focusArea: string) {
    this.taskStore.addFocusArea(focusArea);
  }
}
