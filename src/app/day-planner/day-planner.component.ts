import { Component } from '@angular/core';
import { Task } from '../../task.model';
import { TaskComponent } from '../task/task.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { DatePipe } from '@angular/common';
import { TimeLeftPipe } from '../time-left.pipe';
import { HighlightDirective } from '../highlight.directive';

const today = new Date();

@Component({
  selector: 'app-day-planner',
  standalone: true,
  imports: [TaskComponent, AddTaskComponent, DatePipe, TimeLeftPipe, HighlightDirective],
  templateUrl: './day-planner.component.html',
  styleUrl: './day-planner.component.css'
})
export class DayPlannerComponent {
  selectedTask: Task | null = null;
tasks: Task[] = [
    {
      id: 1,
      name: 'Meeting with team',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 2,
      name: 'Client presentation',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
    {
      id: 3,
      name: 'Project deadline',
      time: this.addDaysToDate(today, 30),
      isDueToday: false,
      completed: false,
    },
    {
      id: 4,
      name: 'Team outing',
      time: this.startOfDay(new Date('Sat Apr 20 2024 00:00:00 GMT+0530')),
      isDueToday: false,
      completed: true,
    },
    {
      id: 5,
      name: 'Software update',
      time: this.startOfDay(new Date()),
      isDueToday: true,
      completed: false,
    },
  ];

  selectTask(task: Task) {
    this.selectedTask = task;
  }

  handleCompleteTask() {
    this.selectedTask = null;
  }

  handleNewTask(taskData: { name: string; date: string }) {

    const taskDate = this.startOfDay(new Date(taskData.date));
    const newTask = {
      id: this.tasks.length + 1,
      name: taskData.name,
      time: taskDate,
      completed: false,
      isDueToday: taskDate.getTime() === this.startOfDay(new Date()).getTime(),
    };

    this.tasks.push(newTask);
  }

  private startOfDay(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private addDaysToDate(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return this.startOfDay(result);
  }
}
