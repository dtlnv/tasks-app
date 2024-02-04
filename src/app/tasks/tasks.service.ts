import { Injectable } from '@angular/core';
import { Task } from './task.interface';
import { StorageService } from '../storage/storage.service';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];
  originalTasks: Task[] = [];

  constructor(private storageService: StorageService) {}

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    if (!this.originalTasks.length) {
      // We need to use this.originalTasks to store the tasks from the storage
      this.originalTasks = this.tasks;
    }

    switch (key) {
      case 'isArchived':
        this.tasks = this.originalTasks = this.tasks.filter(
          (task) => !task.isArchived
        );
        break;
      case 'priority':
        this.tasks = this.originalTasks.filter(
          (task) => task.priority === 'HIGH'
        );
        break;
      case 'scheduledDate':
        this.tasks = this.originalTasks.filter((task) => {
          const taskDate: Date = new Date(task.scheduledDate);
          const today: Date = new Date();

          return (
            taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate()
          );
        });
        break;
      case 'completed':
        this.tasks = this.originalTasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    if (search) {
      if (!this.originalTasks.length) {
        // We need to use this.originalTasks to store the tasks from the storage
        this.originalTasks = this.tasks;
      }

      const fuse: Fuse<Task> = new Fuse(this.originalTasks, {
        isCaseSensitive: false,
        keys: ['title'],
      });

      const result = fuse.search<Task>(search);
      this.tasks = result.map((item: { item: Task }) => item.item);
    } else {
      this.getTasksFromStorage();
    }
  }
}
