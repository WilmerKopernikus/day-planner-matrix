import { Component, inject } from '@angular/core';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TaskStoreService } from '../task-store.service';

@Component({
  selector: 'app-day-planner',
  standalone: true,
  imports: [AddTaskComponent],
  templateUrl: './day-planner.component.html',
  styleUrl: './day-planner.component.css'
})
export class DayPlannerComponent {
  private readonly taskStore = inject(TaskStoreService);
  readonly focusAreas = this.taskStore.focusAreas;
  readonly tasks = this.taskStore.tasks;

  handleNewTask(taskData: { name: string; focusArea: string; subProjectId?: number | null }) {
    this.taskStore.addTask(taskData);
  }
  
  handleNewSubProject(subProjectData: { name: string; focusArea: string }) {
    this.taskStore.addSubProject(subProjectData);
  }
}
