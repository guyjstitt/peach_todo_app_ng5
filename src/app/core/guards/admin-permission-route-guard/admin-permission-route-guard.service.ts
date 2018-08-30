
import { CanActivate } from '@angular/router';
import { catchError, mergeMap } from 'rxjs/operators'; 
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InitService } from '../../services/init/init.service';
import { APP_PERMISSION_TODO_ADMIN_API_KEY } from '../../../app.const';


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
