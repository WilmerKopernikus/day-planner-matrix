import { Routes } from '@angular/router';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { FocusAreasComponent } from './focus-areas/focus-areas.component';
import { LandingComponent } from './add-task/landing/landing.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MonthViewComponent } from './calendar/month-view.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'daily-planner', component: DayPlannerComponent },
  { path: 'focus-areas', component: FocusAreasComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'calendar', component: CalendarComponent, pathMatch: 'full' },
  { path: 'calendar/:year/:month', component: MonthViewComponent },
  { path: '**', redirectTo: 'focus-areas' },
];
