import { Component } from '@angular/core';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { MatrixRainComponent } from "./matrix-rain/matrix-rain.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DayPlannerComponent, MatrixRainComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Daily Planner';
}
