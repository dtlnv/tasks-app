import { Component } from '@angular/core';

import { Task } from '../task.interface';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';

@Component({
  selector: 'app-list-component',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router
  ) {
    this.getTaskList();
  }

  onDoneTask(item: Task): void {
    // TODO: mark as completed
    // TODO: save updated task to storage
    throw new Error('Not implemented');
  }

  onDeleteTask(item: Task): void {
    const isConfirmed = confirm('Are you sure you want to delete this task?');
    if (isConfirmed) {
      item.isArchived = true;
      this.storageService.updateTaskItem(item);
      this.tasksService.getTasksFromStorage();
    }
  }

  onAddTask(): void {
    // TODO: navigate to add task
    throw new Error('Not implemented');
  }

  private async getTaskList(): Promise<void> {
    await this.tasksService.getTasksFromStorage();
  }
}
