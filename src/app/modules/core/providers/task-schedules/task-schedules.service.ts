import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeachService } from 'ng-peach';

const API_KEY = 'task_schedules';

@Injectable()
export class TaskSchedulesService {

  private peachService: PeachService;
  private resource: any;

  constructor(peachService: PeachService) {
    this.peachService = peachService;
    this.resource = this.peachService.api.resource(API_KEY);
  }

  public load(findParams: object | number = null, otherParams: object = null): Observable<any> {
    return this.resource.find(findParams, otherParams);
  }

  public save(data: any = {}): Observable<any> {
    return this.resource.save(data);
  }

}
