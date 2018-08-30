import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountPrefsService } from './services/account-prefs/account-prefs.service';
import { TaskSchedulesService } from './services/task-schedules/task-schedules.service';
import { TasksService } from './services/tasks/tasks.service';
import { UsersService } from './services/users/users.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AccountPrefsService,
    TaskSchedulesService,
    TasksService,
    UsersService
  ]
})
export class SharedModule { }
