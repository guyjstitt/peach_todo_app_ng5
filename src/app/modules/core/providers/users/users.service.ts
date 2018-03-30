import { BaseDataService } from '../../classes/base-data-service';
import { Injectable } from '@angular/core';
import { PeachService } from 'ng-peach';
import { User } from '../../models/user/user.model';

@Injectable()
export class UsersService extends BaseDataService {

  constructor(peachService: PeachService) {
    super(peachService, User);
  }

}
