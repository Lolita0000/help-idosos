import { api } from "./api";
import type { User } from "../models/User";

export const createUser = async (user: User) => {
  const response = await api.post("/user", user);
  return response.data;
};