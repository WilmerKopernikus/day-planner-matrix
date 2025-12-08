import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { MatrixRainComponent } from "./matrix-rain/matrix-rain.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DayPlannerComponent, MatrixRainComponent],
  templateUrl: './app.html',
})
export class App {
  title = 'Daily Planner';  // whatever you want
  // later: put your planner logic here (tasks, dates, etc.)
}

