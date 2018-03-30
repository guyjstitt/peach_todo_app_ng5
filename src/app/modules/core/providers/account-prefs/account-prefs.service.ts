import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PeachService } from 'ng-peach';

const API_KEY = 'account_prefs';

@Injectable()
export class AccountPrefsService {

  private peachService: PeachService;
  private resource: any;

  constructor(peachService: PeachService) {
    this.peachService = peachService;
    this.resource = this.peachService.api.resource(API_KEY, {useCoreToken: true});
  }

  public save(data: any = {}): Observable<any> {
    return this.resource.save(data);
  }

}
