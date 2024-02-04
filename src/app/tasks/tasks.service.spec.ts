import { TasksService } from './tasks.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StorageService } from '../storage/storage.service';
import { Task, TaskPriority } from './task.interface';
import { generateTask } from './task.generator';

class MockStorageService {
  getTasks(): Promise<Task[]> {
    return Promise.resolve([]);
  }
}

describe('TasksService', () => {
  let service: TasksService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TasksService,
        { provide: StorageService, useClass: MockStorageService },
      ],
    });

    service = TestBed.inject(TasksService);
    storageService = TestBed.inject(StorageService);
  });

  describe('getTasksFromStorage', () => {
    it('should load tasks from storage', (done) => {
      jest.spyOn(storageService, 'getTasks').mockResolvedValueOnce([]);
      service.getTasksFromStorage().then(() => {
        expect(service.tasks).toEqual([]);
        expect(storageService.getTasks).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('should filter tasks by isArchived', (done) => {
      jest.spyOn(storageService, 'getTasks').mockResolvedValueOnce([]);
      jest.spyOn(service, 'filterTask');
      service.getTasksFromStorage().then(() => {
        expect(service.tasks).toEqual([]);
        expect(service.filterTask).toHaveBeenCalledTimes(1);
        expect(service.filterTask).toHaveBeenCalledWith('isArchived');
        done();
      });
    });
  });

  describe('filterTask', () => {
    it('should filter task by isArchived key', () => {
      service.tasks = [generateTask(), generateTask({ isArchived: true })];
      service.filterTask('isArchived');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by priority key', () => {
      service.tasks = [
        generateTask({ priority: TaskPriority.LOW }),
        generateTask({ priority: TaskPriority.HIGH }),
      ];
      service.filterTask('priority');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by completed key', () => {
      service.tasks = [
        generateTask({ completed: false }),
        generateTask({ completed: true }),
      ];
      service.filterTask('completed');
      expect(service.tasks.length).toEqual(1);
    });

    it('should filter task by scheduledDate key', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      service.tasks = [
        generateTask({ scheduledDate: new Date() }),
        generateTask({ scheduledDate: tomorrow }),
      ];
      service.filterTask('scheduledDate');
      expect(service.tasks.length).toEqual(1);
    });
  });

  describe('searchTask', () => {
    it('should search task list for title with search term', () => {
      service.tasks = [
        generateTask({ title: 'Take home assignment' }),
        generateTask({ title: 'Thank you for your time' }),
      ];
      service.searchTask('home');
      expect(service.tasks.length).toEqual(1);
    });

    it('should reset task list if search term is empty', () => {
      service.tasks = [
        generateTask({ title: 'Take home assignment' }),
        generateTask({ title: 'Thank you for your time' }),
      ];
      service.searchTask('');
      expect(service.tasks.length).toEqual(2);
    });

    it('should search task list for a fuzzy match on title', () => {
      service.tasks = [
        generateTask({ title: 'Thank you for your time' }),
        generateTask({ title: 'Take home assignment' }),
      ];
      const uuid = service.tasks[1].uuid;
      service.searchTask('hoem');
      expect(service.tasks.length).toEqual(1);
      expect(service.tasks[0].uuid).toEqual(uuid);
    });
  });
});
