import * as _ from 'lodash';
import { _throw } from 'rxjs/observable/throw';
import { BeyondService } from '@getbeyond/ng-beyond-js';
import { mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { Task } from '../models/task/task.model';
import { User } from '../models/user/user.model';

export class BaseDataService {

  private modelClass: typeof Task | typeof User;
  private beyondService: BeyondService;
  private resource: any;

  constructor(beyondService: BeyondService, modelClass: typeof Task | typeof User ) {

    this.modelClass = modelClass;
    this.beyondService = beyondService;
    this.resource = this.beyondService.api.resource(this.modelClass.getApiKey());

  }

  delete(findParams: object | number | Task = null): Observable<any> {

    if (findParams instanceof Task) {
      findParams = findParams.id;
    }

    return this.resource.remove(findParams);

  }

  load(findParams: object | number = null, otherParams: object = null): Observable<any> {

    return this.resource.find(findParams, otherParams)
      .pipe(
        mergeMap((response) => {
          return of(this.modelClass.fromRaw(
            _.has(response, 'id') ?
              response :
              _.get(response, 'results', [])
          ));
        })
      );

  }

  save(modelInstance: Task = null): Observable<any> {

    if (!this.modelClass.isValid(modelInstance)) {
      return _throw({
        message: `Could not save - invalid ${this.modelClass.name} object given.`,
        object: modelInstance
      });
    }

    return this.resource.save(modelInstance.forDB());

  }

}
