import { Component } from '@angular/core';
import { Task } from '../../task.model';
import { TaskComponent } from '../task/task.component';
import { AddTaskComponent } from '../add-task/add-task.component';
import { DatePipe } from '@angular/common';
import { TimeLeftPipe } from '../time-left.pipe'
import { HighlightDirective } from '../highlight.directive'
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

  tasks: Task[]  = [
    { id: 1, name: 'Meeting with team', time: new Date(new Date().setHours(21)), isDueToday: true, completed: false },
    { id: 2, name: 'Client presentation', time: new Date(new Date().setMinutes(59)), isDueToday: true, completed: false },
    { id: 3, name: 'Project deadline', time: new Date(new Date().setMonth(today.getMonth() + 1)), isDueToday: false, completed: false },
    { id: 4, name: 'Team outing', time: new Date('Sat Apr 20 2024 13:00:00 GMT+0530'), isDueToday: false, completed: true },
    { id: 5, name: 'Software update', time: new Date(), isDueToday: true, completed: false }
  ];

  selectTask(task: Task) {
    this.selectedTask = task;
  }

  handleCompleteTask() {
    this.selectedTask = null;
  }

  handleNewTask(taskData: { name: string; date: string }) {

    const taskDate = new Date(taskData.date)
    const newTask = {
      id: this.tasks.length + 1,
      name: taskData.name,
      time: taskDate,
      completed: false,
      isDueToday: taskDate.toDateString() === new Date().toDateString()
    };

    this.tasks.push(newTask)
  }
}
