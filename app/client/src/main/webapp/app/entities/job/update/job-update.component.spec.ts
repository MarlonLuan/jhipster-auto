jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { JobService } from '../service/job.service';
import { IJob, Job } from '../job.model';
import { ITask } from 'app/entities/task/task.model';
import { TaskService } from 'app/entities/task/service/task.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';

import { JobUpdateComponent } from './job-update.component';

describe('Component Tests', () => {
  describe('Job Management Update Component', () => {
    let comp: JobUpdateComponent;
    let fixture: ComponentFixture<JobUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let jobService: JobService;
    let taskService: TaskService;
    let employeeService: EmployeeService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [JobUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(JobUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(JobUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      jobService = TestBed.inject(JobService);
      taskService = TestBed.inject(TaskService);
      employeeService = TestBed.inject(EmployeeService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call Task query and add missing value', () => {
        const job: IJob = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const tasks: ITask[] = [{ id: '0c1c7d55-0887-4353-addc-065b733ae783' }];
        job.tasks = tasks;

        const taskCollection: ITask[] = [{ id: '11517ac7-b437-489d-9cb6-22648eb8fb8a' }];
        spyOn(taskService, 'query').and.returnValue(of(new HttpResponse({ body: taskCollection })));
        const additionalTasks = [...tasks];
        const expectedCollection: ITask[] = [...additionalTasks, ...taskCollection];
        spyOn(taskService, 'addTaskToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ job });
        comp.ngOnInit();

        expect(taskService.query).toHaveBeenCalled();
        expect(taskService.addTaskToCollectionIfMissing).toHaveBeenCalledWith(taskCollection, ...additionalTasks);
        expect(comp.tasksSharedCollection).toEqual(expectedCollection);
      });

      it('Should call Employee query and add missing value', () => {
        const job: IJob = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const employee: IEmployee = { id: 'e81b9511-47f8-4cf3-94eb-03221e8fbe64' };
        job.employee = employee;

        const employeeCollection: IEmployee[] = [{ id: '4345370a-9686-45b3-be93-08697dcc9a23' }];
        spyOn(employeeService, 'query').and.returnValue(of(new HttpResponse({ body: employeeCollection })));
        const additionalEmployees = [employee];
        const expectedCollection: IEmployee[] = [...additionalEmployees, ...employeeCollection];
        spyOn(employeeService, 'addEmployeeToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ job });
        comp.ngOnInit();

        expect(employeeService.query).toHaveBeenCalled();
        expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(employeeCollection, ...additionalEmployees);
        expect(comp.employeesSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const job: IJob = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const tasks: ITask = { id: '8e318344-bf98-4eb3-9fba-4a74d20d540d' };
        job.tasks = [tasks];
        const employee: IEmployee = { id: '3f473332-2d7f-4aa0-8333-56935b09cb20' };
        job.employee = employee;

        activatedRoute.data = of({ job });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(job));
        expect(comp.tasksSharedCollection).toContain(tasks);
        expect(comp.employeesSharedCollection).toContain(employee);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const job = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
        spyOn(jobService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ job });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: job }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(jobService.update).toHaveBeenCalledWith(job);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const job = new Job();
        spyOn(jobService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ job });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: job }));
        saveSubject.complete();

        // THEN
        expect(jobService.create).toHaveBeenCalledWith(job);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const job = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
        spyOn(jobService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ job });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(jobService.update).toHaveBeenCalledWith(job);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackTaskById', () => {
        it('Should return tracked Task primary key', () => {
          const entity = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const trackResult = comp.trackTaskById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });

      describe('trackEmployeeById', () => {
        it('Should return tracked Employee primary key', () => {
          const entity = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const trackResult = comp.trackEmployeeById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });

    describe('Getting selected relationships', () => {
      describe('getSelectedTask', () => {
        it('Should return option if no Task is selected', () => {
          const option = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const result = comp.getSelectedTask(option);
          expect(result === option).toEqual(true);
        });

        it('Should return selected Task for according option', () => {
          const option = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const selected = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const selected2 = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
          const result = comp.getSelectedTask(option, [selected2, selected]);
          expect(result === selected).toEqual(true);
          expect(result === selected2).toEqual(false);
          expect(result === option).toEqual(false);
        });

        it('Should return option if this Task is not selected', () => {
          const option = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const selected = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
          const result = comp.getSelectedTask(option, [selected]);
          expect(result === option).toEqual(true);
          expect(result === selected).toEqual(false);
        });
      });
    });
  });
});