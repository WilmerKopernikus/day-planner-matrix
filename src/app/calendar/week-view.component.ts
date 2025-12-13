import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';

type WeekDay = {
  label: string;
  dateLabel: string;
  isoDate: string;
};

type NavigationTarget = {
  label: string;
  commands: (string | number)[];
};

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './week-view.component.html',
  styleUrl: './week-view.component.css',
})
export class WeekViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.params, { initialValue: this.route.snapshot.params });

  readonly dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  readonly viewModel = computed(() => this.buildViewModel(this.params()));

  private buildViewModel(params: Params): {
    weekNumber: number;
    monthNumber: number;
    year: number;
    days: WeekDay[];
    previous?: NavigationTarget;
    next?: NavigationTarget;
  } {
    const parsedWeek = Number(params['week']);
    const parsedYear = Number(params['year']);

    if (!this.isValidISOWeek(parsedWeek, parsedYear)) {
      const today = new Date();
      const { week, weekYear } = this.getISOWeekInfo(today);
      return this.buildWeekView(weekYear, week);
    }

    return this.buildWeekView(parsedYear, parsedWeek);
  }

  private buildWeekView(year: number, weekNumber: number) {
    const startDate = this.getStartDateOfISOWeek(weekNumber, year);
    const days: WeekDay[] = [];

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + index);
      days.push({
        label: this.dayLabels[index],
        dateLabel: date.getUTCDate().toString(),
        isoDate: date.toISOString().slice(0, 10),
      });
    }

    return {
      weekNumber,
      monthNumber: startDate.getUTCMonth() + 1,
      year,
      days,
      ...this.buildNavigation(startDate),
    };
  }

  private buildNavigation(startDate: Date): {
    previous?: NavigationTarget;
    next?: NavigationTarget;
  } {
    const previousDate = new Date(startDate);
    previousDate.setUTCDate(startDate.getUTCDate() - 7);
    const { week: prevWeek, weekYear: prevYear } = this.getISOWeekInfo(previousDate);

    const nextDate = new Date(startDate);
    nextDate.setUTCDate(startDate.getUTCDate() + 7);
    const { week: nextWeek, weekYear: nextYear } = this.getISOWeekInfo(nextDate);

    return {
      previous: {
        label: `Week ${prevWeek}, ${prevYear}`,
        commands: ['/calendar', prevYear, 'week', prevWeek],
      },
      next: {
        label: `Week ${nextWeek}, ${nextYear}`,
        commands: ['/calendar', nextYear, 'week', nextWeek],
      },
    };
  }

  private getStartDateOfISOWeek(week: number, year: number): Date {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dayOfWeek = simple.getUTCDay() || 7;
    if (dayOfWeek <= 4) {
      simple.setUTCDate(simple.getUTCDate() - dayOfWeek + 1);
    } else {
      simple.setUTCDate(simple.getUTCDate() + 8 - dayOfWeek);
    }
    return simple;
  }

  private isValidISOWeek(week: number, year: number): boolean {
    if (!Number.isInteger(week) || !Number.isInteger(year)) {
      return false;
    }

    const { week: lastWeek, weekYear } = this.getISOWeekInfo(new Date(Date.UTC(year, 11, 28)));

    if (weekYear !== year) {
      return false;
    }
    return week >= 1 && week <= lastWeek;
  }

  private getISOWeekInfo(date: Date): { week: number; weekYear: number } {
    const workingDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = workingDate.getUTCDay() || 7;
    workingDate.setUTCDate(workingDate.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((workingDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    return { week, weekYear: workingDate.getUTCFullYear() };
  }
}