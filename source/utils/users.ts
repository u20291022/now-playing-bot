import { fileSystem } from "./filesystem";
import { UserData, UsersList } from "../types";

class Users {
  private usersFilePath = `${fileSystem.getDataDirectoryPath()}/users.json`
  private usersList: UsersList = {};

  constructor() {
    fileSystem.exists(this.usersFilePath) ?
      this.loadUsersData() : this.saveUsersData();
  }

  public setUserData(userId: string | number, userData: UserData): void {
    this.usersList[userId] = userData;
    this.saveUsersData();
  }

  public addUser(userId: string | number, accessToken: string): void {
    this.setUserData(userId, {
      accessToken,
      expirationTime: new Date().getTime() + (1 * 60 * 60 * 1000)
    });
  }

  public getUserData(userId: string | number): UserData {
    return this.usersList[userId];
  }

  public exists(userId: string | number): boolean {
    return !!this.usersList[userId];
  }

  private loadUsersData(): void {
    this.usersList = fileSystem.readJson(this.usersFilePath) as UsersList;
  }

  private saveUsersData(): void {
    fileSystem.writeJson(this.usersFilePath, this.usersList);
  }
}

export const users = new Users();