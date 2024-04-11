import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";

class FileSystem {
  private dataDirectoryPath = "data"

  constructor() {
    this.mkdir(this.dataDirectoryPath);
  }

  public exists(path: string): boolean {
    return existsSync(path);
  }

  public mkdir(path: string): void {
    if (!this.exists(path)) {
      mkdirSync(path, {recursive: true});
    }
  }

  public readJson(path: string): object {
    try {
      const fileData = readFileSync(path, {encoding: "utf-8"});
      return JSON.parse(fileData);
    }
    catch {
      return {};
    }
  }

  public writeJson(path: string, data: any): void {
    writeFileSync(path, JSON.stringify(data, null, "\t"));
  }

  public getDataDirectoryPath(): string {
    return this.dataDirectoryPath;
  }

  public remove(path: string): void {
    if (this.exists(path)) rmSync(path);
  }
}

export const fileSystem = new FileSystem();