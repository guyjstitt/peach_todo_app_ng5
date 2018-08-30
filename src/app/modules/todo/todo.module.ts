import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoComponent } from './todo.component';
import { HomeRoutingModule } from '../home/home-routing.module';
import { TodoRoutingModule } from './todo-routing.module';
import { TodoListComponent } from './todo-list/todo-list.component';
import { TodoEditComponent } from './todo-edit/todo-edit.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { BeyondDialogModule, BeyondCardModule, BeyondPageModule, BeyondModalModule, BeyondSearchModule, BeyondMessageModule, BeyondProgressbarModule, DialogComponent } from '@getbeyond/ng-beyond-js';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BeyondDialogModule, BeyondCardModule, BeyondPageModule, BeyondModalModule,
    BeyondSearchModule, BeyondMessageModule, BeyondProgressbarModule,
    TodoRoutingModule
  ],
  declarations: [
    TodoComponent,
    TodoListComponent,
    TodoEditComponent
  ],
  entryComponents: [
    DialogComponent
  ]
})
export class TodoModule { }
