import { Routes } from '@angular/router';
import { DayPlannerComponent } from './day-planner/day-planner.component';
import { FocusAreasComponent } from './focus-areas/focus-areas.component';
import { LandingComponent } from './add-task/landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'daily-planner', component: DayPlannerComponent },
  { path: 'focus-areas', component: FocusAreasComponent },
  { path: '**', redirectTo: 'focus-areas' },
];
