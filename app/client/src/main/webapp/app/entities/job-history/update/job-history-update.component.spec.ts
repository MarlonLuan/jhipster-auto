jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { JobHistoryService } from '../service/job-history.service';
import { IJobHistory, JobHistory } from '../job-history.model';
import { IJob } from 'app/entities/job/job.model';
import { JobService } from 'app/entities/job/service/job.service';
import { IDepartment } from 'app/entities/department/department.model';
import { DepartmentService } from 'app/entities/department/service/department.service';
import { IEmployee } from 'app/entities/employee/employee.model';
import { EmployeeService } from 'app/entities/employee/service/employee.service';

import { JobHistoryUpdateComponent } from './job-history-update.component';

describe('Component Tests', () => {
  describe('JobHistory Management Update Component', () => {
    let comp: JobHistoryUpdateComponent;
    let fixture: ComponentFixture<JobHistoryUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let jobHistoryService: JobHistoryService;
    let jobService: JobService;
    let departmentService: DepartmentService;
    let employeeService: EmployeeService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [JobHistoryUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(JobHistoryUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(JobHistoryUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      jobHistoryService = TestBed.inject(JobHistoryService);
      jobService = TestBed.inject(JobService);
      departmentService = TestBed.inject(DepartmentService);
      employeeService = TestBed.inject(EmployeeService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call job query and add missing value', () => {
        const jobHistory: IJobHistory = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const job: IJob = { id: '13710805-9257-4b19-8571-61db1c8b30ff' };
        jobHistory.job = job;

        const jobCollection: IJob[] = [{ id: '3ceb3e9c-2ebb-412d-a506-3fe6b5037238' }];
        spyOn(jobService, 'query').and.returnValue(of(new HttpResponse({ body: jobCollection })));
        const expectedCollection: IJob[] = [job, ...jobCollection];
        spyOn(jobService, 'addJobToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        expect(jobService.query).toHaveBeenCalled();
        expect(jobService.addJobToCollectionIfMissing).toHaveBeenCalledWith(jobCollection, job);
        expect(comp.jobsCollection).toEqual(expectedCollection);
      });

      it('Should call department query and add missing value', () => {
        const jobHistory: IJobHistory = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const department: IDepartment = { id: 'f9e8caf7-be77-40eb-a8f7-6298116d359e' };
        jobHistory.department = department;

        const departmentCollection: IDepartment[] = [{ id: 'fc67813f-0c90-4527-b921-27c8f4c146c9' }];
        spyOn(departmentService, 'query').and.returnValue(of(new HttpResponse({ body: departmentCollection })));
        const expectedCollection: IDepartment[] = [department, ...departmentCollection];
        spyOn(departmentService, 'addDepartmentToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        expect(departmentService.query).toHaveBeenCalled();
        expect(departmentService.addDepartmentToCollectionIfMissing).toHaveBeenCalledWith(departmentCollection, department);
        expect(comp.departmentsCollection).toEqual(expectedCollection);
      });

      it('Should call employee query and add missing value', () => {
        const jobHistory: IJobHistory = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const employee: IEmployee = { id: '93f9cb6a-4f20-4faf-8375-9feaacd97bd7' };
        jobHistory.employee = employee;

        const employeeCollection: IEmployee[] = [{ id: 'ef7e4b9f-3e1e-49ff-8cc9-f9184072db39' }];
        spyOn(employeeService, 'query').and.returnValue(of(new HttpResponse({ body: employeeCollection })));
        const expectedCollection: IEmployee[] = [employee, ...employeeCollection];
        spyOn(employeeService, 'addEmployeeToCollectionIfMissing').and.returnValue(expectedCollection);

        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        expect(employeeService.query).toHaveBeenCalled();
        expect(employeeService.addEmployeeToCollectionIfMissing).toHaveBeenCalledWith(employeeCollection, employee);
        expect(comp.employeesCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const jobHistory: IJobHistory = { id: '1361f429-3817-4123-8ee3-fdf8943310b2' };
        const job: IJob = { id: 'aa037f12-a2f4-461f-b742-baff48ec77c4' };
        jobHistory.job = job;
        const department: IDepartment = { id: 'd1d92c8d-4fc8-44dd-b16e-d59b21ebfeed' };
        jobHistory.department = department;
        const employee: IEmployee = { id: 'a76b6666-d0f3-4b3c-aa06-c4f3afa4fe59' };
        jobHistory.employee = employee;

        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(jobHistory));
        expect(comp.jobsCollection).toContain(job);
        expect(comp.departmentsCollection).toContain(department);
        expect(comp.employeesCollection).toContain(employee);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const jobHistory = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
        spyOn(jobHistoryService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: jobHistory }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(jobHistoryService.update).toHaveBeenCalledWith(jobHistory);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject();
        const jobHistory = new JobHistory();
        spyOn(jobHistoryService, 'create').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: jobHistory }));
        saveSubject.complete();

        // THEN
        expect(jobHistoryService.create).toHaveBeenCalledWith(jobHistory);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject();
        const jobHistory = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
        spyOn(jobHistoryService, 'update').and.returnValue(saveSubject);
        spyOn(comp, 'previousState');
        activatedRoute.data = of({ jobHistory });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(jobHistoryService.update).toHaveBeenCalledWith(jobHistory);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackJobById', () => {
        it('Should return tracked Job primary key', () => {
          const entity = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const trackResult = comp.trackJobById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });

      describe('trackDepartmentById', () => {
        it('Should return tracked Department primary key', () => {
          const entity = { id: '9fec3727-3421-4967-b213-ba36557ca194' };
          const trackResult = comp.trackDepartmentById(0, entity);
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
  });
});
