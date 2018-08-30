import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { 
    path: '',
    loadChildren: 'app/modules/home/home.module#HomeModule' },
  {
    path: 'home',
    loadChildren: 'app/modules/home/home.module#HomeModule'
  },
  {
    path: 'todo',
    loadChildren: 'app/modules/todo/todo.module#TodoModule'
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: true}) // important to use hash if the app has to work correctly on Peach platform!!!
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
