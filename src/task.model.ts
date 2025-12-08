export interface Task {
  id: number;
  name: string;
  time: Date;
  isDueToday: boolean;
  completed: boolean;
}