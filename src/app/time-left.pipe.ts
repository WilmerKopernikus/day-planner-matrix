import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeLeft',
})
export class TimeLeftPipe implements PipeTransform {
  transform(dueDate: Date): string {
    if (!dueDate) return 'No due date provided';

    const today = this.startOfDay(new Date());
    const dueDay = this.startOfDay(new Date(dueDate));
    const daysLeft = this.calculateDayDifference(dueDay, today);

    if (daysLeft < 0) {
      return 'Time is up';
    }
    if (daysLeft === 0) {
      return 'Due today';
    }

  return `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
  }

  private startOfDay(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private calculateDayDifference(dueDate: Date, currentDate: Date): number {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const difference = dueDate.getTime() - currentDate.getTime();
    return Math.round(difference / millisecondsInDay);
  }
}