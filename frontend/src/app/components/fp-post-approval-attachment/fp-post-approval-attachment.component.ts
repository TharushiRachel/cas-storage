import {
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MDBModalRef, MDBModalService } from "ng-uikit-pro-standard";
import { FpPostApprovalAttachementUploadComponent } from "./fp-post-approval-attachement-upload/fp-post-approval-attachement-upload.component";
import { SETTINGS } from "src/app/core/setting/commons.settings";
import { ApplicationService } from "src/app/core/service/application/application.service";
import { Constants } from "src/app/core/setting/constants";
import { FacilityPaperAddEditService } from "src/app/views/pages/facility-paper/services/facility-paper-add-edit.service";
import {
  DasDocumentRequestDTO,
  DocStorageDTO,
  FPDocAuthDTO,
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from "src/app/views/pages/facility-paper/dto/fp-doc-model-dto";
import { AlertService } from "src/app/core/service/common/alert.service";
import { ConfirmationDialogComponent } from "src/app/shared/components/confirmation-dialog/confirmation-dialog.component";
import * as _ from "lodash";
import { HttpClient } from "@angular/common/http";

/** Accepts several backend envelope shapes and yields raw list items to map. */
function extractRawAttachmentList(data: unknown): unknown[] {
  if (data == null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data !== "object") {
    return [];
  }
  const o = data as { response?: unknown; success?: unknown };
  if (Array.isArray(o.response)) {
    return o.response;
  }
  return [];
}

@Component({
  selector: "app-fp-post-approval-attachment",
  templateUrl: "./fp-post-approval-attachment.component.html",
  styleUrls: ["./fp-post-approval-attachment.component.scss"],
})
export class FpPostApprovalAttachmentComponent implements OnInit {
  modalRef!: MDBModalRef;
  @Input("facilityPaper") facilityPaper: any = {};
  masterDataPrivilege = SETTINGS.PRIVILEGES;
  facilityPaperStatusConst = Constants.facilityPaperStatusConst;
  fpAuthWithDocuments: FPDocAuthWithDocumentDTO[] = [];
  loadingList = false;
  @ViewChild("downloadLink", { static: false })
  private downloadLink!: ElementRef;

  constructor(
    private mdbModalService: MDBModalService,
    private applicationService: ApplicationService,
    private facilityPaperAddEditService: FacilityPaperAddEditService,
    private alertService: AlertService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    console.log("facility paper object", this.facilityPaper);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["facilityPaper"]) {
      this.loadPostApprovalAttachments();
    }
  }

  loadPostApprovalAttachments(): void {
    const facilityPaperId =
      this.facilityPaper && this.facilityPaper.facilityPaperID != null
        ? this.facilityPaper.facilityPaperID
        : undefined;
    if (facilityPaperId == null) {
      this.fpAuthWithDocuments = [];
      return;
    }

    this.loadingList = true;
    const payload = { facilityPaperID: facilityPaperId, docStatus: "POST" };

    this.facilityPaperAddEditService
      .getTempWithFpDocument(payload as any)
      .then((data: unknown) => {
        if (this.isErrorEnvelope(data)) {
          const msg =
            typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : "Unknown error";
          console.error("getTempWithFpDocument:", msg);
          this.fpAuthWithDocuments = [];
          return;
        }
        const raw = extractRawAttachmentList(data);
        this.fpAuthWithDocuments = raw.map((item) =>
          this.normalizeAuthWithDocument(item),
        );
      })
      .catch((err: unknown) => {
        console.error("getTempWithFpDocument", err);
        this.fpAuthWithDocuments = [];
      })
      .then(() => {
        this.loadingList = false;
      });
  }

  openModalAttachmentUpload(facilityPaper: any) {
    const initialState = {
      list: [{ tag: "Count", value: facilityPaper }],
    };

    this.modalRef = this.mdbModalService.show(
      FpPostApprovalAttachementUploadComponent,
      {
        initialState,
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: true,
        class: "modal-width-60-p audit-modal-margin-center",
        containerClass: "right",
        animated: false,
        data: {
          heading: "comming dto",
          content: { facilityPaper: facilityPaper },
        },
      },
    );
  }

  private isErrorEnvelope(
    data: unknown,
  ): data is { success: false; message?: string } {
    if (data == null || typeof data !== "object") {
      return false;
    }
    return (data as { success?: unknown }).success === false;
  }

  private normalizeAuthWithDocument(item: unknown): FPDocAuthWithDocumentDTO {
    const row = item as {
      authRecord?: FPDocAuthDTO;
      fpDocument?: FPDocumentDTO;
    };
    if (row && row.fpDocument != null) {
      return {
        authRecord: row.authRecord != null ? row.authRecord : {},
        fpDocument: row.fpDocument,
      };
    }
    return {
      authRecord: {},
      fpDocument: item as FPDocumentDTO,
    };
  }

  isCheckedPdf(item: FPDocAuthWithDocumentDTO): boolean {
    const doc = item && item.fpDocument;
    if (!doc) {
      return false;
    }
    const st = doc.docStorageDTO;
    if (st && st.fileName) {
      return this.fileNameIndicatesPdf(st.fileName);
    }
    if (doc.documentReference) {
      return this.fileNameIndicatesPdf(doc.documentReference);
    }
    if (st && st.fileType) {
      const ft = String(st.fileType).toLowerCase();
      if (ft === "pdf" || ft === "application/pdf" || ft.endsWith("/pdf")) {
        return true;
      }
    }
    if (doc.documentName) {
      return this.fileNameIndicatesPdf(doc.documentName);
    }
    return false;
  }

  private fileNameIndicatesPdf(name: string): boolean {
    const last = name.lastIndexOf(".");
    if (last < 0 || last >= name.length - 1) {
      return false;
    }
    return name.slice(last).toLowerCase() === ".pdf";
  }

  isEqualLoginAndAssignUser() {
    if (
      this.facilityPaper.currentAssignUserID ==
      this.applicationService.getLoggedInUserUserID()
    ) {
      return true;
    } else {
      return false;
    }
  }

  isApproveStatus() {
    return (
      this.facilityPaper.currentFacilityPaperStatus ==
      this.facilityPaperStatusConst.APPROVED
    );
  }

  isRejected() {
    return (
      this.facilityPaper.currentFacilityPaperStatus ==
      this.facilityPaperStatusConst.REJECTED
    );
  }

  isEAC() {
    return this.facilityPaper.currentAssignUser == "EAC";
  }

  isAC() {
    return this.facilityPaper.currentAssignUser == "AC";
  }

  checkUploadAttachmentPrivilege() {
    return true;
    // if (this.isApproveStatus() && this.isEAC() || this.isAC() && this.isApproveStatus()) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  isUploadedDiv(data: any) {
    return (
      this.applicationService.getLoggedInUserDivCode() == data.uploadedDivCode
    );
  }

  downloadDocument(item: any) {

    let fpDocumentId = null;

    if (item && item.fpDocument && item.fpDocument.fpDocumentID) {
      fpDocumentId = item.fpDocument.fpDocumentID;
    }

    if (!fpDocumentId) {
      this.alertService.showToaster(
        "Document ID not found",
        SETTINGS.TOASTER_MESSAGES.error,
      );

      return;
    }
    this.loadingList = true;
    this.facilityPaperAddEditService.downloadFPDocument(fpDocumentId).subscribe(
      (response: any) => {
        const blob = response.body;
        let fileName = "downloaded_file.pdf";
        const contentDisposition = response.headers.get("content-disposition");
        if (contentDisposition) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            fileName = matches[1];
          }
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.alertService.showToaster(
          "Document downloaded successfully",
          SETTINGS.TOASTER_MESSAGES.success,
        );
        this.loadingList = false;
      },
      (error: any) => {
        console.error("Download failed", error);
        this.alertService.showToaster(
          "Failed to download document",
          SETTINGS.TOASTER_MESSAGES.error,
        );
        this.loadingList = false;
      },
    );
  }

  remove(item: any) {
    if (!_.isEmpty(item)) {
      let data = Object.assign(
        {},
        { fpDocumentID: item.fpDocument.fpDocumentID },
      );

      this.modalRef = this.mdbModalService.show(ConfirmationDialogComponent, {
        backdrop: true,
        keyboard: true,
        focus: true,
        show: false,
        ignoreBackdropClick: true,
        class: "modal-width-30-p modal-margin-center ",
        containerClass: "",
        animated: true,
        data: {
          heading: "Confirm Remove Document",
          message: "Do you want to remove this document ?",
        },
      });
      this.modalRef.content.action.subscribe((isYes: any) => {
        if (isYes) {
          this.facilityPaperAddEditService.deactivateFPDocument(data);
        }
      });
    }
  }
}
