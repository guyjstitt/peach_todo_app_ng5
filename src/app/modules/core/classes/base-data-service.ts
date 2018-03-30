import { Observable } from 'rxjs';
import { PeachService } from 'ng-peach';
import { Task } from '../models/task/task.model';
import { User } from '../models/user/user.model';
import * as _ from 'lodash';

export class BaseDataService {

  private modelClass: typeof Task | typeof User;
  private peachService: PeachService;
  private resource: any;

  constructor(peachService: PeachService, modelClass: typeof Task | typeof User ) {

    this.modelClass = modelClass;
    this.peachService = peachService;
    this.resource = this.peachService.api.resource(this.modelClass.getApiKey());

  }

  public delete(findParams: object | number | Task = null): Observable<any> {

    if (findParams instanceof Task) {
      findParams = findParams.id;
    }

    return this.resource.remove(findParams);

  }

  public load(findParams: object | number = null, otherParams: object = null): Observable<any> {

    return this.resource.find(findParams, otherParams)
      .mergeMap((response) => {
        return Observable.of(this.modelClass.fromRaw(
          _.has(response, 'id') ?
            response :
            _.get(response, 'results', [])
        ));
      });

  }

  public save(modelInstance: Task = null): Observable<any> {

    if (!this.modelClass.isValid(modelInstance)) {
      return Observable.throw({
        message: `Could not save - invalid ${this.modelClass.name} object given.`,
        object: modelInstance
      });
    }

    return this.resource.save(modelInstance.forDB());

  }

}
