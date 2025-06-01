export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "fiance" | "guest";
  createdAt: Date;
}
