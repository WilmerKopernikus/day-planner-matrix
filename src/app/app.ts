import { DayPlannerComponent } from './day-planner/day-planner.component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DayPlannerComponent], // keep this, or even empty [] if you don't use common directives
  templateUrl: './app.html',
})
export class App {
  title = 'Daily Planner';  // whatever you want
  // later: put your planner logic here (tasks, dates, etc.)
}

