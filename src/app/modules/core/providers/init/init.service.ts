import * as _ from 'lodash';
import { BeyondService } from '@getbeyond/ng-beyond-js';
import { Injectable } from '@angular/core';
import { mergeMap, shareReplay } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

import { AccountPrefsService } from '../account-prefs/account-prefs.service';
import {
  ACCT_PREF_KEY_FOR_OVERDUE_TASKS_TASK_SCHEDULE, APP_ID, APP_PERMISSIONS, OVERDUE_TASKS_TASK_ID,
  OVERDUE_TASKS_TASK_SCHEDULE 
} from '../../../../app.const';
import { TaskSchedulesService } from '../task-schedules/task-schedules.service';

@Injectable()
export class InitService {

  private accountPrefsService: AccountPrefsService;
  private beyondService: BeyondService;
  private taskSchedulesService: TaskSchedulesService;

  private accountInfo: object;
  private initialized: Observable<boolean>;
  private permissions: object;
  private userInfo: object;

  constructor(
    accountPrefsService: AccountPrefsService, beyondService: BeyondService, taskSchedulesService: TaskSchedulesService
  ) {

    this.accountPrefsService = accountPrefsService;
    this.beyondService = beyondService;
    this.taskSchedulesService = taskSchedulesService;
    this.beyondService.afterBeyondAppReady(); // important to call this on app bootstrap

    this.accountInfo = {};
    this.permissions = _.zipObject(
      APP_PERMISSIONS,
      _.map(
        APP_PERMISSIONS,
        () => {
          return false;
        }
      )
    );
    this.userInfo = {};

    this.initialized = this.activate();

  }

  getAccountInfo(): Observable<object> {

    return this.isReady()
      .pipe(
        mergeMap(() => {
          return of(_.cloneDeep(this.accountInfo));
        })
      );

  }

  getPermissions(): Observable<object> {

    return this.isReady()
      .pipe(
        mergeMap(() => {
          return of(_.cloneDeep(this.permissions));
        })
      );

  }

  getUserInfo(): Observable<object> {

    return this.isReady()
      .pipe(
        mergeMap(() => {
          return of(_.cloneDeep(this.userInfo));
        })
      );

  }

  isReady(): Observable<boolean> {
    return this.initialized;
  }

  private activate(): Observable<boolean> {

    const initialData: Array<Observable<any>> = [
      this.beyondService.account.getInfo(),
      this.beyondService.user.getInfo()
    ];
    const permissionsPromisesMap: Array<string> = [];
    let userIsAdmin: boolean = false;
    let permissionsData: Array<Observable<any>> = [];

    return forkJoin(initialData)
      .pipe(
        mergeMap((response: any) => {

          this.accountInfo = _.get(response, 0, {});
          this.userInfo = _.get(response, 1, {});

          userIsAdmin = _.get(this.accountInfo, 'is_admin', false);
          permissionsData = _.map(
            this.permissions,
            (permission: boolean, key: string) => {
              permissionsPromisesMap.push(key);
              return this.beyondService.app.hasPermission(key);
            }
          );

          return forkJoin(permissionsData);

        }),
        mergeMap((response: any) => {

          this.permissions['is_admin'] = userIsAdmin;

          _.each(
            permissionsPromisesMap,
            (permission: string, index: number) => {
              this.permissions[permission] = _.get(response, index, false);
            }
          );

          if (userIsAdmin) {
            return this.beyondService.account.getPrefs(ACCT_PREF_KEY_FOR_OVERDUE_TASKS_TASK_SCHEDULE);
          }

          return of(false);

        }),
        mergeMap((response: any) => {

          if (
            response !== false &&
            _.get(response, 'value', 'false') === 'false'
          ) {

            return this.taskSchedulesService.load({task_id: OVERDUE_TASKS_TASK_ID})
              .pipe(
                mergeMap((response) => {

                  if (response.count === 0) {
                    return this.taskSchedulesService.save(OVERDUE_TASKS_TASK_SCHEDULE);
                  }

                  return of(true);

                }),
                mergeMap(() => {

                  return this.accountPrefsService.save({
                    app_id: APP_ID,
                    key: ACCT_PREF_KEY_FOR_OVERDUE_TASKS_TASK_SCHEDULE,
                    value: true
                  });

                })
              );

          } else {

            return of(true);

          }

        }),
        shareReplay()
      );

  }

}
