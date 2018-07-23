import 'lodash';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { NgModule } from '@angular/core';
import {
  BeyondMessageModule,
  DialogComponent,
  BeyondDialogModule,
  BeyondCardModule,
  BeyondPageModule,
  BeyondModalModule,
  BeyondSearchModule,
  BeyondProgressbarModule
} from '@getbeyond/ng-beyond-js';

import { AppRoutingModule } from './modules/app-routing/app-routing.module';
import { CoreModule } from './modules/core/core.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoEditComponent } from './components/todo-edit/todo-edit.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TodoListComponent,
    TodoEditComponent
  ],
  entryComponents: [
    DialogComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    FlexLayoutModule,
    FormsModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BeyondDialogModule, BeyondCardModule, BeyondPageModule, BeyondModalModule,
    BeyondSearchModule, BeyondMessageModule, BeyondProgressbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
