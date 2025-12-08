import { Component } from '@angular/core';
import { DayPlannerComponent } from './day-planner/day-planner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DayPlannerComponent],   // we only need this for now
  templateUrl: './app.html',        // this is your template file
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'Daily Planner';
}
