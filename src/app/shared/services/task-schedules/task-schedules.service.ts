import { BeyondService } from '@getbeyond/ng-beyond-js';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const API_KEY = 'task_schedules';

@Injectable()
export class TaskSchedulesService {

  private beyondService: BeyondService;
  private resource: any;

  constructor(beyondService: BeyondService) {
    this.beyondService = beyondService;
    this.resource = this.beyondService.api.resource(API_KEY);
  }

  load(findParams: object | number = null, otherParams: object = null): Observable<any> {
    return this.resource.find(findParams, otherParams);
  }

  save(data: any = {}): Observable<any> {
    return this.resource.save(data);
  }

}
