import { Injectable } from '@angular/core';
import { Task, TaskPriority } from './task.interface';
import { StorageService } from '../storage/storage.service';
import { generateTask } from './task.generator';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(private storageService: StorageService) {}

  getBaseTasks(): Task[] {
    return [
      generateTask({
        uuid: '1',
        title: 'Load App',
        completed: true,
        description: 'Successfully load the app',
        priority: TaskPriority.MEDIUM,
        scheduledDate: new Date(),
      }),
      generateTask({
        uuid: '2',
        title: 'Complete take home assignment',
        completed: false,
        description: 'Task is not complete until all tests pass',
        priority: TaskPriority.HIGH,
        scheduledDate: new Date(),
      }),
    ];
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        // TODO: add fitler for taks with High Priority
        throw new Error('Not implemented');
      case 'scheduledDate':
        // TODO: add fitler for tasks Due Today
        throw new Error('Not implemented');
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    if (search) {
      // TODO: filter tasks which title include search value
      throw new Error('Not implemented');
    } else {
      // TODO: reload all tasks from storage
      throw new Error('Not implemented');
    }
  }
}
