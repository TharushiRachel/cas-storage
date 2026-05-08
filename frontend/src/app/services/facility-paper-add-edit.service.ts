import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { DataService } from "../../../../core/service/data/data.service";
import { SearchDataCacheService } from "../../../../core/service/common/search-data-cache.service";
import { Pagination } from "../../../../core/dto/pagination";
import { SETTINGS } from "../../../../core/setting/commons.settings";
import { UrlEncodeService } from "../../../../core/service/application/url-encode.service";
import { LocalStorage, SessionStorage } from "ngx-webstorage";
import { CacheService } from "../../../../core/service/data/cache.service";
import { Constants } from "../../../../core/setting/constants";
import { ApplicationService } from "../../../../core/service/application/application.service";
import * as _ from "lodash";
import { PrivilegeService } from "../../../../core/service/authentication/privilege.service";
import { CribDetailsSaveDTO } from "../../../../shared/dto/CribDetailsSaveDTO";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as moment from "moment";
import { AlertService } from "src/app/core/service/common/alert.service";
import { map, distinctUntilChanged, tap } from "rxjs/operators";
import { STORAGE_SETTINGS } from "./storage-endpoints";
import { FPDocumentDTO, StandardResponse } from "../dto/fp-doc-model-dto";
import { Config } from "src/app/core/setting/config";

@Injectable()
export class FacilityPaperAddEditService implements Resolve<any> {
  @LocalStorage(SETTINGS.STORAGE.SELECTED_FACILITY_PAPER_ID)
  selectedFacilityPaperID;

  // @SessionStorage(SETTINGS.STORAGE.SELECTED_FACILITY_PAPER_ID)
  // selectedFPID;
  @LocalStorage(SETTINGS.STORAGE.SELECTED_FINACLE_ID)
  selectedFinacleID;

  @SessionStorage(SETTINGS.STORAGE.SELECTED_CUSTOMER_ID)
  selectedCIFID;

  userDa: any = {};
  facilityPaperDTO: any = {};
  CustomerFacilityDetailList = [];
  directorDTO: any = {};
  customerDTO: any = {};
  uploadDocument: any = {};
  customerCribDetails: any = {};
  customerDTOList = [];
  onCustomerListChange = new BehaviorSubject({});
  onFacilityPaperChange = new BehaviorSubject({});
  onFPFacilitiesChange = new BehaviorSubject({});
  onFPCompanyROAChange = new BehaviorSubject({});
  onCommitteePaperStatusChange = new BehaviorSubject({});
  onFPCompanyDirectorsChange = new BehaviorSubject({});
  onShareHolderDetailsChange = new BehaviorSubject({});
  onFacilityPaperBaseDataChange = new BehaviorSubject({});
  onFacilityDetailChange = new BehaviorSubject({});
  onSelectedCustomerChange = new BehaviorSubject({});
  onFPUploadDocumentChange = new BehaviorSubject({});
  onFPCreditRiskDocument = new BehaviorSubject({});
  onFPFacilityChange = new BehaviorSubject({});
  onFPFacilityLastRentalDataChange = new Subject();
  onBaseFacilityPaperChange = new BehaviorSubject({});
  onCalculateFacilityPaperExposureChange = new BehaviorSubject({});
  onCalculateFacilityPaperExposureSubj = new Subject();
  onUploadCribDocumentChange = new BehaviorSubject({});
  onCustomerCovenantChange = new BehaviorSubject({});
  // onSaveCribReportChange = new BehaviorSubject({});
  onOtherBankDetailsChange = new BehaviorSubject({});
  onCribStatusChange = new BehaviorSubject({});
  onUpmGroupChange = new BehaviorSubject({});
  onUserDetailFromBrachAuthorityChange = new BehaviorSubject({});
  onFPCommentsChange = new BehaviorSubject({});
  onCreditRiskCommentListChange = new BehaviorSubject({});
  onRefreshFacilityPaperByID = new BehaviorSubject({});
  onSaveOrUpdateFpCreditRiskCommentListChange = new BehaviorSubject({});
  onAddEditCreditRiskReplyChange = new BehaviorSubject({});
  onFpCustomerChange = new BehaviorSubject({});
  onChangeLoggedUserName = new BehaviorSubject({});
  onCustomersChange: BehaviorSubject<any> = new BehaviorSubject({});
  onUpcTemplateListLoad = new BehaviorSubject({});
  onUpcTemplateChange = new BehaviorSubject({});
  onUpcSectionDataChange = new BehaviorSubject({});
  onFpUpcSectionChange = new BehaviorSubject({});
  onFPaperSecSummeryChange = new BehaviorSubject({});
  onCustomerCribDetailsChange = new BehaviorSubject({});
  onBCCPaperChange = new BehaviorSubject({});
  onFPDirectReturnUsersListChange = new BehaviorSubject({});
  onAbleToReturnFacilityPaperToAgentChange = new Subject();
  onReviewerCommentListChange = new BehaviorSubject({});
  onCribReportChange = new BehaviorSubject({});
  onFacilityPaperHistoryChange = new BehaviorSubject({});
  onPagedFacilityPaperHistoryWithUPCTemplateDetails = new Subject();
  onCreditCalculatedFacilitiesESBResponseStatusChange = new BehaviorSubject({});
  onCreditRiskCommentListHistory = new BehaviorSubject({});
  onCustomerCovenant = new BehaviorSubject({});
  onCustomerCovenantSave = new BehaviorSubject({});
  onCustomerEvaluation = new BehaviorSubject({});
  onCustomerEvaluationDelete = new BehaviorSubject({});
  onAccountCovenant = new BehaviorSubject({});
  onDocumentationTabChange = new BehaviorSubject({});
  onCustomerCovenantTabChange = new BehaviorSubject({});
  // onFacilityCovenantTabChange = new BehaviorSubject({});
  onCustomerCovenantAddTabChange = new BehaviorSubject({});
  onFacilityCovenantAddTabChange = new BehaviorSubject({});

  onFacilityCovenantTabChangeSubject = new BehaviorSubject<any>("");
  onFacilityCovenantTabChange: Observable<any> =
    this.onFacilityCovenantTabChangeSubject.asObservable();

  facilityPaperLead: any = {};
  onFacilityPaperLeadChange = new BehaviorSubject({});

  selectedCustomer: any = {};
  customers = [];
  upmGroups: any = [];
  userDetails: any = [];
  remarkList = [];
  activeApprovedUpcTemplates = [];
  selectedUpcTemplate: any = {};
  upcSectionData: any = {};
  onDownloadLinkChageFPSupportDoc: Subject<any> = new Subject();
  onDownloadLinkChageCribDetail: Subject<any> = new Subject();
  onDownloadLinkChage: Subject<any> = new Subject();
  onViewLinkChageFPSupportDoc: Subject<any> = new Subject();

  fpKalyptoData: any = {};
  onFpKalyptoDataChange: any = new Subject();
  masterDataPrivilege = SETTINGS.PRIVILEGES;
  facilityStatusConst = Constants.facilityPaperStatusConst;
  defaultWorkflowUpmGroupCode = Constants.defaultWorkflowUpmGroupCode;
  loanLimitsList: any = new BehaviorSubject<any>(null);
  customerCovenatDTO: any;
  onFacilityFustaceChange = new BehaviorSubject({});
  onUPCFustaceChange = new BehaviorSubject({});
  onYearTypeChange = new BehaviorSubject(Constants.yesNoConst.N);
  onESGRiskScoreChange = new BehaviorSubject([]);
  onESGRiskOpinionChange = new BehaviorSubject([]);
  onAFESGChange = new BehaviorSubject([]);

  onWalletShareChange = new BehaviorSubject([]);
  onFPDocumnetType: BehaviorSubject<any> = new BehaviorSubject({});
  onFPDocumnetCount: BehaviorSubject<any> = new BehaviorSubject({});
  onMDReviewCommentsChange = new BehaviorSubject([]);
  onDeviationCountChange = new BehaviorSubject(0);

