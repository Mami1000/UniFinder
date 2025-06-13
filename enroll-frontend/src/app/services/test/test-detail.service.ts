import { Injectable } from "@angular/core";
import { Test, TestService } from "./test.service";
import { HonorBoardService } from "../../services/honor-board/honor.board.service";
import { forkJoin, map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class TestDetailService {
  constructor(
    private testService: TestService,
    private honorBoardService: HonorBoardService
  ) {}

  getTestWithHonorBoard(id: string): Observable<{ test: Test, honorBoard: any[] }> {
    return forkJoin({
      test: this.testService.getTestById(id),
      honorBoard: this.honorBoardService.getHonorBoard(id)
    });
  }

  getAccessKey(testId: string, userId: string): Observable<string> {
    return this.testService.getCodeForTest(testId, userId).pipe(
      map(res => res.key)
    );
  }
}
