import { CommonModule } from '@angular/common';
import { NgBeyondModule } from '@getbeyond/ng-beyond-js';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { AdminPermissionRouteGuardService } from './guards/admin-permission-route-guard/admin-permission-route-guard.service';
import { InitService } from './services/init/init.service';
import { HttpService } from './http/http.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptor } from './interceptors/http.interceptor';


@NgModule({
  imports: [
    CommonModule,
    NgBeyondModule.forRoot()
  ],
  providers: [
    AdminPermissionRouteGuardService,
    InitService,
    HttpService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true
    }
  ],
  exports: [NgBeyondModule]
})
export class CoreModule {

  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }

}
