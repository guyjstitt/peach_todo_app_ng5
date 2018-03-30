import { APP_PERMISSION_TODO_ADMIN_API_KEY, DEFAULT_INFO_TIMEOUT, MESSAGE_TYPE_ERROR, MESSAGE_TYPE_INFO } from '../../app.const';
import { Component, ErrorHandler, OnInit } from '@angular/core';
import { InitService } from '../../modules/core/providers/init/init.service';
import { Observable } from 'rxjs';
import { Router } from "@angular/router";
import { TasksService } from '../../modules/core/providers/tasks/tasks.service';
import { Task } from '../../modules/core/models/task/task.model';
import * as _ from 'lodash';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/mergeMap';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {

  private errorHandler: ErrorHandler;
  private initService: InitService;
  private router: Router;
  private tasksService: TasksService;
  
  public blockers: {[k: string]: boolean};
  public info: {[k: string]: string};
  public permissions: {[k: string]: boolean} | {};
  public tasksEditingAllowed: boolean;
  public tasks: Array<Task>;
  public userInfo: object;

  constructor(errorHandler: ErrorHandler, initService: InitService, router: Router, tasksService: TasksService) {

    this.errorHandler = errorHandler;
    this.initService = initService;
    this.router = router;
    this.tasksService = tasksService;

    this.blockers = {
      api_processing: false,
      initializing: true
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

  public ngOnInit(): void {

    Observable.forkJoin([
      this.initService.getPermissions(),
      this.initService.getUserInfo()
    ])
      .mergeMap((response) => {

        this.permissions = _.get(response, 0, {});
        this.userInfo = _.get(response, 1, {});
        this.tasksEditingAllowed = Boolean(this.permissions[APP_PERMISSION_TODO_ADMIN_API_KEY]);
        
        let filters: object = !this.permissions[APP_PERMISSION_TODO_ADMIN_API_KEY] ?
          {assigned_user_id: _.get(this.userInfo, 'id', 0)} :
          null;

        return this.tasksService.load(filters, {includes: 'users(id,first_name,last_name)'});

      })
      .catch((error: any) => {
        this.handleError(error);
        return Observable.empty();
      })
      .subscribe((tasks: Array<Task>) => {
        this.tasks = tasks;
        this.blockers.initializing = false;
        return;
      })

  }

  public actionOpenTaskModal(taskId: string | number = 'new'): void {

    if (this.tasksEditingAllowed) {
      this.router.navigate(['todo', taskId]);
    }

  }

  public onTaskStatusChange(task: Task = null): void {

    if (
      !this.blockers.initializing &&
      !this.blockers.api_processing
    ) {
    
      task.toggleStatus();
      this.blockers.api_processing = true;

      this.tasksService.save(task)
        .catch((error) => {
          this.handleError(error, true);
          return Observable.empty();
        })
        .finally(()=> {
          this.blockers.api_processing = false;
        })
        .subscribe();

    }

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

}
