
import { CanActivate } from '@angular/router';
import { catchError, mergeMap } from 'rxjs/operators'; 
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { APP_PERMISSION_TODO_ADMIN_API_KEY } from '../../../../app.const';
import { InitService } from '../init/init.service';

@Injectable()
export class AdminPermissionRouteGuardService implements CanActivate {

  private initService: InitService;

  constructor(initService: InitService) {
    this.initService = initService;
  }

  canActivate(): Observable<boolean> {

    return this.initService.getPermissions()
      .pipe(
        catchError(() => {
          return of(false);
        }),
        mergeMap((permissions) => {
          return of(permissions[APP_PERMISSION_TODO_ADMIN_API_KEY]);
        })
      );

  }

}
