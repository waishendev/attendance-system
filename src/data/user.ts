export interface User {
  id: string | number;
  name: string;
  pin: string;
}

export const user: User = {
  id: 1,
  name: "Alice",
  pin: "1234",
};
