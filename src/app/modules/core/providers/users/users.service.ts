import { BeyondService } from '@getbeyond/ng-beyond-js';
import { Injectable } from '@angular/core';

import { BaseDataService } from '../../classes/base-data-service';
import { User } from '../../models/user/user.model';

@Injectable()
export class UsersService extends BaseDataService {

  constructor(beyondService: BeyondService) {
    super(beyondService, User);
  }

}
