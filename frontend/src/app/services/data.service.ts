import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { CommonService } from "../common/common.service";
import { AlertService } from "../common/alert.service";
import { Observable } from "rxjs/index";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";
import "rxjs/add/observable/throw";
import "rxjs/add/observable/fromPromise";
import "rxjs/add/operator/do";
import "rxjs/add/operator/retry";
import { ErrorObservable } from "rxjs-compat/observable/ErrorObservable";
import * as _ from "lodash";
import { Pagination } from "../../dto/pagination";
import { ShowMessageDto } from "../../dto/show-message-dto";
import { SETTINGS } from "../../setting/commons.settings";
import { finalize } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private commons: CommonService,
    private alertService: AlertService,
  ) {}

  public get(conf: any, data?: Object): Observable<Object> {
    return this.request(
      conf.url,
      { method: "GET" },
      data,
      conf.headerParam,
    ).map((response) => {
      return this.responseHandler(
        response,
        conf.headerParam.showMessage,
        conf.headerParam.showLoading,
      );
    });
  }

  public postWithPageData(
    conf: any,
    searchData?: Object,
    pagination?: Pagination,
  ): Observable<Object> {
    if (_.isEmpty(pagination)) {
      pagination = new Pagination();
    }

    if (_.isEmpty(searchData)) {
      searchData = {};
    }

    for (let key in searchData) {
      if (searchData.hasOwnProperty(key)) {
        if (!_.isNumber(searchData[key])) {
          _.isEmpty(searchData[key]) ? (searchData[key] = null) : "";
        }
      }
    }

    const data = Object.assign({}, searchData, pagination.getPageData());

    return this.post(conf, data);
  }

  public post(conf: any, data?: Object): Observable<Object> {
    return this.request(
      conf.url,
      { method: "POST" },
      data,
      conf.headerParam,
    ).map((response) => {
      return this.responseHandler(
        response,
        conf.headerParam.showMessage,
        conf.headerParam.showLoading,
      );
    });
  }

  public delete(conf: any, data?: Object): Observable<Object> {
    return this.request(
      conf.url,
      { method: "DELETE" },
      data,
      conf.headerParam,
    ).map((response) => {
      return this.responseHandler(
        response,
        conf.headerParam.showMessage,
        conf.headerParam.showLoading,
      );
    });
  }

  public put(conf: any, data?: Object): Observable<Object> {
    if (conf.headerParam) {
      conf.headerParam.isFileUpload = true;
    }
    return this.request(
      conf.url,
      { method: "PUT" },
      data,
      conf.headerParam,
    ).map((response) => {
      return this.responseHandler(
        response,
        conf.headerParam.showMessage,
        conf.headerParam.showLoading,
      );
    });
  }

  private responseHandler(
    response: any,
    showMessage: ShowMessageDto,
    showLoading: any,
  ): any {
    if (showLoading === false) {
    } else {
      this.commons.hideLoading();
    }

    if (response.status == "FAILED" || response.status == "PARTIAL_SUCCESS") {
      this.commons.resetLoading();
      this.showErrorMessage(response);
      this.commons.onApiError();
      throw response;
    } else {
      if (showMessage) {
        if (showMessage.showOnSuccessSearchWithResult) {
          this.alertService.showToaster(
            showMessage.successSearchResultMessage,
            SETTINGS.TOASTER_MESSAGES.success,
          );
        }

        if (showMessage.showOnSuccessSearchEmptyResult) {
          if (
            response.result.pageData &&
            response.result.pageData.length == 0
          ) {
            this.alertService.showToaster(
              showMessage.successSearchEmptyResultMessage,
              SETTINGS.TOASTER_MESSAGES.warning,
              { timeOut: 5000 },
            );
          }
        }

        if (showMessage.showOnRecordSaveUpdate) {
          this.alertService.showToaster(
            showMessage.recordSaveUpdateMessage,
            SETTINGS.TOASTER_MESSAGES.success,
            { timeOut: 5000 },
          );
        }

        if (showMessage.showOnResourceSaveUpdate) {
          this.alertService.showToaster(
            showMessage.resourceSaveUpdateMessage,
            SETTINGS.TOASTER_MESSAGES.success,
            { timeOut: 5000 },
          );
        }
      }
    }
    if (!response.result && !_.isNumber(response.result)) {
      return response;
    }
    return response.result;
  }

  private showErrorMessage(response: any) {
    let finalMessage = [];
    let alertType =
      response.status == "FAILED"
        ? SETTINGS.TOASTER_MESSAGES.error
        : SETTINGS.TOASTER_MESSAGES.warning;

    response.appsErrorMessages.forEach((error) => {
      if (error.errorCode != null) {
        finalMessage.push(error.errorCode);
      } else {
        if (error.errorMessage != null) {
          finalMessage.push(error.errorMessage);
        }
      }
    });

    this.alertService.showToaster(finalMessage.concat().toString(), alertType);
  }

  private request(
    url: string,
    options: any,
    data?: Object,
    headerParams?: any,
  ): Observable<any> {
    options.headers = {};
    let showToaster = false;
    let excludeList = [];

    if (!!headerParams) {
      if (headerParams["showLoading"]) {
        this.commons.showLoading();
      }
      if (headerParams["showToast"] && headerParams["showToast"] === true) {
        showToaster = true;
      }
      const excludeErrorHeader = headerParams["excludeError"];
      if (excludeErrorHeader) {
        excludeList = excludeErrorHeader;
      }
    }

    if (headerParams.isFileUpload) {
      options.body = data;
    } else if (headerParams.isFileDownload) {
      options["responseType"] = "blob";
    } else {
      if (options.method === "POST" || options.method === "DELETE") {
        options.headers["Content-Type"] = "application/json";
      }

      if (data) {
        options.body = JSON.stringify(data);
      }
    }

    options.withCredentials = !headerParams.skipAuth;

    return this.httpClient
      .request(options.method, url, options)
      .catch((error) => {
        this.handleError(error, showToaster, excludeList);
        let message =
          error.error && error.error.message ? error.error.message : "error";
        return ErrorObservable.create(message);
      });
  }

  private handleError(error, showToaster, excludeList): void {
    if (showToaster) {
      if (error.status === 401 && excludeList.indexOf(401) == -1) {
        this.alertService.showToaster(
          error.statusText,
          SETTINGS.TOASTER_MESSAGES.error,
        );
      } else if (error.status === 403 && excludeList.indexOf(403) == -1) {
        // this.alertService.showToaster('Your session is expired', SETTINGS.TOASTER_MESSAGES.warning);
        // this.router.navigate(['/auth/login']);
      } else if (error.status === 500 && excludeList.indexOf(500) == -1) {
        this.alertService.showToaster(
          "Please contact system administrator",
          SETTINGS.TOASTER_MESSAGES.error,
        );
      } else if (
        (error.status === 504 || error.status === 404) &&
        excludeList.indexOf(504) === -1 &&
        excludeList.indexOf(404) === -1
      ) {
        this.alertService.showToaster(
          "Not found",
          SETTINGS.TOASTER_MESSAGES.error,
        );
        // this.router.navigate(['/auth/login']);
      }
    }
    this.commons.resetLoading();
    this.commons.onApiError();
  }

  public postZip(
    conf: any,
    data?: Object,
    p0?: { responseType: string },
  ): Observable<Blob> {
    return this.request(
      conf.url,
      {
        method: "POST",
        responseType: "blob",
      },
      data,
      conf.headerParam,
    ).map((response) => {
      return this.responseHandler(
        response,
        conf.headerParam.showMessage,
        conf.headerParam.showLoading,
      );
    });
  }

  private requestToStorage(
    url: string,
    options: any,
    data?: Object,
    headerParams?: any,
  ): Observable<any> {
    options.headers = {
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`
};
    let showToaster = false;
    let excludeList = [];

    if (!!headerParams) {
      if (headerParams["showLoading"]) {
        this.commons.showLoading();
      }
      if (headerParams["showToast"] && headerParams["showToast"] === true) {
        showToaster = true;
      }
      const excludeErrorHeader = headerParams["excludeError"];
      if (excludeErrorHeader) {
        excludeList = excludeErrorHeader;
      }
    }

    if (headerParams.isFileUpload) {
      options.body = data;
    } else if (headerParams.isFileDownload) {
      options.responseType = "blob";
    } else {
      if (options.method === "POST" || options.method === "DELETE") {
        options.headers["Content-Type"] = "application/json";
      }

      if (data) {
        options.body = JSON.stringify(data);
      }
    }

    options.withCredentials = !headerParams.skipAuth;

    return this.httpClient.request(options.method, url, {
      body: options.body,
      headers: options.headers,
      withCredentials: !headerParams.skipAuth,
      responseType: options.responseType || "json",
      observe: 'response'
    })
    .pipe(
      finalize(() => {
        this.commons.hideLoading();
      })
    );
  }

  public getBlob(conf: any, data?: Object): Observable<any> {
    return this.requestToStorage(
      conf.url,
      {
        method: "GET",
      },
      data,
      {
        ...conf.headerParam,
        isFileDownload: true,
        skipAuth: false,
      },
    );
  }
}
