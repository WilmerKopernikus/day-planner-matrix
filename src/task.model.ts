export interface Task {
  id: number;
  focusArea: string;
  name: string;
  time: Date;
  isDueToday: boolean;
  completed: boolean;
}