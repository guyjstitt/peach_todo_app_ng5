import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { catchError, finalize, mergeMap } from 'rxjs/operators';
import { ChangeDetectorRef, Component, ErrorHandler, OnInit, ViewChild } from '@angular/core';
import { DialogService } from '@getbeyond/ng-beyond-js';
import { empty, of } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { DEFAULT_INFO_TIMEOUT, DEFAULT_LOCATION_ID, MESSAGE_TYPE_ERROR, MESSAGE_TYPE_INFO } from '../../../app.const';
import { User } from '../../../shared/models/user/user.model';
import { Task } from '../../../shared/models/task/task.model';
import { InitService } from '../../../core/services/init/init.service';
import { TasksService } from '../../../shared/services/tasks/tasks.service';
import { UsersService } from '../../../shared/services/users/users.service';

@Component({
  selector: 'app-todo-edit',
  templateUrl: './todo-edit.component.html',
  styleUrls: ['./todo-edit.component.scss']
})
export class TodoEditComponent implements OnInit {

  @ViewChild('taskForm') taskForm: NgForm;

  accountUsers: Array<User>;
  blockers: {[k: string]: boolean};
  currentDate: Date;
  editedTask: Task;
  info: {[k: string]: string};
  title = '';

  private cdr: ChangeDetectorRef;
  private dialog: DialogService;
  private errorHandler: ErrorHandler;
  private initService: InitService;
  private route: ActivatedRoute;
  private router: Router;
  private tasksService: TasksService;
  private usersService: UsersService;

  constructor(
    cdr: ChangeDetectorRef, dialog: DialogService, errorHandler: ErrorHandler, initService: InitService,
      route: ActivatedRoute, router: Router, tasksService: TasksService, usersService: UsersService
  ) {

    this.cdr = cdr;
    this.dialog = dialog;
    this.errorHandler = errorHandler;
    this.initService = initService;
    this.route = route;
    this.router = router;
    this.tasksService = tasksService;
    this.usersService = usersService;

    this.accountUsers = [];
    this.blockers = {
      api_processing: false,
      initializing: true
    };
    this.currentDate = moment().toDate();
    this.editedTask = null;
    this.info = {
      message: null,
      type: MESSAGE_TYPE_INFO
    };
  }

  ngOnInit(): void {

    let taskId = 'new';

    this.route.params
      .pipe(
        mergeMap((response) => {
          taskId = _.get(response, 'taskId', taskId);
          return this.usersService.load(null, {fields: 'id,first_name,last_name', sort: 'first_name,last_name'});
        }),
        mergeMap((accountUsers: Array<User>) => {

          this.accountUsers = accountUsers;

          if (taskId !== 'new') {

            this.title = 'Edit Task';
            return this.tasksService.load(parseInt(taskId, 10));

          } else {

            this.title = 'Add Task';
            return of(
              Task.fromRaw({
                assigned_user_id: null,
                due_date: null,
                description: '',
                is_complete: false,
                location_id: DEFAULT_LOCATION_ID
              })
            );

          }

        }),
        catchError((error: any) => {
          this.handleError(error);
          return empty();
        })
      )
      .subscribe((task: Task) => {
        this.editedTask = task;
        this.blockers.initializing = false;
        this.cdr.detectChanges(); // have to force manually so the save button status updates
        return;
      });

  }

  actionClose(): void {
    this.router.navigate(['todo']);
  }

  actionConfirmDeleteTask(): void {

    const dialog = this.dialog.openWithData({
      title: 'Confirm delete',
      text: `Are you sure you want to delete this task?`,
      ok_label: 'Confirm delete'
    });

    dialog.afterClosed()
      .subscribe((save: boolean) => {
        if (save) {
          this.deleteTask();
        }
      });

  }

  actionConfirmSaveTask(): void {

    const dialog =  this.dialog.openWithData({
      title: 'Confirm save',
      text: `Are you sure you want to ${ this.editedTask.id ? 'update this' : 'create a new' } task?`,
      ok_label: 'Save'
    });

    dialog.afterClosed()
      .subscribe((save: boolean) => {
        if (save) {
          this.saveTask();
        }
      });

  }

  disableSaveButton(): boolean {

    return this.blockers.api_processing ||
      !Task.isValid(this.editedTask) ||
      !this.taskForm ||
      !this.taskForm.valid;

  }

  private deleteTask(): void {

    this.blockers.api_processing = true;

    this.tasksService.delete(this.editedTask)
      .pipe(
        catchError((error: any) => {
          this.handleError(error);
          return empty();
        }),
        finalize(() => {
          this.blockers.api_processing = false;
        })
      )
      .subscribe(() => {
        this.actionClose();
        return;
      });

  }

  private handleError(error: any = null, autoHide: boolean = false): void {

    let message = 'There was an error, please check console log for more details.'; // default message

    if (_.isString(error)) {
      message = `There was an error: ${error}`;
    } else if (_.isObject(error) && _.has(error, 'message')) {
      message = error.message;
    }

    this.errorHandler.handleError(error);
    this.showInfo({
      message: message,
      type: MESSAGE_TYPE_ERROR
    });

    if (autoHide) {

      setTimeout(
        () => {
          this.showInfo(); // will hide message when called with no params
          return;
        },
        DEFAULT_INFO_TIMEOUT
      );

    }

  }

  private saveTask(): void {

    this.blockers.api_processing = true;

    this.tasksService.save(this.editedTask)
      .pipe(
        catchError((error: any) => {
          this.handleError(error);
          return empty();
        }),
        finalize(() => {
          this.blockers.api_processing = false;
        })
      )
      .subscribe(() => {
        this.actionClose();
        return;
      });

  }

  private showInfo(info: {[k: string]: string} = {message: null, type: MESSAGE_TYPE_INFO}): void {
    this.info = info;
    return;
  }

}
