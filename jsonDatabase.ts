import * as path from 'path';
import * as fs from 'fs';

export default class JSONDatabase<T extends { id: string | number, tokenAddress: string }> {
  private filePath: string;
  private data: T[];

  constructor(filename: string) {
    this.filePath = path.join(__dirname, filename);
    this.data = this.loadData();
  }

  private loadData(): T[] {
    try {
      const jsonData = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(jsonData) as T[];
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('Database file not found, initializing with an empty array.');
        return [];
      } else {
        console.error('Error loading data from JSON file:', error.message);
        return [];
      }
    }
  }

  private saveData(): void {
    try {
      const jsonString = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(this.filePath, jsonString);
      console.log('Data written to file successfully.');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  public create(item: T): void {
    this.data.push(item);
    this.saveData();
  }

  public getAll(): T[] {
    return this.data;
  }

  public getById(id: string | number): T | undefined {
    return this.data.find(item => item.id === id);
  }

  public getByTokenAddress(tokenAddress: string) : T | undefined {
    return this.data.find(item => item.tokenAddress === tokenAddress);
  }

  public update(id: string | number, updatedItem: Partial<T>): void {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updatedItem } as T;
      this.saveData();
    } else {
      console.log(`Itemwith id ${id} not found.`);
    }
  }

  public delete(id: string | number): void {
    this.data = this.data.filter(item => item.id !== id);
    this.saveData();
  }
}