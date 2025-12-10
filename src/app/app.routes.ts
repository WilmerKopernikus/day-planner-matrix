import { Routes } from '@angular/router';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { FocusAreasComponent } from './focus-areas/focus-areas.component';

export const routes: Routes = [
  { path: '', redirectTo: 'focus-areas', pathMatch: 'full' },
  { path: 'daily-planner', component: DayPlannerComponent },
  { path: 'focus-areas', component: FocusAreasComponent },
  { path: '**', redirectTo: 'focus-areas' },
];
