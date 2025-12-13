import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type CalendarMonth = {
  name: string;
  days: (number | null)[];
  daysInMonth: number;
};

type YearCalendar = {
  year: number;
  months: CalendarMonth[];
};


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
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
    const firstDay = new Date(year, monthIndex, 1);
    const startIndex = (firstDay.getDay() + 6) % 7; // Monday-first layout
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days: (number | null)[] = Array(startIndex).fill(null);

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(day);
    }

    const remainder = days.length % 7;
    if (remainder !== 0) {
      days.push(...Array(7 - remainder).fill(null));
    }

    return { name, days, daysInMonth };
  }
}