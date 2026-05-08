import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { EndpointConfig } from "src/app/shared/interfaces/EndpointConfig";
import { CommonService } from "../common/common.service";

@Injectable({
  providedIn: "root",
})
export class MicroDataService {
  private readonly baseUrl: string = "";
  constructor(private http: HttpClient, private commons: CommonService) {}

  get<T>(config: EndpointConfig, params?: HttpParams): Observable<T> {
    if (config.headerParam.showLoading) {
      this.commons.showLoading();
    }
    return this.http
      .get<T>(`${config.url}`, {
        withCredentials: !config.headerParam.skipAuth,
        params,
      })
      .pipe(catchError(this.handleError))
      .pipe(finalize(() => this.commons.hideLoading()));
  }

  post<T>(config: EndpointConfig, data: T | any): Observable<T> {
    if (config.headerParam.showLoading) {
      this.commons.showLoading();
    }
    return this.http
      .post<T>(`${config.url}`, data, {
        withCredentials: !config.headerParam.skipAuth,
      })
      .pipe(catchError(this.handleError))
      .pipe(finalize(() => this.commons.hideLoading()));
  }

  put<T>(config: EndpointConfig, data: T | any): Observable<T> {
    if (config.headerParam.showLoading) {
      this.commons.showLoading();
    }
    return this.http
      .put<T>(`${config.url}`, data, {
        withCredentials: !config.headerParam.skipAuth,
      })
      .pipe(catchError(this.handleError))
      .pipe(finalize(() => this.commons.hideLoading()));
  }

  delete<T>(config: EndpointConfig): Observable<T> {
    if (config.headerParam.showLoading) {
      this.commons.showLoading();
    }
    return this.http
      .delete<T>(`${config.url}`, {
        withCredentials: !config.headerParam.skipAuth,
      })
      .pipe(catchError(this.handleError))
      .pipe(finalize(() => this.commons.hideLoading()));
  }

  private handleError(error: any): Observable<any> {
    return throwError(
      error.message || "An error occured. Please try again later."
    );
  }
}
