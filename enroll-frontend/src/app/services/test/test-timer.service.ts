import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TestTimerService {
  startCountdown(seconds: number): Observable<number> {
    return interval(1000).pipe(
      map((i) => seconds - i - 1),
      takeWhile((val) => val >= 0)
    );
  }
}
