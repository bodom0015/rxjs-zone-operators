import { Operator, Subscriber, Observable } from 'rxjs';

export function leaveZone<T>(zone: { runOutsideAngular: (fn: any) => any }): Observable<T> {
  return this.lift(new LeaveZoneOperator(zone));
}

export interface LeaveZoneSignature<T> {
  (zone: { runOutsideAngular: (fn: any) => any }): Observable<T>;
}

export class LeaveZoneOperator<T> implements Operator<T, T> {
  constructor(private _zone: { runOutsideAngular: (fn: any) => any }) { }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new LeaveZoneSubscriber(subscriber, this._zone));
  }
}

class LeaveZoneSubscriber<T> extends Subscriber<T> {
  constructor(destination: Subscriber<T>, private _zone: { runOutsideAngular: (fn: any) => any }) {
    super(destination);
  }

  protected _next(value: T) {
    this._zone.runOutsideAngular(() => this.destination.next(value));
  }
}

Observable.prototype.leaveZone = leaveZone;

declare module 'rxjs' {
  interface Observable<T> {
    leaveZone: LeaveZoneSignature<T>;
  }
}
