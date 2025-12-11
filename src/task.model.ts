export interface Task {
  id: number;
  focusArea: string;
  name: string;
  subProjectId?: number;
  isSubProject?: boolean;
}