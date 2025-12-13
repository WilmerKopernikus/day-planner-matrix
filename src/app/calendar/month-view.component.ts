import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';

type MonthCell = {
  value: number;
  type: 'previous' | 'current' | 'next';
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
  } {
    const monthIndex = Number(params['month']) - 1;
    const year = Number(params['year']);

    if (!Number.isFinite(monthIndex) || !Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
      return this.buildFallback();
    }

    const isSupportedMonth = (year === 2025 && monthIndex >= 10) || year === 2026;

    if (!isSupportedMonth) {
      return this.buildFallback();
    }

    return {
      monthName: `${this.monthNames[monthIndex]} ${year}`.toUpperCase(),
      year,
      cells: this.buildMonthCells(year, monthIndex),
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
}