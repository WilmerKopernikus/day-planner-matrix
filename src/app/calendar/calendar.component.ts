import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type CalendarMonth = {
  name: string;
  days: (number | null)[];
  daysInMonth: number;
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent {
  readonly year = 2026;
  readonly dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  readonly months = this.buildCalendar();

  private buildCalendar(): CalendarMonth[] {
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

    return monthNames.map((name, index) => this.createMonth(name, index));
  }

  private createMonth(name: string, monthIndex: number): CalendarMonth {
    const firstDay = new Date(this.year, monthIndex, 1);
    const startIndex = (firstDay.getDay() + 6) % 7; // Monday-first layout
    const daysInMonth = new Date(this.year, monthIndex + 1, 0).getDate();
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