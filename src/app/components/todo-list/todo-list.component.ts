import * as _ from 'lodash';
import { catchError, finalize, debounceTime, mergeMap } from 'rxjs/operators';
import { Component, ErrorHandler, OnInit, ViewChild } from '@angular/core';
import { empty, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { SearchComponent } from '@getbeyond/ng-beyond-js';

import { APP_PERMISSION_TODO_ADMIN_API_KEY, DEFAULT_INFO_TIMEOUT, MESSAGE_TYPE_ERROR, MESSAGE_TYPE_INFO } from '../../app.const';
import { InitService } from '../../modules/core/providers/init/init.service';
import { TasksService } from '../../modules/core/providers/tasks/tasks.service';
import { Task } from '../../modules/core/models/task/task.model';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  @ViewChild('search') search: SearchComponent;

  blockers: {[k: string]: boolean|number};
  info: {[k: string]: string};
  permissions: {[k: string]: boolean} | {};
  tasksEditingAllowed: boolean;
  tasks: Array<Task>;
  visibleTasks: Array<Task>;
  userInfo: object;
  percentComplete = 0;

  private errorHandler: ErrorHandler;
  private initService: InitService;
  private router: Router;
  private tasksService: TasksService;

  constructor(errorHandler: ErrorHandler, initService: InitService, router: Router, tasksService: TasksService) {

    this.errorHandler = errorHandler;
    this.initService = initService;
    this.router = router;
    this.tasksService = tasksService;

    this.blockers = {
      api_processing: false,
      initializing: true,
      task: false
    };
    this.info = {
      message: null,
      type: MESSAGE_TYPE_INFO
    };
    this.permissions = {};
    this.tasksEditingAllowed = false;
    this.tasks = [];
    this.userInfo = {};

  }

  ngOnInit(): void {

    forkJoin([
      this.initService.getPermissions(),
      this.initService.getUserInfo()
    ])
      .pipe(
        mergeMap((response) => {

          this.permissions = _.get(response, 0, {});
          this.userInfo = _.get(response, 1, {});
          this.tasksEditingAllowed = Boolean(this.permissions[APP_PERMISSION_TODO_ADMIN_API_KEY]);

          const filters: object = !this.tasksEditingAllowed ?
            {assigned_user_id: _.get(this.userInfo, 'id', 0)} :
            null;

          return this.tasksService.load(filters, {includes: 'users(id,first_name,last_name)'});

        }),
        catchError((error: any) => {
          this.handleError(error);
          return empty();
        })
      )
      .subscribe((tasks: Array<Task>) => {
        this.tasks = tasks;
        this.updateVisibleTasks('');
        this.updatePercentComplete();
        this.blockers.initializing = false;
        return;
      });
  
    this.search.queryChange.pipe(debounceTime(500)).subscribe(t => this.updateVisibleTasks(t));

  }

  actionOpenTaskModal(taskId: string | number = 'new'): void {

    if (this.tasksEditingAllowed) {
      this.router.navigate(['todo', taskId]);
    }

  }

  onTaskStatusChange(task: Task = null): void {

    if (
      !this.blockers.initializing &&
      this.blockers.task !== task.id
    ) {

      task.toggleStatus();
      this.blockers.task = task.id;

      this.tasksService.save(task)
        .pipe(
          catchError((error) => {
            this.handleError(error, true);
            return empty();
          }),
          finalize(() => {
            this.updatePercentComplete();
            this.blockers.task = false;
          })
        )
        .subscribe();

    }

  }

  private getTasksCompleteCount(): number {

    let completeCount = 0;

    _.forEach(this.tasks, (t) => { if (t.isComplete) { completeCount++; } });

    return completeCount;

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

  private showInfo(info: {[k: string]: string} = {message: null, type: MESSAGE_TYPE_INFO}): void {

    this.info = info;
    return;

  }

  private updatePercentComplete(): void {

    if (this.tasks.length) {
      this.percentComplete = Math.round((this.getTasksCompleteCount() / this.tasks.length) * 100);
    }

  }

  private updateVisibleTasks(query) {

    if (query) {
      this.visibleTasks = _.filter(this.tasks, t => t.description.indexOf(query) !== -1);
    } else {
      this.visibleTasks = this.tasks;
    }

  }

}
