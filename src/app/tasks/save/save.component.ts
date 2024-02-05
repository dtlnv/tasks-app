import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskPriority } from '../task.interface';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';

@Component({
  selector: 'app-save-component',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss'],
})
export class SaveComponent implements OnInit {
  protected title = 'Add Task';
  protected taskId: string | undefined;
  protected saveTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      }
    ),
    scheduledDate: new FormControl(new Date()),
  });
  protected priorities = Object.values(TaskPriority);

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit(): void {
    if (this.router.url.includes('edit')) {
      this.taskId = this.router.url.split('/').pop();
      if (this.taskId) {
        this.title = 'Edit Task';
        this.storageService.getTask(this.taskId).then((task) => {
          this.saveTaskForm.patchValue(task);
        });
      }
    }
  }

  /**
   * Get minimum date for scheduled date
   * @returns Date
   */
  getMinDate(): Date {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new Date();
  }

  /**
   * Get maximum date for scheduled date
   * @returns Date
   */
  getMaxDate(): Date {
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);
    return sevenDaysAhead;
  }

  /**
   * Save new task to storage and navigate to home page
   */
  onSubmit() {
    const task: Task = {
      ...this.saveTaskForm.getRawValue(),
      uuid: faker.string.uuid(),
      isArchived: false,
    };

    if (this.taskId) {
      task.uuid = this.taskId;
    }

    this.storageService.updateTaskItem(task);
    this.router.navigateByUrl('/');
  }

  /**
   * Just navigate to home page
   */
  onCancel(): void {
    this.router.navigateByUrl('/');
  }
}
