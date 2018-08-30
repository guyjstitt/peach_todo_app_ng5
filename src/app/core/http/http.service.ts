import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";

@Injectable()
export class HttpService {
  private requestPendingSubject: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  get requestPending$(): Observable<boolean> {
    return this.requestPendingSubject.asObservable();
  }

  publishRequestPending(isRequestPending) {
    this.requestPendingSubject.next(isRequestPending);
  }
} 