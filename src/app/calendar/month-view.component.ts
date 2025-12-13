import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';

type MonthCell = {
  value: number;
  type: 'previous' | 'current' | 'next';
};

type NavigationTarget = {
  label: string;
  commands: (string | number)[];
};

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.css',
})
export class MonthViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.params, { initialValue: this.route.snapshot.params });
  readonly trackByIndex = (index: number) => index;

    private readonly supportedMonths = [
    { year: 2025, monthIndex: 10 },
    { year: 2025, monthIndex: 11 },
    ...Array.from({ length: 12 }, (_, monthIndex) => ({ year: 2026, monthIndex })),
  ];

  readonly monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  readonly dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  readonly viewModel = computed(() => this.createViewModel(this.params()));

  private createViewModel(params: Params): {
    monthName: string;
    year: number;
    cells: MonthCell[];
    previous?: NavigationTarget;
    next?: NavigationTarget;
  } {
    const monthIndex = Number(params['month']) - 1;
    const year = Number(params['year']);

    if (!Number.isFinite(monthIndex) || !Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
      return this.buildFallback();
    }

    const isSupportedMonth = this.supportedMonths.findIndex(
      (entry) => entry.year === year && entry.monthIndex === monthIndex,
    );

    if (isSupportedMonth === -1) {
      return this.buildFallback();
    }

    return {
      monthName: `${this.monthNames[monthIndex]} ${year}`.toUpperCase(),
      year,
      cells: this.buildMonthCells(year, monthIndex),
      ...this.buildNavigationTargets(year, monthIndex),
    };
  }

  private buildFallback(): { monthName: string; year: number; cells: MonthCell[] } {
    const now = new Date();
    const monthIndex = now.getMonth();
    const year = now.getFullYear();

    return {
      monthName: `${this.monthNames[monthIndex]} ${year}`.toUpperCase(),
      year,
      cells: this.buildMonthCells(year, monthIndex),
    };
  }

  private buildMonthCells(year: number, monthIndex: number): MonthCell[] {
    const startDate = new Date(year, monthIndex, 1);
    const startIndex = (startDate.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const previousMonthDays = new Date(year, monthIndex, 0).getDate();

    const cells: MonthCell[] = [];

    for (let day = previousMonthDays - startIndex + 1; day <= previousMonthDays; day += 1) {
      cells.push({ value: day, type: 'previous' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ value: day, type: 'current' });
    }

    let nextDay = 1;
    while (cells.length % 7 !== 0) {
      cells.push({ value: nextDay, type: 'next' });
      nextDay += 1;
    }

    return cells;
  }
  private buildNavigationTargets(year: number, monthIndex: number): {
    previous?: NavigationTarget;
    next?: NavigationTarget;
  } {
    const currentIndex = this.supportedMonths.findIndex(
      (entry) => entry.year === year && entry.monthIndex === monthIndex,
    );

    if (currentIndex === -1) {
      return {};
    }

    const previousEntry = this.supportedMonths[currentIndex - 1];
    const nextEntry = this.supportedMonths[currentIndex + 1];

    return {
      previous: previousEntry ? this.createNavigationTarget(previousEntry) : undefined,
      next: nextEntry ? this.createNavigationTarget(nextEntry) : undefined,
    };
  }

  private createNavigationTarget(entry: { year: number; monthIndex: number }): NavigationTarget {
    return {
      label: `${this.monthNames[entry.monthIndex]} ${entry.year}`,
      commands: ['/calendar', entry.year, entry.monthIndex + 1],
    };
  }
}