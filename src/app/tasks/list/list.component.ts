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
  protected title = 'My Daily Tasks';

  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router
  ) {
    this.getTaskList();
  }

  /**
   * Mark task as completed
   * @param item Task
   */
  onDoneTask(item: Task, state: boolean): void {
    item.completed = state || !item.completed;
    this.storageService.updateTaskItem(item);
  }

  /**
   * Mark task as archived
   * @param item Task
   */
  onDeleteTask(item: Task): void {
    if (window.confirm('Are you sure you want to delete this task?')) {
      item.isArchived = true;
      this.storageService.updateTaskItem(item);
      this.tasksService.tasks = this.tasksService.tasks.filter(
        (task: Task) => task.uuid !== item.uuid,
      );
    }
  }

  /**
   * Navigate to add task page
   */
  onAddTask(): void {
    this.router.navigate(['add']);
  }

  private async getTaskList(): Promise<void> {
    await this.tasksService.getTasksFromStorage();
  }
}
