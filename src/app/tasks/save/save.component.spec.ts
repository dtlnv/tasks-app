import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { SaveComponent } from './save.component';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Router } from '@angular/router';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

class MockStorageService {
  updateTaskItem(): void {
    return;
  }
}

describe('SaveComponent', () => {
  let fixture: ComponentFixture<SaveComponent>;
  let loader: HarnessLoader;
  let component: SaveComponent;
  let storageService: StorageService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatIconModule,
      ],
      declarations: [SaveComponent],
      providers: [{ provide: StorageService, useClass: MockStorageService }],
    }).compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    storageService = TestBed.inject(StorageService);
    fixture = TestBed.createComponent(SaveComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should display the title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toEqual('Add Task');
  });

  it(`should navigate to home when cancel button is clicked`, async () => {
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(component, 'onCancel');
    const cancelButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="cancel"]' })
    );
    await cancelButton.click();
    fixture.detectChanges();
    expect(component.onCancel).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it(`should prevent adding task without a valid title`, async () => {
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="save-task"]' })
    );
    expect(await addButton.isDisabled()).toBeTruthy();
    component['saveTaskForm'].controls['title'].setValue('Invalid');
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeTruthy();
    component['saveTaskForm'].controls['title'].setValue(
      'This is a valid title'
    );
    fixture.detectChanges();
    expect(await addButton.isDisabled()).toBeFalsy();
  });

  it(`should create a new task for a valid submission and navigate home`, async () => {
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'updateTaskItem').mockResolvedValue();
    component['saveTaskForm'].controls['title'].setValue('Adding a test task');
    component['saveTaskForm'].controls['description'].setValue(
      'This task should be added to the list'
    );
    fixture.detectChanges();
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="save-task"]' })
    );
    await addButton.click();
    fixture.detectChanges();
    expect(component.onSubmit).toBeCalledTimes(1);
    expect(storageService.updateTaskItem).toBeCalledTimes(1);
    expect(storageService.updateTaskItem).toBeCalledWith(
      expect.objectContaining({
        isArchived: false,
        title: 'Adding a test task',
        description: 'This task should be added to the list',
      })
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it(`should create a new task with a scheduled date`, async () => {
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'updateTaskItem').mockResolvedValue();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    component['saveTaskForm'].controls['title'].setValue('Adding a test task');
    component['saveTaskForm'].controls['description'].setValue(
      'This task should be added to the list'
    );
    component['saveTaskForm'].controls['scheduledDate'].setValue(tomorrow);
    fixture.detectChanges();
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="save-task"]' })
    );
    await addButton.click();
    fixture.detectChanges();
    expect(component.onSubmit).toBeCalledTimes(1);
    expect(storageService.updateTaskItem).toBeCalledTimes(1);
    expect(storageService.updateTaskItem).toBeCalledWith(
      expect.objectContaining({
        title: 'Adding a test task',
        description: 'This task should be added to the list',
        scheduledDate: tomorrow,
      })
    );
  });

  it(`should not create a new task with a scheduled date in the past`, async () => {
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'updateTaskItem').mockResolvedValue();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    component['saveTaskForm'].controls['title'].setValue('Adding a test task');
    component['saveTaskForm'].controls['description'].setValue(
      'This task should not be added to the list'
    );
    component['saveTaskForm'].controls['scheduledDate'].setValue(yesterday);
    fixture.detectChanges();
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="save-task"]' })
    );
    await addButton.click();
    fixture.detectChanges();
    expect(component.onSubmit).toBeCalledTimes(0);
    expect(storageService.updateTaskItem).toBeCalledTimes(0);
  });

  it(`should not create a new task with a scheduled date more than 7 days in the future`, async () => {
    jest.spyOn(component, 'onSubmit');
    jest.spyOn(storageService, 'updateTaskItem').mockResolvedValue();

    const eightDaysAhead = new Date();
    eightDaysAhead.setDate(eightDaysAhead.getDate() + 8);

    component['saveTaskForm'].controls['title'].setValue('Adding a test task');
    component['saveTaskForm'].controls['description'].setValue(
      'This task should not be added to the list'
    );
    component['saveTaskForm'].controls['scheduledDate'].setValue(
      eightDaysAhead
    );
    fixture.detectChanges();
    const addButton = await loader.getHarness(
      MatButtonHarness.with({ selector: '[data-testid="save-task"]' })
    );
    await addButton.click();
    fixture.detectChanges();
    expect(component.onSubmit).toBeCalledTimes(0);
    expect(storageService.updateTaskItem).toBeCalledTimes(0);
  });
});
