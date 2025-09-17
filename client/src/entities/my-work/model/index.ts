export interface MyWork {
  id: number;
  title: string;
  square: string;
  quantity: string;
  time: string;
  success_work: string[] | string;
  image: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MyWorkState {
  works: MyWork[];
  currentWork: MyWork | null;
  loading: boolean;
  error: string | null;
}