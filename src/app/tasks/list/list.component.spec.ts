import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { Task } from '../task.interface';
import { generateTask } from '../task.generator';
import { Observable, of } from 'rxjs';
import { ListComponent } from './list.component';
import { TasksService } from '../tasks.service';
import { MatCardModule } from '@angular/material/card';
import { FiltersComponent } from '../filters/filters.component';
import { SearchComponent } from '../search/search.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

const fakeTasks: Task[] = [
  generateTask({ uuid: '3', completed: false }),
  generateTask({ uuid: '4', completed: false }),
];

class MockTasksService {
  tasks: Task[] = fakeTasks;
  getTasksFromApi(): Observable<Task[]> {
    return of(fakeTasks);
  }
  getTasksFromStorage(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  filterTask(): void {
    return;
  }
}

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve(fakeTasks);
  }
  updateTaskItem(): void {
    return;
  }
}

declare global {
  interface Window {
    confirm: (message?: string | undefined) => boolean;
  }
}

describe('ListComponent', () => {
  let fixture: ComponentFixture<ListComponent>;
  let loader: HarnessLoader;
  let component: ListComponent;
  let tasksService: TasksService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatChipsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatCheckboxModule,
      ],
      declarations: [ListComponent, FiltersComponent, SearchComponent],
      providers: [
        { provide: TasksService, useClass: MockTasksService },
        { provide: StorageService, useClass: MockStorageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    tasksService = TestBed.inject(TasksService);
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('My Daily Tasks');
  });

  it(`should display total number of tasks`, () => {
    const total = fixture.debugElement.query(By.css('h3'));
    expect(total.nativeElement.textContent).toEqual(
      `Total Tasks: ${fakeTasks.length}`,
    );
  });

  it(`should display list of tasks as mat-cards`, () => {
    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length);
  });

  it(`should navigate to /add when add button is clicked`, async () => {
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="add-task"]' }),
    );
    await addButton.click();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['add']);
  });

  it(`should mark a task as complete when checkbox is checked`, async () => {
    expect(tasksService.tasks[0].completed).toBe(false);
    jest.spyOn(component, 'onDoneTask');
    const completeCheckbox = await loader.getHarness(
      MatCheckboxHarness.with({ selector: '[data-testid="complete-task"]' }),
    );
    await completeCheckbox.check();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(true);
  });

  it(`should roll back a task to incomplete when checkbox is unchecked`, async () => {
    tasksService.tasks[0].completed = true;
    jest.spyOn(component, 'onDoneTask');
    const completeCheckbox = await loader.getHarness(
      MatCheckboxHarness.with({ selector: '[data-testid="complete-task"]' }),
    );
    await completeCheckbox.uncheck();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(false);
  });

  it(`should check and uncheck a task`, async () => {
    jest.spyOn(component, 'onDoneTask');
    const completeCheckbox = await loader.getHarness(
      MatCheckboxHarness.with({ selector: '[data-testid="complete-task"]' }),
    );

    await completeCheckbox.check();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks[0].completed).toBe(true);

    await completeCheckbox.uncheck();
    fixture.detectChanges();
    expect(component.onDoneTask).toHaveBeenCalledTimes(2);
    expect(tasksService.tasks[0].completed).toBe(false);
  });

  it(`should mark a task as archived when delete button is clicked`, async () => {
    expect(tasksService.tasks[0].isArchived).toBe(false);
    jest.spyOn(component, 'onDeleteTask');
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    expect(tasksService.tasks.length).toBe(2);

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await deleteButton.click();
    fixture.detectChanges();

    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks.length).toBe(1);
  });

  it(`should not mark a task as archived when delete button is clicked and user cancels`, async () => {
    jest.spyOn(component, 'onDeleteTask');
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );
    expect(tasksService.tasks.length).toBe(2);

    jest.spyOn(window, 'confirm').mockReturnValue(false);

    await deleteButton.click();
    fixture.detectChanges();

    expect(component.onDeleteTask).toHaveBeenCalledTimes(1);
    expect(tasksService.tasks.length).toBe(2);
  });

  it(`should not display archived tasks after deleting them`, async () => {
    const deleteButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="delete-task"]' }),
    );

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    await deleteButton.click();
    fixture.detectChanges();

    const taskLists = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(taskLists.length).toEqual(fakeTasks.length - 1);
  });

  it(`should display 'No tasks found' when there are no tasks`, async () => {
    tasksService.tasks = [];
    fixture.detectChanges();
    const noTasks = fixture.debugElement.query(By.css('mat-card-title'));
    expect(noTasks.nativeElement.textContent).toEqual('No Tasks Found');
  });
});
