import type { LoginUserDTO } from "../../models/auth/LoginUserDTO";
import type { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import type { AuthResponseType } from "../../types/AuthResponseType";

export interface IAuthAPI {
  login(data: LoginUserDTO): Promise<AuthResponseType>;
  register(data: RegistrationUserDTO): Promise<AuthResponseType>;
}