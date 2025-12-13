import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

type CalendarMonth = {
  name: string;
  daysInMonth: number;
  monthIndex: number;
  weeks: CalendarWeek[];
};

type YearCalendar = {
  year: number;
  months: CalendarMonth[];
};

type CalendarWeek = {
  weekNumber: number;
  weekYear: number;
  days: CalendarDay[];
};

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  label: number;
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  readonly calendars: YearCalendar[] = [
    { year: 2025, months: this.buildCalendar(2025, [10, 11]) },
    { year: 2026, months: this.buildCalendar(2026) },
  ];
  readonly dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  private buildCalendar(year: number, monthIndices?: number[]): CalendarMonth[] {
    const monthNames = [
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

    const indices = monthIndices ?? Array.from({ length: 12 }, (_, index) => index);

    return indices.map((index) => this.createMonth(monthNames[index], index, year));
  }

  private createMonth(name: string, monthIndex: number, year: number): CalendarMonth {
    const firstDay = new Date(Date.UTC(year, monthIndex, 1));
    const startIndex = (firstDay.getUTCDay() + 6) % 7; // Monday-first layout
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;

    const weeks: CalendarWeek[] = [];

    for (let index = 0; index < totalCells; index += 1) {
      const calendarDate = new Date(Date.UTC(year, monthIndex, 1 - startIndex + index));
      const weekIndex = Math.floor(index / 7);
      const { week, weekYear } = this.getISOWeekInfo(calendarDate);

      if (!weeks[weekIndex]) {
        weeks[weekIndex] = { weekNumber: week, weekYear, days: [] };
      }

      weeks[weekIndex].days.push({
        date: calendarDate,
        isCurrentMonth: calendarDate.getUTCMonth() === monthIndex,
        label: calendarDate.getUTCDate(),
      });
    }

    return { name, weeks, daysInMonth, monthIndex };
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