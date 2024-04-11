export interface UserData {
  accessToken: string, 
  refreshToken?: string,
  expirationTime: number
}

export interface UsersList {
  [userId: string]: UserData
}