  constructor(
    private dataService: DataService,
    private searchDataCacheService: SearchDataCacheService,
    private urlEncodeService: UrlEncodeService,
    private cacheService: CacheService,
    private applicationService: ApplicationService,
    private privilegeService: PrivilegeService,
    private http: HttpClient,
    private router: Router,
    private alertService: AlertService,
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<any> | Promise<any> | any {
    let getAssistantsRQ = {
      functionCode2: this.applicationService.getLoggedInUserUserID(),
      upmGroupCode: this.defaultWorkflowUpmGroupCode.ASSISTANT,
    };

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getFacilityPaperByID(),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_SECURITY_SUMMARY_TOPICS,
        ),
        this.cacheService.loadData(Constants.masterDataKey.CAS_BRANCHES),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_WORKFLOW_TEMPLATES,
        ),
        this.cacheService.loadData(Constants.masterDataKey.CAS_SUPPORTING_DOCs),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_CREDIT_FACILITY_TEMPLATES,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_COMMITTEE_TYPE_LIST,
        ),
        this.cacheService.loadData(Constants.masterDataKey.CAS_COMMITTEE_LIST),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_COMMITTEE_LEVEL_LIST,
        ),
        /*  this.cacheService.loadData(
            Constants.masterDataKey.CAS_COMMITTEE_USER_LIST
          ),*/
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_CREDIT_FACILITY_TYPES,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_CREDIT_FACILITY_INTEREST_RATES,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_PURPOSE_OF_ADVANCED,
        ),
        this.cacheService.loadData(Constants.masterDataKey.CAS_SUB_SECTOR_DATA),
        this.cacheService.loadData(Constants.masterDataKey.CAS_SECTOR_DATA),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_BRANCH_DEPARTMENT_LIST,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_APPLICATION_USER_ASSISTANTS,
          getAssistantsRQ,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_SECURITY_DOCUMENT_SUBMIT_DIV,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_SECURITY_DOCUMENT_SUBMIT_WORK_CLASS,
        ),

        // this.cacheService.loadData(
        //   Constants.masterDataKey.CAS_SECURITY_DOCUMENT_SUBMIT_DIV,
        // ),
        // this.cacheService.loadData(
        //   Constants.masterDataKey.CAS_SECURITY_DOCUMENT_SUBMIT_WORK_CLASS,
        // ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_BCC_ENTERER_WORK_CLASS,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_BCC_AUTHORIZER_WORK_CLASS,
        ),
        this.cacheService.loadData(
          Constants.masterDataKey.CAS_BCC_INQUIRER_WORK_CLASS,
        ),

        // this.cacheService.loadData(

        //   Constants.masterDataKey.CAS_GLOBAL_SUPPORTING_DOCs
        // ),
        this.getActiveApprovedUpcTemplates(),
        this.getAllUpcSectionData(),
        this.getFacilityPaperHistory(),
        this.getCIDList(),
        // this.getCovenantListByFpRefNumber(),
      ]).then(() => {
        resolve();
      }, reject);
    });
  }

  getFacilityPaperByID(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityPaperByID);
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedFacilityPaperID);
      this.dataService.get(data).subscribe((response: any) => {
        this.facilityPaperDTO = response;
        this.onFacilityPaperChange.next(this.facilityPaperDTO);
        this.onFacilityPaperBaseDataChange.next(this.facilityPaperDTO);
        this.onFPCompanyROAChange.next(this.facilityPaperDTO);
        this.onFPCompanyDirectorsChange.next(this.facilityPaperDTO);
        this.onShareHolderDetailsChange.next(this.facilityPaperDTO);
        this.onFPFacilitiesChange.next(this.facilityPaperDTO);
        this.onFPFacilityChange.next(this.facilityPaperDTO);
        this.onUploadCribDocumentChange.next(this.facilityPaperDTO);
        this.onOtherBankDetailsChange.next(this.facilityPaperDTO);
        this.onBaseFacilityPaperChange.next(this.facilityPaperDTO);
        this.onFpCustomerChange.next(this.facilityPaperDTO);
        this.onCreditRiskCommentListChange.next(this.facilityPaperDTO);
        this.onFpUpcSectionChange.next(this.facilityPaperDTO);
        this.onFPaperSecSummeryChange.next(this.facilityPaperDTO);
        this.onReviewerCommentListChange.next(this.facilityPaperDTO);
        this.onFPUploadDocumentChange.next(this.facilityPaperDTO);
        this.onFPCommentsChange.next(this.facilityPaperDTO);
        this.onCreditRiskCommentListHistory.next(this.facilityPaperDTO);
        this.onCustomerCovenant.next(this.facilityPaperDTO);
        this.onFPCreditRiskDocument.next(this.facilityPaperDTO);
        this.onCommitteePaperStatusChange.next(this.facilityPaperDTO);
        this.onDocumentationTabChange.next(this.facilityPaperDTO);
        this.loanLimitsList.next(null);
        this.onYearTypeChange.next(this.facilityPaperDTO.isFinancialYear);
        //this.onCovenantTabChange.next(this.facilityPaperDTO);

        if (response.riskCategories) {
          this.onESGRiskScoreChange.next(response.riskCategories);
        } else {
          this.onESGRiskScoreChange.next([]);
        }
        this.onESGRiskOpinionChange.next([]);

        if (this.facilityPaperDTO.walletShares !== null) {
          this.onWalletShareChange.next(this.facilityPaperDTO.walletShares);
        }

        let securityDocumentVersion = this.facilityPaperDTO
          .securityDocumentVersion
          ? this.facilityPaperDTO.securityDocumentVersion
          : 1;

        this.onFPDocumnetType.next(securityDocumentVersion);

        let counts: any = this.facilityPaperDTO.sdCount
          ? this.facilityPaperDTO.sdCount
          : { draftedCount: 0, submittedCount: 0, returnedCount: 0 };
        this.onFPDocumnetCount.next(counts);

        if (
          this.facilityPaperDTO.mdReviewComments &&
          this.facilityPaperDTO.mdReviewComments.length > 0
        ) {
          this.onMDReviewCommentsChange.next(
            this.facilityPaperDTO.mdReviewComments,
          );
        } else {
          this.onMDReviewCommentsChange.next([]);
        }
        this.onDeviationCountChange.next(this.facilityPaperDTO.deviationCount);
        sessionStorage.setItem("facilityPaperID", response.facilityPaperID);
        sessionStorage.setItem("facilityPaperRefID", response.fpRefNumber);

        if (response.leadRefNumber) {
          Promise.all([this.getLeadByRefNumber(response.leadRefNumber)]).then(
            () => {
              resolve();
            },
            reject,
          );
        } else {
          resolve(response);
        }
      }, reject);
    });
  }

  getLeadByRefNumber(leadRefNumber): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.getLeadByRefNumber);
        data.url = data.url + "/" + leadRefNumber;
        this.dataService.get(data).subscribe((response: any) => {
          this.facilityPaperLead = response;
          this.onFacilityPaperLeadChange.next(this.facilityPaperLead);
        });
      } catch (e) {
      } finally {
        resolve({});
      }
    });
  }

  allowCrib() {
    if (!this.applicationService.isAgent()) {
      return true;
    }

    if (_.isEmpty(this.facilityPaperLead)) {
      return true;
    }

    return this.facilityPaperLead.allowCrib;
  }

  allowFinacleData() {
    if (!this.applicationService.isAgent()) {
      return true;
    }

    if (_.isEmpty(this.facilityPaperLead)) {
      return true;
    }

    return this.facilityPaperLead.allowFinacleData;
  }

  allowKalypto() {
    if (!this.applicationService.isAgent()) {
      return true;
    }

    if (_.isEmpty(this.facilityPaperLead)) {
      return true;
    }

    return this.facilityPaperLead.allowKalypto;
  }

  replicateFacilityPaper(replicateData: any) {
    localStorage.removeItem("facilityPaperRefID");
    this.dataService
      .post(SETTINGS.ENDPOINTS.replicateFacilityPaper, replicateData)
      .subscribe((response: any) => {
        this.facilityPaperDTO = response;
        this.onFacilityPaperChange.next(this.facilityPaperDTO);
        this.onFacilityPaperBaseDataChange.next(this.facilityPaperDTO);
        this.onFPCompanyROAChange.next(this.facilityPaperDTO);
        this.onFPCompanyDirectorsChange.next(this.facilityPaperDTO);
        this.onShareHolderDetailsChange.next(this.facilityPaperDTO);
        this.onFPFacilitiesChange.next(this.facilityPaperDTO);
        this.onFPFacilityChange.next(this.facilityPaperDTO);
        this.onFPaperSecSummeryChange.next(this.facilityPaperDTO);
        this.onBaseFacilityPaperChange.next(this.facilityPaperDTO);
        this.onUploadCribDocumentChange.next(this.facilityPaperDTO);
        this.onOtherBankDetailsChange.next(this.facilityPaperDTO);
        this.onFPFacilitiesChange.next(response);
        this.onFpCustomerChange.next(this.facilityPaperDTO);
        this.onCreditRiskCommentListChange.next(this.facilityPaperDTO);
        this.onFpUpcSectionChange.next(this.facilityPaperDTO);
        this.onReviewerCommentListChange.next(this.facilityPaperDTO);
        this.onFPUploadDocumentChange.next(this.facilityPaperDTO);
        this.onFPCommentsChange.next(this.facilityPaperDTO);
        this.onFacilityPaperHistoryChange.next([]); // When Copy the paper Status history to be disappeared cause history is a separate Request
        this.onCreditRiskCommentListHistory.next(this.facilityPaperDTO);
        this.onFPCreditRiskDocument.next(this.facilityPaperDTO);
        sessionStorage.setItem("facilityPaperRefID", response.fpRefNumber);
        this.onCustomerCovenant.next(response);

        // this.getCovenantListByFpRefNumber();
        // this.getApplicationCovenantListByFpRefNumber()
        this.onSaveOrUpdateFpCreditRiskCommentListChange.next(
          this.facilityPaperDTO,
        );
        this.selectedFacilityPaperID = this.urlEncodeService.encode(
          response.facilityPaperID,
        );

        if (response.riskCategories) {
          this.onESGRiskScoreChange.next(response.riskCategories);
        } else {
          this.onESGRiskScoreChange.next([]);
        }
        this.onESGRiskOpinionChange.next([]);

        this.router.navigate(["/my-facility-papers"]);
      });
  }

  getCustomerByID(customerID): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getCustomerByID);
      data.url = data.url + "/" + customerID;
      this.dataService.get(data).subscribe((response: any) => {
        this.customerDTO = response;
        resolve(response);
      }, reject);
    });
  }

  getCustomerDTOListByIDList(list): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getCustomerDTOListByIDs, list)
        .subscribe((response: any) => {
          this.customerDTOList = response;
          this.onCustomerListChange.next(response);
          resolve(response);
        }, reject);
    });
  }

  saveCasCustomer(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditCasCustomer, data)
      .subscribe((response: any) => {
        this.facilityPaperDTO = response;
        this.onFpCustomerChange.next(this.facilityPaperDTO);
      });
  }

  addEditNonFinacleCasCustomer(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditNonFinacleCasCustomer, data)
      .subscribe((response: any) => {
        this.onFpCustomerChange.next(response);
        this.onUploadCribDocumentChange.next(response);
        this.onOtherBankDetailsChange.next(response);
      });
  }

  removeFPJoningParties(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.removeFPJoningParties, data)
      .subscribe((response: any) => {
        this.onFpCustomerChange.next(response);
        this.onUploadCribDocumentChange.next(response);
        this.onOtherBankDetailsChange.next(response);
      });
  }

  updateCasCustomerDTO(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.updateCasCustomerDTO, data)
      .subscribe((response: any) => {
        this.onFpCustomerChange.next(response);
        this.onUploadCribDocumentChange.next(response);
        this.onOtherBankDetailsChange.next(response);
      });
  }

  saveFpDirectordetails(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditDirectorDetails, data)
      .subscribe((response: any) => {
        this.onFPCompanyDirectorsChange.next(response);
        this.onFacilityPaperBaseDataChange.next(response);
      });
  }

  saveFpCompanyRoa(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditCompanyRao, data)
      .subscribe((response: any) => {
        this.onFPCompanyROAChange.next(response);
      });
  }

  getFacilityDetails(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getFacilityDetailResponses, data)
        .subscribe((response: any) => {
          this.CustomerFacilityDetailList =
            response.facilityDetailResponseDTOList;
          this.onFacilityDetailChange.next(this.CustomerFacilityDetailList);
          resolve(response);
        }, reject);
    });
  }

  searchCustomers(searchData?, paginationData?: Pagination): Promise<any> {
    if (!searchData) {
      searchData = {};
    }

    searchData.status = Constants.statusConst.ACT;

    return new Promise((resolve, reject) => {
      this.dataService
        .postWithPageData(
          SETTINGS.ENDPOINTS.getPagedCustomers,
          searchData,
          paginationData,
        )
        .subscribe((response: any) => {
          this.customers = response.pageData;
          this.onCustomersChange.next(response);
          resolve(response);
        }, reject);
    });
  }

  getPagedCustomersForJoiningParties(
    searchData?,
    paginationData?: Pagination,
  ): Promise<any> {
    if (!searchData) {
      searchData = {};
    }

    searchData.status = Constants.statusConst.ACT;

    return new Promise((resolve, reject) => {
      this.dataService
        .postWithPageData(
          SETTINGS.ENDPOINTS.getPagedCustomersForJoiningParties,
          searchData,
          paginationData,
        )
        .subscribe((response: any) => {
          this.customers = response.pageData;
          this.onCustomersChange.next(response);
          resolve(response);
        }, reject);
    });
  }

  getCustomerById(customerID): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getCustomerByID);
      data.url = data.url + "/" + customerID;
      this.dataService.get(data).subscribe((response: any) => {
        this.selectedCustomer = response.customerName;
        this.onSelectedCustomerChange.next(this.selectedCustomer);
        resolve(this.selectedCustomer);
      }, reject);
    });
  }

  saveOrUpdateFacilityPaper(searchData) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateFacilityPaper, searchData)
      .subscribe((response: any) => {
        this.onFacilityPaperBaseDataChange.next(response);
      });
  }

  saveOrUpdateFPFacility(searchData: any, prevFPData: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateFPFacility, searchData)
      .subscribe((response: any) => {
        var updatedResponse: any = {
          ...response,
          fpUpcSectionDataDTOList: prevFPData.fpUpcSectionDataDTOList,
          casCustomerDTOList: prevFPData.casCustomerDTOList,
          facilityDTOList:
            response && response.facilityDTOList
              ? response.facilityDTOList.map((f: any) => ({
                  ...f,
                  fusTraceList:
                    f.fusTraceList != null
                      ? f.fusTraceList.map((c: any) => ({
                          ...c,
                          addedBy: c.createdUserDisplayName,
                          date: moment(c.createdDate).format(
                            "MMMM Do YYYY, h:mm:ss a",
                          ),
                          childCmnt: [],
                        }))
                      : [],
                }))
              : [],
        };

        this.onFPFacilityChange.next(updatedResponse);
        this.onFPFacilitiesChange.next(updatedResponse);
        this.onFacilityPaperBaseDataChange.next(updatedResponse);
        this.onCalculateFacilityPaperExposureChange.next(updatedResponse);

        let payload: any = {
          exposures: [],
          facilityPaperDTO: updatedResponse,
        };
        this.updateGroupExposure(payload);
        // this.onCalculateFacilityPaperExposureSubj.next(response);
      });
  }

  updateFPFacilityDisplayOrderAndStatus(searchData: any) {
    this.dataService
      .post(
        SETTINGS.ENDPOINTS.updateFPFacilityDisplayOrderAndStatus,
        searchData,
      )
      .subscribe((response: any) => {
        this.onFPFacilityChange.next(response);
        this.onFPFacilitiesChange.next(response);
        this.onFacilityPaperBaseDataChange.next(response);
        this.onCalculateFacilityPaperExposureChange.next(response);
      });
  }

  calculateLastRentalValue(facilityData) {
    // console.log(facilityData); // TODO
    // this.dataService.post(SETTINGS.ENDPOINTS.calculateLastRentalValue, facilityData)
    //   .subscribe((response: any) => {
    //     this.onFPFacilityLastRentalDataChange.next(response);
    //   })
  }

  uploadFpSupportDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.uploadFacilityPaperDocument, data)
      .subscribe((response: any) => {
        this.onFacilityPaperBaseDataChange.next(response);
        this.onFPUploadDocumentChange.next(response);
      });
  }

  uploadFpBccDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.uploadFpBccDocument, data)
      .subscribe((response: any) => {
        this.onFPUploadDocumentChange.next(response);
      });
  }

  deactivateFpSupportDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateFpFacilitySupportingDoc, data)
      .subscribe((response: any) => {
        this.onFacilityPaperBaseDataChange.next(response);
        this.onFPUploadDocumentChange.next(response);
      });
  }

  deactivateFpBccDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateFpBccDoc, data)
      .subscribe((response: any) => {
        this.onFPUploadDocumentChange.next(response);
      });
  }

  deactivateFpCreditRiskDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateFpCreditRiskDoc, data)
      .subscribe((response: any) => {
        this.onFPCreditRiskDocument.next(response);
      });
  }

  downloadFpDocument(docStorage) {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocument);
      data.url = data.url + "/" + docStorage.docStorageID;
      this.dataService.get(data).subscribe((response: any) => {
        this.onDownloadLinkChage.next({
          data: response,
          fileName: docStorage.fileName,
        });
        resolve(response);
      }, reject);
    });
  }

  downloadFpCribDataDocument(docStorage) {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocument);
      data.url = data.url + "/" + docStorage.docStorageID;
      this.dataService.get(data).subscribe((response: any) => {
        this.onDownloadLinkChageCribDetail.next({
          data: response,
          fileName: docStorage.fileName,
        });
        resolve(response);
      }, reject);
    });
  }

  downloadFpSupportDocument(docStorage) {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocument);
      data.url = data.url + "/" + docStorage.docStorageID;
      this.dataService.get(data).subscribe((response: any) => {
        // this.onDownloadLinkChageFPSupportDoc.next({
        //   data: response,
        //   fileName: docStorage.fileName
        // });
        resolve(response);
      }, reject);
    });
  }

  /*viewFpSupportDocument(docStorage) {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocument);
      data.url = data.url + '/' + docStorage.docStorageID;
      this.dataService.get(data)
        .subscribe((response: any) => {
          let viewPdf = new Blob([response], { type: 'application/pdf'})
          const fileUrl = URL.createObjectURL(viewPdf);
          window.open(fileUrl, '_blank');
          URL.revokeObjectURL(fileUrl);
          resolve(response);
        }, reject)
    });
  }*/

  viewFpSupportDocument(docStorage) {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocument);
      data.url = data.url + "/" + docStorage.docStorageID;
      this.dataService.get(data).subscribe((response: any) => {
        //  this.onViewLinkChageFPSupportDoc.next({
        //    data: response,
        //    fileName: docStorage.fileName
        //  });
        resolve(response);
      }, reject);
    });
  }

  saveOtherBankDetails(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditCustomerOtherBankDetail, data)
      .subscribe((response: any) => {
        this.onOtherBankDetailsChange.next(response);
      });
  }

  uploadFpCribDocuments(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.uploadFPCustomerCribDetail, data)
      .subscribe((response: any) => {
        this.onUploadCribDocumentChange.next(response);
        this.onFacilityPaperBaseDataChange.next(response);
      });
  }

  deactivateCribSupportDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateCribSupportingDoc, data)
      .subscribe((response: any) => {
        this.onUploadCribDocumentChange.next(response);
      });
  }

  uploadFacilityDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.uploadFacilityDocument, data)
      .subscribe((response: any) => {
        this.onFPFacilityChange.next(response);
        this.onFPFacilitiesChange.next(response);
      });
  }

  deactivateFacilityDocuments(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateFacilitySupportingDoc, data)
      .subscribe((response: any) => {
        this.onFPFacilitiesChange.next(response);
        this.onFPFacilityChange.next(response);
      });
  }

  saveOrUpdateFacilityRepayment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateFacilityRepayment, data)
      .subscribe((response: any) => {
        this.onFPFacilityChange.next(response);
        this.onFPFacilitiesChange.next(response);
      });
  }

  updateFacilityPaperExposure(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.updateFacilityPaperExposure, data)
      .subscribe((response: any) => {
        this.onBaseFacilityPaperChange.next(response);
        this.onCalculateFacilityPaperExposureChange.next(response);
      });
  }

  calculateFacilityPaperExposure(data: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.calculateFacilityPaperExposure, data)
      .subscribe((response: any) => {
        this.onCalculateFacilityPaperExposureChange.next(response);
        this.onCalculateFacilityPaperExposureSubj.next(response);

        setTimeout(() => {
          let payload: any = {
            exposures: [],
            facilityPaperDTO: response,
          };
          this.updateGroupExposure(payload);
        }, 300);
      });
  }

  getUpmGroupByWorkFlowTemplateIDAndLoggedInUserUpmGroupCode(data) {
    this.dataService
      .post(
        SETTINGS.ENDPOINTS
          .getUpmGroupByWorkFlowTemplateIDAndLoggedInUserUpmGroupCode,
        data,
      )
      .subscribe((response: any) => {
        this.onUpmGroupChange.next(response);
      });
  }

  getUserUPMData(userADID): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getUPMDetails);
      data.url = data.url + "/" + userADID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getUserDetailListFormBranchAuthorityLevel(data) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(
          SETTINGS.ENDPOINTS.getUserDetailListFormBranchAuthorityLevel,
          data,
        )
        .subscribe((response: any) => {
          resolve(response.branchAuthorityLevelResponseDTOList);
        });
    });
  }

  async getEligibleUsers(createdAdUserID, currentAssignUser, data) {
    let eligibleUsers = [];
    let userUpmData = await this.getUserUPMData(createdAdUserID);

    if (!userUpmData.divCode) {
      userUpmData = await this.getUserUPMData(currentAssignUser);
    }

    if (
      userUpmData &&
      userUpmData.divCode &&
      userUpmData.divCode != this.applicationService.getLoggedInUserDivCode() &&
      data.divCode != this.applicationService.getLoggedInUserDivCode()
    ) {
      let assignedUserEligibleUsers: [] =
        await this.getUserDetailListFormBranchAuthorityLevel({
          solId: this.applicationService.getLoggedInUserDivCode(),
          roleId: data.roleId,
          appCode: "",
        });
      eligibleUsers.push(...assignedUserEligibleUsers);
    }

    if (
      userUpmData &&
      userUpmData.divCode &&
      userUpmData.divCode != data.divCode
    ) {
      let createdUserEligibleUsers: [] =
        await this.getUserDetailListFormBranchAuthorityLevel({
          solId: userUpmData.divCode,
          roleId: data.divCode,
          appCode: "",
        });
      eligibleUsers.push(...createdUserEligibleUsers);
    }

    let facilityPaperEligibleUsers: [] =
      await this.getUserDetailListFormBranchAuthorityLevel(data);

    eligibleUsers.push(...facilityPaperEligibleUsers);

    this.userDetails = _.uniqBy(eligibleUsers, (i) => i.userID);

    this.onUserDetailFromBrachAuthorityChange.next(this.userDetails);
  }

  updateFacilityPaper(data: any, isNavigate: boolean) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.updateFacilityPaper, data)
        .subscribe(
          (response: any) => {
            resolve(response);
            this.facilityPaperDTO = response;
            this.onFacilityPaperChange.next(this.facilityPaperDTO);
            this.onFacilityPaperBaseDataChange.next(this.facilityPaperDTO);
            this.onFPCompanyROAChange.next(this.facilityPaperDTO);
            this.onFPCompanyDirectorsChange.next(this.facilityPaperDTO);
            this.onShareHolderDetailsChange.next(this.facilityPaperDTO);
            this.onFPFacilitiesChange.next(this.facilityPaperDTO);
            this.onFPFacilityChange.next(this.facilityPaperDTO);
            this.onBaseFacilityPaperChange.next(this.facilityPaperDTO);
            this.onUploadCribDocumentChange.next(this.facilityPaperDTO);
            this.onOtherBankDetailsChange.next(this.facilityPaperDTO);
            this.onFpCustomerChange.next(this.facilityPaperDTO);
            this.onCreditRiskCommentListChange.next(this.facilityPaperDTO);
            this.onFpUpcSectionChange.next(this.facilityPaperDTO);
            this.onFPaperSecSummeryChange.next(this.facilityPaperDTO);
            this.onReviewerCommentListChange.next(this.facilityPaperDTO);
            this.onFPUploadDocumentChange.next(this.facilityPaperDTO);
            this.onFPCommentsChange.next(this.facilityPaperDTO);
            this.getFacilityPaperHistory();
            this.onCreditRiskCommentListHistory.next(this.facilityPaperDTO);
            this.onCustomerCovenant.next(this.facilityPaperDTO);
            //this.getCovenantResponse();
            this.getCovenantListByFpRefNumber();
            this.onFPCreditRiskDocument.next(this.facilityPaperDTO);

            if (isNavigate) {
              this.router.navigate(["/my-facility-papers"]);
            }
          },
          (err: any) => {
            resolve(null);
          },
        );
    });
  }

  updateFacilityPaperOutstandingDate(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.updateFacilityPaperOutstandingDate, data)
      .subscribe((response: any) => {
        this.onFPFacilitiesChange.next(response);
        this.onBaseFacilityPaperChange.next(response);
      });
  }

  addEditComment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditComment, data)
      .subscribe((response: any) => {
        if (response) {
          this.onFPCommentsChange.next(response);
        }
      });
  }

  saveOrUpdateFpRiskComment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditCreditRiskComment, data)
      .subscribe((response: any) => {
        // this.onCreditRiskCommentListChange.next(response);
        this.onSaveOrUpdateFpCreditRiskCommentListChange.next(response);
      });
  }

  addNewFpRiskComment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addNewCreditRiskComment, data)
      .subscribe((response: any) => {
        // this.onCreditRiskCommentListChange.next(response);
        this.onSaveOrUpdateFpCreditRiskCommentListChange.next(response);
      });
  }

  addEditCreditRiskReply(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditCreditRiskReply, data)
      .subscribe((response: any) => {
        this.onAddEditCreditRiskReplyChange.next(response);
        // this.onCreditRiskCommentListChange.next(response);
      });
  }

  getUserDaByUserName(userName) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getUserDAByLoggedInUser);
    data.url = data.url + "/" + userName;
    this.dataService.get(data).subscribe((response: any) => {
      this.userDa = response;
      this.onChangeLoggedUserName.next(this.userDa);
    });
  }

  getActiveApprovedUpcTemplates(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getActiveApprovedUpcTemplateDtoList,
      );
      this.dataService.get(data).subscribe((response: any) => {
        this.activeApprovedUpcTemplates = response;
        this.onUpcTemplateListLoad.next(this.activeApprovedUpcTemplates);
        resolve(response);
      }, reject);
    });
  }

  getUpcTemplateDtoByID(id) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getUPCTemplateUpdateDTO);
    data.url = data.url + "/" + id;
    this.dataService.get(data).subscribe((response: any) => {
      this.selectedUpcTemplate = response;
      this.onUpcTemplateChange.next(response);
    });
  }

  getAllUpcSectionData(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getAllUpcSectionData);
      this.dataService.get(data).subscribe((response: any) => {
        this.upcSectionData = response;
        this.onUpcSectionDataChange.next(this.upcSectionData);
        resolve(response);
      }, reject);
    });
  }

  addEditUPCSectionData(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditUPCSectionData, data)
      .subscribe((response: any) => {
        this.upcSectionData = response;
        this.onFpUpcSectionChange.next(response);
      });
  }

  getFpKalyptoDetail(searchData) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.getKalyptoDetail, searchData)
      .subscribe((response: any) => {
        this.fpKalyptoData = response;
        this.onFpKalyptoDataChange.next(response);
      });
  }

  removeUpcSectionData(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.removeUpcSectionData, data)
      .subscribe((response: any) => {
        this.onFpUpcSectionChange.next(response);
      });
  }

  saveUpdateSecuritySummery(searchData) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateSecuritySummery, searchData)
      .subscribe((response: any) => {
        this.onFPaperSecSummeryChange.next(response);
      });
  }

  getCorporateComprehensive(data): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getCorporateComprehensive, data)
        .subscribe((response: any) => {
          this.customerCribDetails = response;
          this.onCustomerCribDetailsChange.next(this.customerCribDetails);
          resolve(response);
        }, reject);
    });
  }

  getCustomerDetailFromBank(data): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getCustomerDetailFromBank, data)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getConsumerComprehensive(data): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getConsumerComprehensive, data)
        .subscribe((response: any) => {
          this.customerCribDetails = response;
          this.onCustomerCribDetailsChange.next(this.customerCribDetails);
          resolve(response);
        }, reject);
    });
  }

  saveUpdateFacilitySecurity(data: any, prevFPData: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveUpdateFacilitySecurity, data)
      .subscribe((response: any) => {
        var updatedResponse: any = {
          ...response,
          fpUpcSectionDataDTOList: prevFPData.fpUpcSectionDataDTOList,
          casCustomerDTOList: prevFPData.casCustomerDTOList,
          facilityDTOList:
            response && response.facilityDTOList
              ? response.facilityDTOList.map((f: any) => ({
                  ...f,
                  fusTraceList:
                    f.fusTraceList != null
                      ? f.fusTraceList.map((c: any) => ({
                          ...c,
                          addedBy: c.createdUserDisplayName,
                          date: moment(c.createdDate).format(
                            "MMMM Do YYYY, h:mm:ss a",
                          ),
                          childCmnt: [],
                        }))
                      : [],
                }))
              : [],
        };
        this.onFPFacilityChange.next(updatedResponse);
        this.onFPFacilitiesChange.next(updatedResponse);
        this.onFacilityPaperBaseDataChange.next(updatedResponse);
        this.calculateFacilityPaperExposure(updatedResponse);
      });
  }

  isAbleToReturnFacilityPaperToAgent(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.isAbleToReturnFacilityPaperToAgent, data)
      .subscribe((response: any) => {
        this.onAbleToReturnFacilityPaperToAgentChange.next(response);
      });
  }

  updateSecuritySummaryTopic(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateSecuritySummery, data)
      .subscribe((response: any) => {
        this.onFPaperSecSummeryChange.next(response);
      });
  }

  getFPDirectReturnUsersList(data) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getFPDirectReturnUsersList, data)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  saveOrUpdateFpReviewerComment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.approveOrRejectFacilityPaper, data)
      .subscribe((response: any) => {
        this.onReviewerCommentListChange.next(response);
      });
  }

  getFacilityPaperHistory() {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getFacilityPaperHistory, {
          facilityPaperID: this.urlEncodeService.decode(
            this.selectedFacilityPaperID,
          ),
        })
        .subscribe((response: any) => {
          this.onFacilityPaperHistoryChange.next(response);
          resolve(response);
        }, reject);
    });
  }

  getPagedFacilityPaperHistoryWithUPCTemplateDetails(data, paginationData) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .postWithPageData(
          SETTINGS.ENDPOINTS.getPagedFacilityPaperHistoryWithUPCTemplateDetails,
          data,
          paginationData,
        )
        .subscribe((response: any) => {
          this.onPagedFacilityPaperHistoryWithUPCTemplateDetails.next(response);
          resolve(response);
        }, reject);
    });
  }

  copyUPCSectionData(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.copyUPCSectionData, data)
      .subscribe((response: any) => {
        this.upcSectionData = response;
        this.onFpUpcSectionChange.next(response);
        this.onFPFacilityChange.next(response);
        this.onFPCompanyROAChange.next(response);
        this.onFPCompanyDirectorsChange.next(response);
        this.onFPFacilitiesChange.next(response);
        this.onFPaperSecSummeryChange.next(response);
        this.onFPUploadDocumentChange.next(response);
        this.onBaseFacilityPaperChange.next(response);
      });
  }

  getTotalCashAmount() {
    let securityCashMap = {};
    let securityCashTotal = 0;
    let facilityPaper: any = {};
    this.onFPFacilitiesChange.subscribe((res: any) => {
      facilityPaper = res;

      facilityPaper.facilityDTOList.forEach((e) => {
        e.facilitySecurityDTOList.forEach((s) => {
          securityCashMap[s.facilitySecurityID] = s.cashAmount;
        });
      });

      for (const [key, value] of Object.entries(securityCashMap)) {
        securityCashTotal = securityCashTotal + +value;
      }
    });
    return Number(securityCashTotal);
  }

  isAbleToEditFacilityPaper() {
    let facilityPaper: any = {};
    this.onFacilityPaperChange.subscribe((response: any) => {
      facilityPaper = response;
    });

    return (
      this.privilegeService.hasPrivilege(
        this.masterDataPrivilege.ICAS_SETTINGS_FACILITY_PAPER_EDIT,
      ) &&
      facilityPaper.currentAssignUserID ==
        this.applicationService.getLoggedInUserUserID() &&
      (facilityPaper.currentFacilityPaperStatus ==
        this.facilityStatusConst.DRAFT ||
        facilityPaper.currentFacilityPaperStatus ==
          this.facilityStatusConst.CANCEL ||
        facilityPaper.currentFacilityPaperStatus ==
          this.facilityStatusConst.IN_PROGRESS)
    );
  }

  saveOrUpdateCribReport(data: CribDetailsSaveDTO) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateCribReport, data)
      .subscribe((response: any) => {
        this.onUploadCribDocumentChange.next(response);
      });
  }

  deactiveCribReport(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateCribReport, data)
      .subscribe((response: any) => {
        this.onUploadCribDocumentChange.next(response);
      });
  }

  getCreditCalculatedFacilitiesESBResponseStatus(facilityPaperID) {
    let data = { facilityPaperID: facilityPaperID };
    this.dataService
      .post(
        SETTINGS.ENDPOINTS.getCreditCalculatedFacilitiesESBResponseStatus,
        data,
      )
      .subscribe((response: any) => {
        this.onCreditCalculatedFacilitiesESBResponseStatusChange.next(response);
      });
  }

  saveOrUpdateCustomerRatings(searchData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveOrUpdateCustomerRatings, searchData)
        .subscribe((response: any) => {
          resolve(response);
        });
    });
  }

  getCurrentAssignUserDivCode(facilityPaperID) {
    const data = Object.assign(
      {},
      SETTINGS.ENDPOINTS.getCurrentAssignUserDivCode,
    );
    data.url = data.url + "/getCurrentAssignedUserDivCode" + facilityPaperID;
    this.dataService.get(data);
  }

  getFacilityPaperByIDT(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityPaperByID);
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedFacilityPaperID);
      this.dataService.get(data).subscribe((response: any) => {
        let val = response.currentAssignUserDivCode;
        val = response.currentAssignUserDivCode;

        if (response.leadRefNumber) {
          Promise.all([this.getLeadByRefNumber(response.leadRefNumber)]).then(
            () => {
              resolve();
            },
            reject,
          );
        } else {
          resolve(response.currentAssignUserDivCode);
        }
      }, reject);
    });
  }

  getRiskDivCode() {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .get(SETTINGS.ENDPOINTS.getRiskDivCode)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  getFacilityPaperByDate(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityPaperByID);
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedFacilityPaperID);
      this.dataService.get(data).subscribe((response: any) => {
        let val = response.lastActionDateStr;
        val = response.currentAssignUserDivCode;

        if (response.leadRefNumber) {
          Promise.all([this.getLeadByRefNumber(response.leadRefNumber)]).then(
            () => {
              resolve();
            },
            reject,
          );
        } else {
          resolve(response.lastActionDateStr);
        }
      }, reject);
    });
  }

  getRiskCommentList(): Promise<any> {
    {
      return new Promise((resolve, reject) => {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.getRiskCommentList);
        data.url =
          data.url +
          "/" +
          this.urlEncodeService.decode(this.selectedFacilityPaperID);
        this.dataService.get(data).subscribe((response: any) => {
          Promise.all([]).then(() => {
            resolve(response);
          }, reject);
        });
      });
    }
  }

  getCIDList(): Promise<any> {
    {
      // let value;
      return new Promise((resolve, reject) => {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.getCIDList);
        data.url =
          data.url +
          "/" +
          this.urlEncodeService.decode(this.selectedFacilityPaperID);
        this.dataService.get(data).subscribe((response: any) => {
          var val: any[] = response.map((num) => {
            return num.customerFinancialId;
          });

          if (val && val.length > 0) {
            this.selectedCIFID = this.urlEncodeService.encode(val);
          }
          Promise.all([]).then(() => {
            resolve(val);
          }, reject);
        });
      });
    }
  }

  getCovenantList(data, callback) {
    this.dataService.post(SETTINGS.ENDPOINTS.getCovenantList, data).subscribe(
      (response: any) => {
        this.onCustomerCovenant.next(response);

        if (callback) {
          callback(response);
        }
      },
      (error: any) => {
        console.error("Error fetching covenant list:", error);

        if (callback) {
          callback(null, error);
        }
      },
    );
  }

  getCovenantListFromFinacle(data): Observable<any> {
    return this.dataService.post(SETTINGS.ENDPOINTS.getCovenantList, data).pipe(
      map((data) => {
        return data;
      }),
    );
  }

  getCustomerCovenantListByFpRefNumber() {
    const fpRefNumber = sessionStorage.getItem("facilityPaperRefID");

    if (fpRefNumber) {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCovenantListByFpRefNumber,
      );

      data.url = data.url + "/" + fpRefNumber;

      return this.dataService.get(data).pipe(
        map((response: any) => {
          this.customerCovenatDTO = response;
          //this.onCovenantTabChange.next(response);
          const val = response.map((num) => num.customerEvaluationId);
          window.sessionStorage.setItem("CIF_ID", val.join(","));
          //this.onCovenantTabChange.next(response);
          return response;
        }),
      );
    }
  }

  saveCustomerCovenantDetails(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveCustomerCovenantDetails, data)
        .subscribe((response: any) => {
          this.onCustomerCovenantTabChange.next(response);
          resolve(response);
        });
    });
  }

  getCovenantListByFpRefNumber(): Promise<any> {
    return new Promise((resolve, reject) => {
      const fpRefNumber = sessionStorage.getItem("facilityPaperRefID")
        ? sessionStorage.getItem("facilityPaperRefID")
        : null;

      if (fpRefNumber) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.getCovenantListByFpRefNumber,
        );

        data.url = data.url + "/" + fpRefNumber;

        this.dataService.get(data).subscribe(
          (response: any) => {
            //new
            // const val = response.customerEvaluationId;

            resolve(response);

            const val = response.map((num) => {
              return num.customerEvaluationId;
            });

            sessionStorage.setItem("CIF_ID", val);
          },
          (error: any) => {
            //console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        //console.error("Error:", error);
        reject(error);
      }
    });
  }

  getCovenantResponse(): Promise<any> {
    return new Promise((resolve, reject) => {
      const fpRefNumber = sessionStorage.getItem("facilityPaperRefID")
        ? sessionStorage.getItem("facilityPaperRefID")
        : null;
      if (fpRefNumber) {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.getCovenantResponse);
        data.url = data.url + "/" + fpRefNumber;

        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  deleteCovenant(
    customerCovenantId: number,
    createdUserDisplayName: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (customerCovenantId) {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.deleteCovenants);
        data.url =
          data.url + "/" + customerCovenantId + "/" + createdUserDisplayName;

        this.dataService.get(data).subscribe(
          (response: any) => {
            console.log("response customer covenant", response);

            this.onCustomerCovenantTabChange.next(response);
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  getApplicationCovenantListByFpRefNumber(): Promise<any> {
    return new Promise((resolve, reject) => {
      const fpRefNumber = sessionStorage.getItem("facilityPaperRefID")
        ? sessionStorage.getItem("facilityPaperRefID")
        : null;
      if (fpRefNumber) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.getApplicationCovenantListByFpRefNumber,
        );
        data.url = data.url + "/" + fpRefNumber;

        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  deleteApplicationCovenants(
    applicationCovenantId: number,
    createdUserDisplayName: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // if (applicationCovenantId) {

      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.deleteApplicationCovenants,
      );
      data.url =
        data.url + "/" + applicationCovenantId + "/" + createdUserDisplayName;

      this.dataService.get(data).subscribe(
        (response: any) => {
          console.log("response", response);
          this.onFacilityCovenantTabChangeSubject.next(response);
          resolve(response);
        },
        (error: any) => {
          console.error("Error:", error);
          reject(error);
        },
      );
      // } else {
      //   const error = "Value not found in local storage.";
      //   console.error("Error:", error);
      //   reject(error);
      // }
    });
  }

  saveApplicationCovenantDetails(data): Promise<any> {
    console.log("saveApplicationCovenantDetails..............................");
    //this.onFacilityCovenantTabChangeSubject.next(data);
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveApplicationCovenantDetails, data)
        .subscribe((response: any) => {
          console.log("response**************", response);
          this.onFacilityCovenantTabChangeSubject.next(response);
          resolve(response);
        });
    });
  }

  getFacilityList(): Promise<any> {
    {
      return new Promise((resolve, reject) => {
        const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityList);
        const facilityPaperID = Number(
          sessionStorage.getItem("facilityPaperID"),
        );
        data.url = data.url + "/" + facilityPaperID;
        this.dataService.get(data).subscribe((response: any) => {
          Promise.all([]).then(() => {
            resolve(response);
          }, reject);
        });
      });
    }
  }

  getCustomerEvaluationListById(): Promise<any> {
    return new Promise((resolve, reject) => {
      const storedValue = sessionStorage.getItem("myKey");
      // if (storedValue) {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCustomerEvaluationListById,
      );
      //data.url = data.url + "/" + storedValue;
      data.url =
        data.url + "/" + this.urlEncodeService.decode(this.selectedCIFID);

      this.dataService.get(data).subscribe(
        (response: any) => {
          //new
          const val = response.customerEvaluationId;

          resolve(response);

          // const val = response.map((num) => {
          //   return num.customerEvaluationId;
          // });;

          // window.localStorage.setItem('CIF_ID', val);
        },
        (error: any) => {
          console.error("Error:", error);
          reject(error);
        },
      );
      // } else {
      //   const error = "Value not found in local storage.";
      //   console.error("Error:", error);
      //   reject(error);
      // }
    });
  }

  getCustomerEvaluationByCIFId(customerEvaluationId: Number): Promise<any> {
    return new Promise((resolve, reject) => {
      // const storedValue = localStorage.getItem("myKey");
      // if (storedValue) {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCustomerEvaluationListByCIFId,
      );
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedCIFID) +
        "/" +
        customerEvaluationId;

      this.dataService.get(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.error("Error:", error);
          reject(error);
        },
      );
      // } else {
      //   const error = "Value not found in local storage.";
      //   console.error("Error:", error);
      //   reject(error);
      // }
    });
  }

  getEvaluationScore(customerEvaluationId: Number): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getEvaluationScore);
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedCIFID) +
        "/" +
        customerEvaluationId;

      this.dataService.get(data).subscribe(
        (response: any) => {
          const val = response.map((num) => {
            return num.score;
          });
          resolve(val);
        },
        (error: any) => {
          reject(error);
        },
      );
    });
  }

  //post method for saving CEID

  getIdsFromLocalStorage(): {
    facilityPaperID: number;
    customerFinancialId: number;
    customerEvaluationId: number;
  } {
    const facilityPaperID = Number(sessionStorage.getItem("facilityPaperID"));
    const customerFinancialId = Number(
      sessionStorage.getItem("customerFinancialId"),
    );
    const customerEvaluationId = Number(
      this.urlEncodeService.decode(this.selectedCIFID),
    );

    return { facilityPaperID, customerFinancialId, customerEvaluationId };
  }

  saveOrUpdateCIFID(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.saveOrUpdateCIFID, data)
      .subscribe((response: any) => {
        this.onCustomerEvaluation.next(response);

        sessionStorage.setItem("id", response.id.toString());
      });
  }

  // deleteEvaluation(): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const storedValue = localStorage.getItem("myKey");
  //     const customerEvaluationId = localStorage.getItem("customerEvaluationId");
  //     const id = localStorage.getItem("id");
  //     if (storedValue) {
  //       const data = Object.assign({}, SETTINGS.ENDPOINTS.deleteEvaluation);
  //       data.url =
  //         data.url + "/" + storedValue + "/" + customerEvaluationId + "/" + id;

  //       this.dataService.delete(data).subscribe(
  //         (response: any) => {
  //           resolve(response);
  //         },
  //         (error: any) => {
  //           reject(error);
  //         }
  //       );
  //     } else {
  //       const error = "Value not found in local storage.";

  //       reject(error);
  //     }
  //   });
  // }

  deleteEvaluation(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.deleteEvaluation, data)
        .subscribe((response: any) => {
          //this.onCustomerCovenantSave.next(response);
          resolve(response);
        });
    });
  }

  getCustomerMaxEvaluationForm(facilityPaperID: Number): Promise<any> {
    return new Promise((resolve, reject) => {
      const facilityPaperID = sessionStorage.getItem("facilityPaperID");
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCustomerMaxEvaluationForm,
      );
      data.url = data.url + "/" + facilityPaperID;

      this.dataService.get(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          reject(error);
        },
      );
    });
  }

  getCustomerMaxEvaluationId(facilityPaperID: Number): Promise<any> {
    return new Promise((resolve, reject) => {
      const facilityPaperID = sessionStorage.getItem("facilityPaperID");
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCustomerEvaluationId,
      );
      data.url = data.url + "/" + facilityPaperID;

      this.dataService.get(data).subscribe(
        (response: any) => {
          sessionStorage.setItem(
            "customerEvaluationId",
            response.customerEvaluationId,
          );
          sessionStorage.setItem("id", response.id);
          resolve(response);
        },
        (error: any) => {
          reject(error);
        },
      );
    });
  }

  refreshFacilityPaperByID(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityPaperByID);
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedFacilityPaperID);
      this.dataService.get(data).subscribe((response: any) => {
        // this.facilityPaperDTO = response;
        this.onRefreshFacilityPaperByID.next(response);

        if (response.leadRefNumber) {
          Promise.all([this.getLeadByRefNumber(response.leadRefNumber)]).then(
            () => {
              resolve();
            },
            reject,
          );
        } else {
          resolve(response);
        }
      }, reject);
    });
  }

  uploadFPCreditRiskDocument(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.uploadCreditRiskDocument, data)
      .subscribe((response: any) => {
        this.onFPCreditRiskDocument.next(response);
      });
  }

  saveOrUpdateSecurityDocument(securityDocumentData): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(
          SETTINGS.ENDPOINTS.saveOrUpdateSecurityDocument,
          securityDocumentData,
        )
        .subscribe((response: any) => {
          resolve(response);
        });
    });
  }

  getSecurityDocumentHistory(securityDocumentID): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getSecurityDocumentHistory,
      );
      data.url = data.url + "/" + securityDocumentID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getSecurityDocumentElements(facilityPaperID): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getSecurityDocumentElements,
      );
      data.url = data.url + "/" + facilityPaperID;
      // data.url = data.url;
      this.dataService.get(data).subscribe((response: any) => {
        // console.log("response",response);
        //this.onDocumentationTabChange.next(response);
        resolve(response);
      });
    });
  }

  getCreditCalculatorData(data): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getCreditCalculatorData, data)
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
  // updateCustomerCovenant(customerCovenantId: number, data): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     const customerCovenantId = localStorage.getItem("customerCovenantId");
  //     const data = Object.assign({}, SETTINGS.ENDPOINTS.updateCustomerCovenant);
  //     data.url = data.url +"/"+customerCovenantId, data;

  //     this.dataService.post(data).subscribe((response: any) =>{
  //       console.log("response", response);

  //       resolve(response);
  //     },
  //     (error: any)=>{
  //       reject(error);
  //     })
  //   });
  // }

  updateCustomerCovenant(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.updateCustomerCovenant, data)
        .subscribe((response: any) => {
          this.onCustomerCovenantTabChange.next(response);
          resolve(response);
        });
    });
  }

  findCustomerCovenantByID(customerCovenantId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const customerCovenantId = sessionStorage.getItem("customerCovenantId");
      if (customerCovenantId) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.findCustomerCovenantById,
        );
        data.url = data.url + "/" + customerCovenantId;

        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  updateFacilityCovenant(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.updateFacilityCovenant, data)
        .subscribe((response: any) => {
          //this.onCustomerCovenantSave.next(response);

          resolve(response);
        });
    });
  }

  findFacilityCovenantByID(applicationCovenantId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const applicationCovenantId = sessionStorage.getItem(
        "applicationCovenantId",
      );
      if (applicationCovenantId) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.findFacilityCovenantById,
        );
        data.url = data.url + "/" + applicationCovenantId;

        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  findFacilityCovenantByIDToRemove(
    applicationCovenantId: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      //const applicationCovenantId = localStorage.getItem("applicationCovenantId");
      if (applicationCovenantId) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.findFacilityCovenantById,
        );
        data.url = data.url + "/" + applicationCovenantId;
        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  deactivateFpCreditRiskComment(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deactivateFpCreditRiskComment, data)
      .subscribe((response: any) => {
        this.onCreditRiskCommentListChange.next(response);
      });
  }

  findFacilityCovenantByFacilityId(facilityID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      //const facilityID = this.facilityData.facilityID;
      if (facilityID) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.getApplicationCovenantByFacilityID,
        );
        data.url = data.url + "/" + facilityID;
        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  getFacilityCovenants(facilityID) {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getApplicationCovenantByFacilityID,
      );
      data.url = data.url + "/" + facilityID;

      // const data = Object.assign({}, SETTINGS.ENDPOINTS.getApplicationCovenantByFacilityID);
      // data.url = data.url + "/" + facilityID;
      // return this.dataService.get(data)

      this.dataService.get(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          console.error("Error:", error);
          reject(error);
        },
      );
    });
  }

  // const data = Object.assign({}, SETTINGS.ENDPOINTS.getApplicationCovenantByFacilityID);
  // data.url = data.url + "/" + facilityID;
  // return this.dataService.get(data)

  getFacilityCovenants111(fpRefNumber) {
    const data = Object.assign(
      {},
      SETTINGS.ENDPOINTS.getApplicationCovenantListByFpRefNumber,
    );
    data.url = data.url + "/" + fpRefNumber;
    return this.dataService.get(data);
  }

  getFacilityCovenantList(): Promise<any> {
    return new Promise((resolve, reject) => {
      const fpRefNumber = sessionStorage.getItem("facilityPaperRefID")
        ? sessionStorage.getItem("facilityPaperRefID")
        : null;

      if (fpRefNumber) {
        const data = Object.assign(
          {},
          SETTINGS.ENDPOINTS.getFacilityCovenantList,
        );

        data.url = data.url + "/" + fpRefNumber;

        this.dataService.get(data).subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            console.error("Error:", error);
            reject(error);
          },
        );
      } else {
        const error = "Value not found in local storage.";
        console.error("Error:", error);
        reject(error);
      }
    });
  }

  getDocumentContent(currentFPId: number, secId: number) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getDocumentContent);
    data.url = data.url + "/" + currentFPId + "/" + secId;
    return this.dataService.get(data);
  }

  saveFpShareholderdetails(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.addEditShareHolderDetails, data)
      .subscribe((response: any) => {
        this.onShareHolderDetailsChange.next(response);
        this.onFacilityPaperBaseDataChange.next(response);
      });
  }

  duplicateFpFacilities(data) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.duplicateFpFacilities, data)
      .subscribe((response: any) => {
        this.onFPFacilityChange.next(response);
        this.onFPFacilitiesChange.next(response);
        this.onFacilityPaperBaseDataChange.next(response);
        this.onCalculateFacilityPaperExposureChange.next(response);
      });
  }

  updateFacilityPaperType(data: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.updateFacilityPaperType, data)
      .subscribe(
        (response: any) => {
          this.onBaseFacilityPaperChange.next(response);
          this.alertService.showToaster(
            "Facility paper has been updated successfully.",
            SETTINGS.TOASTER_MESSAGES.success,
            { timeOut: 2500 },
          );
        },
        (err: any) => {
          this.alertService.showToaster(
            "An error occurd. Please try agian later.",
            SETTINGS.TOASTER_MESSAGES.error,
            { timeOut: 2500 },
          );
        },
      );
  }

  updateCommitteeStatusHistory(updateData) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.updateCommitteeStatusHistory,
      updateData,
    );
  }

  updateBccDTO(updateData) {
    return this.dataService.post(SETTINGS.ENDPOINTS.updateBccDTO, updateData);
  }

  getFPUsersInvolved(facilityPaperID): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFPUsersInvolved);
      data.url = data.url + "/" + facilityPaperID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getFPUsersInvolved_test(facilityPaperID: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFPUsersInvolved);
      data.url = `${data.url}/${facilityPaperID}`;

      this.dataService.get(data).subscribe(
        (response: any) => {
          resolve(response);
        },
        (error: any) => {
          // Handle error and reject the promise
          console.error("Error fetching users involved:", error);
          reject(error);
        },
      );
    });
  }

  getFPCommitteeSignatureList(facilityPaperID): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getFPCommitteeSignatureList,
      );
      data.url = data.url + "/" + facilityPaperID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  /*updateCommitteeStatusHistory(data) {
    console.log("data",data);
     return this.dataService.post(SETTINGS.ENDPOINTS.updateCommitteeStatusHistory, data);

    this.dataService
        .post(SETTINGS.ENDPOINTS.updateCommitteeStatusHistory, data)
        .subscribe((response: any) => {
            console.log("responsessss - updateCommitteeStatusHistory",response);
           // this.onCommitteePaperStatusChange.next(response);
     });
  }*/

  getFPSignatures(facilityPaperID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getFPCommitteeSignatureList,
      );
      data.url = data.url + "/" + facilityPaperID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getFinacaleData(cusID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getFinacleExOutLimits, cusID)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          },
        );
    });
  }

  getWatchlistStatus(cusID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getWatchlistStatus, cusID)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          },
        );
    });
  }

  saveUPCTemplateComparisonCommentService(fpUPCTemplateComparisonRQ: any) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.saveFusTrace,
      fpUPCTemplateComparisonRQ,
    );
  }

  getUPCTemplateComparisonByDateService(fpUPCTemplateComparisonRQ) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.getUPCTemplateComparisonByDate,
      fpUPCTemplateComparisonRQ,
    );
  }

  getFacilityCommentsById(data: any) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.getFacilityCommentsById,
      data,
    );
  }

  getCommentsByFacilityId(data: any, facilityPaper: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.getFacilityCommentsById, data)
      .subscribe((res: any) => {
        var comments: any[] = res
          ? res.map((c: any) => ({
              ...c,
              addedBy: c.createdUserDisplayName,
              date: moment(c.createdDate).format("MMMM Do YYYY, h:mm:ss a"),
              childCmnt: [],
            }))
          : [];

        var updatedFP: any = {
          ...facilityPaper,
          facilityDTOList:
            facilityPaper && facilityPaper.facilityDTOList
              ? facilityPaper.facilityDTOList.map((f: any) => ({
                  ...f,
                  fusTraceList:
                    f.facilityID == data.mainKey ? comments : f.fusTraceList,
                }))
              : [],
        };
        this.onFPFacilitiesChange.next(updatedFP);
      });
  }

  saveCRComment(formData: any) {
    return this.dataService.post(SETTINGS.ENDPOINTS.saveFusTrace, formData);
  }

  getFacilityPaperByIDService() {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getFacilityPaperByID);
    data.url =
      data.url +
      "/" +
      this.urlEncodeService.decode(this.selectedFacilityPaperID);
    return this.dataService.get(data);
  }

  saveFusTraceView(data: any) {
    return this.dataService.post(SETTINGS.ENDPOINTS.saveViewComments, data);
  }

  getUPCTemplateCommentHistoryListService(fpUPCTemplateComparisonRQ) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.getUPCTemplateComparisonCommentHistory,
      fpUPCTemplateComparisonRQ,
    );
  }

  getLatestHistoryIdService(fpUPCTemplateComparisonRQ) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.getUPCSectionHistoryDataById,
      fpUPCTemplateComparisonRQ,
    );
  }

  getUPCSectionDataById(fpId: any, sectionId: any) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getUPCSectionDataById);
    data.url = data.url + "/" + fpId + "/" + sectionId;
    return this.dataService.get(data);
  }

  getUPCSectionsDataByFPId(facilityPaper: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getUPCSectionsDataByFPId,
      );
      data.url = data.url + "/" + facilityPaper.facilityPaperID;
      this.dataService.get(data).subscribe((res: any) => {
        var updatedFP: any = {
          ...facilityPaper,
          fpUpcSectionDataDTOList: res
            ? res.sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            : [],
        };
        this.onFacilityPaperChange.next(updatedFP);
        this.onFpUpcSectionChange.next(updatedFP);
        resolve(updatedFP);
      });
    });
  }

  getFusTracesByFacilityPaper(facilityPaper: any, flag: any) {
    const data = Object.assign(
      {},
      SETTINGS.ENDPOINTS.getFusTracesByFacilityPaper,
    );
    data.url = data.url + "/" + facilityPaper.facilityPaperID + "/" + flag;
    this.dataService.get(data).subscribe((res: any) => {
      if (flag == Constants.fusTraceFlag.UPCT) {
        this.onUPCFustaceChange.next(res);
      } else {
        var comments: any[] = res
          ? res.map((c: any) => ({
              ...c,
              addedBy: c.createdUserDisplayName,
              date: moment(c.createdDate).format("MMMM Do YYYY, h:mm:ss a"),
              childCmnt: [],
            }))
          : [];
        var updatedFP: any = {
          ...facilityPaper,
          facilityDTOList:
            facilityPaper && facilityPaper.facilityDTOList
              ? facilityPaper.facilityDTOList.map((f: any) => ({
                  ...f,
                  fusTraceList: comments.filter(
                    (c: any) => c.mainKey == f.facilityID,
                  ),
                }))
              : [],
        };
        this.onFPFacilitiesChange.next(updatedFP);
      }
    });
  }

  deleteCRComment(formData: any) {
    return this.dataService.post(SETTINGS.ENDPOINTS.deleteFusTrace, formData);
  }

  sortCommentHistory(data: any[]): any[] {
    var result: any[] = [];
    // merge child comments with parent comment
    data.forEach((comment: any) => {
      comment.childCmnt = data
        .filter((d: any) => d.parentRecordId == comment.id)
        .sort((a: any, b: any) => a.id - b.id);
    });

    //filter child comments
    result = data
      .filter((d: any) => d.parentRecordId == 0)
      .sort((a: any, b: any) => a.id - b.id);
    return result;
  }

  getCommitteeButtonEnableData(): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCommitteeButtonEnableData,
      );
      data.url =
        data.url +
        "/" +
        this.urlEncodeService.decode(this.selectedFacilityPaperID);
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  sendCAEmail(payload: any) {
    this.dataService.post(SETTINGS.ENDPOINTS.sendCAEmail, payload).subscribe(
      (res: any) => {
        console.log("Email Send Success: ", payload);
      },
      (err: any) => {
        console.log("Email Send Error: ", err);
      },
    );
  }

  forwardBCCDocs(fpBccId) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.forwardBCCDocsByFpBccId,
      fpBccId,
    );
  }

  authorizeDocs(fpBccId) {
    return this.dataService.post(
      SETTINGS.ENDPOINTS.authorizeBCCDocsByFpBccId,
      fpBccId,
    );
  }

  updateFacilityPaperYearType(data: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.updateFacilityPaperYearType, data)
      .subscribe(
        (response: any) => {
          this.onBaseFacilityPaperChange.next(response);
          this.onYearTypeChange.next(response.isFinancialYear);
          this.alertService.showToaster(
            "Facility paper has been updated successfully.",
            SETTINGS.TOASTER_MESSAGES.success,
            { timeOut: 2500 },
          );
        },
        (err: any) => {
          console.log(err);
          this.alertService.showToaster(
            "An error occurd. Please try agian later.",
            SETTINGS.TOASTER_MESSAGES.error,
            { timeOut: 2500 },
          );
        },
      );
  }

  hasExpiredInsurance(cusID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.hasExpiredInsurance, cusID)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (error: any) => {
            reject(error);
          },
        );
    });
  }

  uploadFpCribDocumentList(data: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.uploadFPCustomerCribDetails, data)
        .subscribe((response: any) => {
          this.onUploadCribDocumentChange.next(response);
          resolve(true);
        });
    });
  }

  updateCribReport(data: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.updateCribReport, data)
        .subscribe((response: any) => {
          this.onUploadCribDocumentChange.next(response);
          resolve(true);
        });
    });
  }

  deleteCribReport(data: any) {
    this.dataService
      .post(SETTINGS.ENDPOINTS.deleteCribReport, data)
      .subscribe((response: any) => {
        this.onUploadCribDocumentChange.next(response);
      });
  }

  getCribHistoryByCustomer(
    identificationNo: string,
    facilityPaperID: number,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCribHistoryByCustomer,
      );
      data.url = data.url + "/" + facilityPaperID + "/" + identificationNo;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getCovenantDetailsFromFinacle(custId: string): Promise<any> {
    const payload = {
      requestId: "CAS_0001",
      // custId: "300661280",
      custId: custId,
      acctId: "",
    };
    return this.dataService
      .post(SETTINGS.ENDPOINTS.getCovenantDetailsFromFinacle, payload)
      .toPromise();
    // return new Promise((resolve, reject) => {
    //   this.dataService.post(SETTINGS.ENDPOINTS.getCovenantDetailsFromFinacle, payload)
    //     .subscribe((response: any) => {
    //       resolve(response);
    //     }, reject);
    // });
  }

  refreshGroupExposureDetails(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.refreshGroupExposureDetails, payload)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurd. Please try agian later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  getGroupExposureDetails(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getGroupExposureDetails, payload)
        .subscribe(
          (response: any) => {
            resolve(response);
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurd. Please try agian later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  calculateGroupExposure(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.calculateGroupExposure, payload)
        .subscribe(
          (response: any) => {
            if (response && response !== null) {
              this.onBaseFacilityPaperChange.next(response);
              this.onCalculateFacilityPaperExposureChange.next(response);
              resolve(response);
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurd. Please try agian later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve(null);
            reject(err);
          },
        );
    });
  }

  updateGroupExposure(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.updateGroupExposure, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              this.onBaseFacilityPaperChange.next(response);
              this.onCalculateFacilityPaperExposureChange.next(response);
              resolve(response);
            }
          },
          (err: any) => {
            resolve(null);
            reject(err);
          },
        );
    });
  }

  downloadSupportingDocsZipfile(fpId: number): Observable<Blob> {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.downloadDocs);
    data.url = data.url + "/" + fpId;

    return this.dataService.postZip(data, { responseType: "blob" });
  }

  getEnvironmentalRiskCategories() {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .get(SETTINGS.ENDPOINTS.getEnvironmentalRiskTree)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
            } else {
              resolve([]);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  saveEnvironmentalRiskCategory(payload: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveFPEnvironmentalRiskCategory, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.onESGRiskScoreChange.next(response);
              if (response !== null && response.length > 0) {
                let fpData: any;
                this.onFacilityPaperChange.subscribe((prevData: any) => {
                  fpData = prevData;
                });

                if (fpData !== null) {
                  this.onFacilityPaperChange.next({
                    ...fpData,
                    isESGApproved: Constants.yesNoConst.N,
                    isESGPaper: Constants.yesNoConst.Y,
                  });
                }
              }
              this.alertService.showToaster(
                "Data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              resolve([]);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  removeFPEnvironmentalRisk(facilityPaperID: any) {
    return new Promise<any>((resolve, reject) => {
      let data: any = SETTINGS.ENDPOINTS.removeFPEnvironmentalRisk;
      data.url = data.url + "/" + facilityPaperID;
      this.dataService.post(data).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
            this.onESGRiskScoreChange.next(response);
            let fpData: any;
            this.onFacilityPaperChange.subscribe((response: any) => {
              fpData = response;
            });

            if (fpData !== null) {
              this.onFacilityPaperChange.next({
                ...fpData,
                isESGApproved: Constants.yesNoConst.N,
                isESGPaper: Constants.yesNoConst.N,
                approvedESGScore: "",
              });
            }

            this.alertService.showToaster(
              "Data has been removed successfully.",
              SETTINGS.TOASTER_MESSAGES.success,
            );
          } else {
            resolve([]);
          }
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  getAnnexureById(annexureId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getFPAnnexureById);
      data.url = data.url + "/" + annexureId;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      }, reject);
    });
  }

  saveAnnexureAnswer(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveEsgFPAnnexure, payload)
        .subscribe((response: any) => {
          this.getAnnexureByFacilityPaperID(payload.facilityPaperID).then(
            (latestAnnexures) => {
              this.onAFESGChange.next(latestAnnexures);
            },
          );
          resolve(response);
        }, reject);
    });
  }

  getAnnexureByFacilityPaperID(facilityPaperID: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getAnnexureByFPId);
      data.url += "/" + facilityPaperID;

      this.dataService.get(data).subscribe(
        (res: any) => {
          const result = Array.isArray(res) ? res : res.result || [];

          this.onAFESGChange.next(result);
          resolve(result);
        },
        (err) => {
          this.onAFESGChange.next([]); // Clear annexures on error too
          reject(err);
        },
      );
    });
  }

  getAnnexureByAnnexureDataId(annexureDataId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getFPAnnexureByAnnexureDataId,
      );
      data.url += "/" + annexureDataId;

      this.dataService.get(data).subscribe((res: any) => resolve(res), reject);
    });
  }

  updateAnnexureAnswer(annexureDataId: number, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.updateDataToFPAnnexure);
      data.url += "/" + annexureDataId;

      this.dataService.post(data, payload).subscribe((res: any) => {
        this.getAnnexureByFacilityPaperID(payload.facilityPaperID).then(
          (latest) => {
            this.onAFESGChange.next(latest);
          },
        );
        resolve(res);
      }, reject);
    });
  }

  getAnnexureList(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService.get(SETTINGS.ENDPOINTS.getFPAnnexureList).subscribe(
        (response: any) => {
          resolve(response);
        },
        () => {
          reject();
        },
      );
    });
  }

  approvedFPEnvironmentalRisk(payload: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.approvedFPEnvironmentalRisk, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              let fpData: any;
              this.onFacilityPaperChange.subscribe((prevData: any) => {
                fpData = prevData;
              });
              if (fpData !== null) {
                this.onFacilityPaperChange.next({
                  ...fpData,
                  isESGApproved: response.isESGApproved,
                  isESGPaper: response.isESGPaper,
                  approvedESGScore: response.approvedESGScore,
                });
              }
              this.alertService.showToaster(
                "Data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              resolve(null);
            }
          },
          (err: any) => {
            resolve(null);
          },
        );
    });
  }

  getFPEnvironmentalRiskOpinion(facilityPaperID: any) {
    let prevData: any[] = [];
    this.onESGRiskOpinionChange.subscribe((res: any[]) => {
      prevData = res;
    });

    if (prevData && prevData.length > 0) {
      return prevData;
    }

    return new Promise<any[]>((resolve, reject) => {
      let request: any = {
        ...SETTINGS.ENDPOINTS.getFPEnvironmentalRiskOpinion,
        url: `${SETTINGS.ENDPOINTS.getFPEnvironmentalRiskOpinion.url}/${facilityPaperID}`,
      };
      this.dataService.get(request).subscribe(
        (response: any) => {
          this.onESGRiskOpinionChange.next(response);
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  saveEnvironmentalRiskOpinion(payload: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveFPEnvironmentalRiskOpinion, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.onESGRiskOpinionChange.next(response);
              this.alertService.showToaster(
                "Data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              resolve([]);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  saveEnvironmentalRiskReply(payload: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveFPEnvironmentalRiskReply, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.onESGRiskOpinionChange.next(response);
              this.alertService.showToaster(
                "Data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              resolve([]);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  removeEnvironmentalRiskOpinion(payload: any) {
    return new Promise<any>((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.removeFPEnvironmentalRiskOpinion, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.onESGRiskOpinionChange.next(response);
              this.alertService.showToaster(
                "Data has been removed successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              resolve([]);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  saveCommitteeInquiry(payload: any): Promise<any> {
    return this.dataService
      .post(SETTINGS.ENDPOINTS.saveCommitteeInquiry, payload)
      .toPromise();
  }

  getCommitteeInquiryByFacilityPaperId(
    facilityPaperID: number,
  ): Observable<any> {
    const data = Object.assign(
      {},
      SETTINGS.ENDPOINTS.getCommitteeInquiryByFacilityPaperId,
    );
    data.url = data.url + "/" + facilityPaperID;
    return this.dataService.get(data);
  }

  statusUpdateCommitteeInquiry(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.statusUpdateCommitteeInquiry, payload)
        .subscribe(resolve, reject);
    });
  }

  getCommitteeUsers(facilityPaperID: number): Observable<any> {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getCommitteeUsers);
    data.url = data.url + "/" + facilityPaperID;
    return this.dataService.get(data);
  }

  getCustomerApplicableCovenantList(
    fpRefNumber: number,
    facilityId: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getCusApplicableCovenantList,
      );
      data.url = data.url + "/" + fpRefNumber + "/" + facilityId;
      this.dataService.get(data).subscribe(
        (res: any[]) => {
          resolve(res);
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  getWalletShare(fpId: number) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getWalletShare);
    data.url = data.url + "/" + fpId;

    return new Promise((resolve, reject) => {
      this.dataService.get(data).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
            this.onWalletShareChange.next(response);
          }
        },
        (err: any) => {
          resolve(null);
          reject(err);
        },
      );
    });
  }

  saveWalletShare(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveWalletShare, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.onWalletShareChange.next(response);
              this.alertService.showToaster(
                "Wallet Share data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            resolve(null);
            reject(err);
          },
        );
    });
  }

  getFacilityTemplateDocumentElements(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getFacilityTemplateDocumentElements, request)
        .subscribe((response: any) => {
          resolve(response);
        });
    });
  }

  saveSecurityDocument(securityDocumentData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveSecurityDocument, securityDocumentData)
        .subscribe((response: any) => {
          resolve(response);
        });
    });
  }

  getSecurityDocumentContent(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getSecurityDocumentContent, request)
        .subscribe(
          (res: any) => {
            if (typeof res === "string" && res !== null && res !== "") {
              resolve(res);
            } else {
              resolve("");
            }
          },
          (err: any) => {
            resolve("");
          },
        );
    });
  }

  getSecurityDocumentHistoryData(securityDocumentID: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign(
        {},
        SETTINGS.ENDPOINTS.getSecurityDocumentHistoryData,
      );
      data.url = data.url + "/" + securityDocumentID;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getAllCovenants(fpRefNumber: number, facilityId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getSDCovenantList);
      data.url = data.url + "/" + fpRefNumber + "/" + facilityId;
      this.dataService.get(data).subscribe(
        (res: any[]) => {
          resolve(res);
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  getDocumentTags(facilityPaperId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, SETTINGS.ENDPOINTS.getDocumentTags);
      data.url = data.url + "/" + facilityPaperId;
      this.dataService.get(data).subscribe((response: any) => {
        resolve(response);
      });
    });
  }

  getUPCByFacilityPaper(facilityPaper: any) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getUPCByFacilityPaper);
    data.url = data.url + "/" + facilityPaper.facilityPaperID;

    return new Promise((resolve, reject) => {
      this.dataService.get(data).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
            let updatedFP: any = {
              ...facilityPaper,
              fpUpcSectionDataDTOList: response !== null ? response : [],
            };
            this.onFacilityPaperChange.next(updatedFP);
            this.onFpUpcSectionChange.next(updatedFP);
          }
        },
        (err: any) => {
          resolve(null);
          reject(err);
        },
      );
    });
  }

  getDeviations() {
    return new Promise((resolve, reject) => {
      this.dataService.get(SETTINGS.ENDPOINTS.getDeviations).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
            if (response !== null && response.length > 0) {
              let selectedDeviations: any[] = response.filter(
                (d: any) => d.checked,
              );
              this.onDeviationCountChange.next(selectedDeviations.length);
            } else {
              this.onDeviationCountChange.next(0);
            }
          }
        },
        (err: any) => {
          resolve([]);
          this.onDeviationCountChange.next(0);
        },
      );
    });
  }

  getCompDeviations(facilityPaperID: any) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.getCompDeviations);
    data.url = data.url + "/" + facilityPaperID;

    return new Promise((resolve, reject) => {
      this.dataService.get(data).subscribe(
        (response: any) => {
          if (response) {
            this.updateDeviationBehaviorSubject(response);
            resolve(response);
          }
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  saveDeviations(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveDeviation, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              this.updateDeviationBehaviorSubject(response);
              resolve(response);

              this.alertService.showToaster(
                "Deviations data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurd. Please try agian later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve(null);
            reject(err);
            this.onDeviationCountChange.next(0);
          },
        );
    });
  }

  getDigitalFormApplicationContent(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getDigitalFormApplicationContent, payload)
        .subscribe(
          (res: any) => {
            if (res !== null && res.documentContent) {
              resolve(res.documentContent);
            } else {
              resolve("");
            }
          },
          (err: any) => {
            resolve("");
          },
        );
    });
  }

  saveMdAssistanceComment(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveMdAssistanceComment, payload)
        .subscribe(
          (response: any) => {
            if (response !== null) {
              this.onMDReviewCommentsChange.next(response);
              resolve(response);
              this.alertService.showToaster(
                "Comment has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              this.alertService.showToaster(
                "Failed to save comment.",
                SETTINGS.TOASTER_MESSAGES.error,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "Failed to save comment.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
          },
        );
    });
  }

  markAsViewMDComments(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.markAsViewMDComments, payload)
        .subscribe(
          (response: any) => {
            if (response !== null) {
              this.onMDReviewCommentsChange.next(response);
              resolve(response);
              this.alertService.showToaster(
                "Comment marked as read successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            } else {
              this.alertService.showToaster(
                "Unable to mark the comment as read. Please try again.",
                SETTINGS.TOASTER_MESSAGES.error,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "Unable to mark the comment as read. Please try again.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
          },
        );
    });
  }

  refreshCompDeviations(facilityPaperID: any) {
    const data = Object.assign({}, SETTINGS.ENDPOINTS.refreshCompDeviations);
    data.url = data.url + "/" + facilityPaperID;

    return new Promise((resolve, reject) => {
      this.dataService.get(data).subscribe(
        (response: any) => {
          if (response) {
            this.updateDeviationBehaviorSubject(response);
            resolve(response);
          }
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  getCustomerClassification(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.getCustomerClassification, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
            }
          },
          (err: any) => {
            resolve([]);
          },
        );
    });
  }

  saveCustomerClassification(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(SETTINGS.ENDPOINTS.saveCustomerClassification, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              resolve(response);
              this.alertService.showToaster(
                "Data has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurred. Please try again later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  getCustomerBankAccountDetails(facilityPaperID: any) {
    const data = Object.assign(
      {},
      SETTINGS.ENDPOINTS.getCustomerBankAccountDetails,
    );
    data.url = data.url + "/" + facilityPaperID;

    return new Promise((resolve, reject) => {
      this.dataService.get(data).subscribe(
        (response: any) => {
          if (response) {
            resolve(response);
          }
        },
        (err: any) => {
          resolve([]);
        },
      );
    });
  }

  updateDeviationBehaviorSubject(data: any[]) {
    if (data !== null && data.length > 0) {
      let selectedDeviations: any[] = data.filter((d: any) => d.checked);
      this.onDeviationCountChange.next(selectedDeviations.length);
    } else {
      this.onDeviationCountChange.next(0);
    }
  }

  // public saveDocument(payload): Promise<any> {
  //     return new Promise<any>((resolve, reject) => {
  //       this.dataService
  //         .post(STORAGE_SETTINGS.ENDPOINTS.saveDocument, payload)
  //         .subscribe({
  //           next: (result: any) => {
  //             if (
  //               result !== null &&
  //               result.result !== undefined &&
  //               result.result !== null
  //             ) {
  //               let response: Response | any = result.result;
  //               if (response.success) {
  //                 this.alertService.showToaster(
  //                   "Data has been saved successfully.",
  //                   SETTINGS.TOASTER_MESSAGES.success,
  //                 );
  //                 resolve(response.response);
  //               } else {
  //                 this.alertService.showToaster(
  //                   "Failed to save data.",
  //                   SETTINGS.TOASTER_MESSAGES.error,
  //                 );
  //                 resolve(null);
  //               }
  //             } else {
  //               this.alertService.showToaster(
  //                 "Failed to save data.",
  //                 SETTINGS.TOASTER_MESSAGES.error,
  //               );
  //               resolve(null);
  //             }
  //           },
  //           error: (err: any) => {
  //             let error: Error = new Error(err);
  //             resolve(null);
  //             this.alertService.showToaster(
  //               "An error occurred. Please try again later.",
  //               SETTINGS.TOASTER_MESSAGES.error,
  //             );
  //           },
  //         });
  //     });
  //   }

  saveDocument(payload: any) {
    return new Promise((resolve, reject) => {
      console.log("[saveDocument] Payload:", payload);
      this.dataService
        .post(STORAGE_SETTINGS.ENDPOINTS.saveDocument, payload)
        .subscribe(
          (response: any) => {
            console.log("[saveDocument] Raw response:", response);
            if (response) {
              resolve(response);
              this.alertService.showToaster(
                "Document has been saved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurred. Please try again later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  getTempWithFpDocument(payload: any) {
    return new Promise((resolve, reject) => {
      this.dataService
        .post(STORAGE_SETTINGS.ENDPOINTS.getTempWithFpDocument, payload)
        .subscribe(
          (response: any) => {
            if (response) {
              console.log("response", response);

              resolve(response);
              this.alertService.showToaster(
                "Data has been retrieved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurred. Please try again later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  getFPDocumentById(payload: any) {
    return new Promise((resolve, reject) => {
      console.log("[getFPDocumentById] Payload:", payload);
      this.dataService
        .post(STORAGE_SETTINGS.ENDPOINTS.getFPDocumentById, payload)
        .subscribe(
          (response: any) => {
            console.log("[getFPDocumentById] Raw response:", response);
            if (response) {
              resolve(response);
              this.alertService.showToaster(
                "Data has been retrieved successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurred. Please try again later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  deactivateFPDocument(payload: any) {
    return new Promise((resolve, reject) => {
      console.log("[deactivateFPDocument] Payload:", payload);
      this.dataService
        .post(STORAGE_SETTINGS.ENDPOINTS.deactivateFPDocument, payload)
        .subscribe(
          (response: any) => {
            console.log("[deactivateFPDocument] Raw response:", response);
            if (response) {
              resolve(response);
              this.alertService.showToaster(
                "Document has been deactivated successfully.",
                SETTINGS.TOASTER_MESSAGES.success,
              );
            }
          },
          (err: any) => {
            this.alertService.showToaster(
              "An error occurred. Please try again later.",
              SETTINGS.TOASTER_MESSAGES.error,
            );
            resolve([]);
          },
        );
    });
  }

  downloadFPDocument(fpDocumentId: number) {
    const conf = Object.assign(
      {},
      STORAGE_SETTINGS.ENDPOINTS.downloadFPDocument,
    );

    conf.url = `${conf.url}/${fpDocumentId}`;

    return this.dataService.getBlob(conf);
  }

  // downloadFPPostDocument(fpDocumentId: number) {
  //   return new Promise((resolve, reject) => {
  //     const data = Object.assign({}, STORAGE_SETTINGS.ENDPOINTS.downloadFPDocument);
  //     data.url = data.url + "/" + fpDocumentId;
  //     console.log("Download URL:", data.url);

  //     this.dataService.get(data).subscribe((response: any) => {
  //       console.log("dataaaaaaaaaaaaaa", response);

  //       this.onDownloadLinkChage.next({
  //         data: response,
  //         //fileName: docStorage.fileName,
  //       });
  //       resolve(response);
  //     }, reject);
  //   });
  // }
}
