import {
  Component,
  ElementRef,
  Input,
  OnChanges,
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
import { AlertService } from "src/app/core/service/common/alert.service";
import { FPDocService } from "src/app/services/fp-doc.service";
import {
  DocStorageDTO,
  DasDocumentRequestDTO,
  FPDocAuthDTO,
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from "src/app/models/fp-doc.model";

/** Accepts several backend / BFF envelope shapes and yields raw list items to map. */
function extractRawAttachmentList(data: unknown): unknown[] {
  if (data == null) {
    return [];
  }
  let cur: unknown = data;
  if (typeof cur === "object" && cur !== null && "result" in cur) {
    const inner = (cur as { result: unknown }).result;
    if (inner != null) {
      cur = inner;
    }
  }
  if (Array.isArray(cur)) {
    return cur;
  }
  if (typeof cur !== "object" || cur === null) {
    return [];
  }
  const o = cur as { response?: unknown };
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
export class FpPostApprovalAttachmentComponent implements OnInit, OnChanges {
  modalRef: MDBModalRef;
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
    private fpDocService: FPDocService
  ) {}

  ngOnInit() {}

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
          this.normalizeAuthWithDocument(item)
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

  openModalAttachmentUpload(facilityPaper: unknown) {
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
          content: { facilityPaper },
        },
      }
    );
  }

  private isErrorEnvelope(
    data: unknown
  ): data is { success: false; message?: string } {
    if (data == null || typeof data !== "object") {
      return false;
    }
    let cur: unknown = data;
    if ("result" in data) {
      const inner = (data as { result: unknown }).result;
      if (inner != null && typeof inner === "object") {
        cur = inner;
      }
    }
    return (cur as { success?: unknown }).success === false;
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
    return (
      this.facilityPaper.currentAssignUserID ==
      this.applicationService.getLoggedInUserUserID()
    );
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
    return this.facilityPaper.currentAssignUser === "EAC";
  }

  isAC() {
    return this.facilityPaper.currentAssignUser === "AC";
  }

  checkUploadAttachmentPrivilege() {
    return true;
  }

  isUploadedDiv(data: FPDocumentDTO) {
    return (
      this.applicationService.getLoggedInUserDivCode() == data.uploadedDivCode
    );
  }

  /**
   * Preview (e.g. PDF): same {@link FPDocService.getFPDocumentById} response, open in new tab.
   */
  onDownloadDoc(item: FPDocAuthWithDocumentDTO): void {
    const doc = item.fpDocument;
    if (!doc || doc.fpDocumentID == null) {
      return;
    }
    const payload = this.buildDasDocumentRequest(doc);
    this.fpDocService
      .getFPDocumentById(payload)
      .then((raw: unknown) => {
        const parsed = this.readStandardPayload<FPDocumentDTO>(raw);
        if (!parsed.ok) {
          this.alertService.showToaster(
            parsed.message || "Could not load document",
            SETTINGS.TOASTER_MESSAGES.error
          );
          return;
        }
        const extracted = this.extractBase64FromFpdocument(parsed.value);
        if (!extracted.b64) {
          this.alertService.showToaster(
            "No file bytes in response",
            SETTINGS.TOASTER_MESSAGES.error
          );
          return;
        }
        const mime =
          extracted.mime && extracted.mime !== "application/octet-stream"
            ? extracted.mime
            : "application/pdf";
        window.open("data:" + mime + ";base64," + extracted.b64, "_blank");
      })
      .catch(() => {
        this.alertService.showToaster(
          "Request failed",
          SETTINGS.TOASTER_MESSAGES.error
        );
      });
  }

  /**
   * Primary path: {@link FPDocService.getFPDocumentById} (HTTP → cas-storage DocumentController).
   * Avoids `documentId: null` in JSON; only sends `documentId` when `documentReference` is set.
   */
  downloadDocument(item: FPDocAuthWithDocumentDTO): void {
    const doc = item.fpDocument;
    if (!doc || doc.fpDocumentID == null) {
      this.alertService.showToaster(
        "Missing document reference",
        SETTINGS.TOASTER_MESSAGES.error
      );
      return;
    }

    const payload = this.buildDasDocumentRequest(doc);

    this.fpDocService
      .getFPDocumentById(payload)
      .then((raw: unknown) => {
        const parsed = this.readStandardPayload<FPDocumentDTO>(raw);
        if (!parsed.ok) {
          this.alertService.showToaster(
            parsed.message || "Could not load document",
            SETTINGS.TOASTER_MESSAGES.error
          );
          return;
        }
        const fp = parsed.value;
        const extracted = this.extractBase64FromFpdocument(fp);
        if (!extracted.b64) {
          this.alertService.showToaster(
            "No file bytes in response",
            SETTINGS.TOASTER_MESSAGES.error
          );
          return;
        }
        const fileName =
          (fp.docStorageDTO && fp.docStorageDTO.fileName) ||
          doc.documentName ||
          "attachment";
        this.saveBase64AsFile(fileName, extracted.b64, extracted.mime);
        this.alertService.showToaster(
          "Document downloaded successfully",
          SETTINGS.TOASTER_MESSAGES.success
        );
      })
      .catch(() => {
        this.alertService.showToaster(
          "Request failed",
          SETTINGS.TOASTER_MESSAGES.error
        );
      });
  }

  /** Matches Postman: include `documentId: null` when there is no DAS reference */
  private buildDasDocumentRequest(doc: FPDocumentDTO): DasDocumentRequestDTO {
    const ref =
      doc.documentReference != null ? String(doc.documentReference).trim() : "";
    return {
      fpDocumentID: doc.fpDocumentID as number,
      caseId: doc.caseId,
      documentId: ref !== "" ? ref : null,
    };
  }

  private peelCorporateEnvelope(body: unknown): unknown {
    if (body != null && typeof body === "object" && "result" in body) {
      const inner = (body as { result: unknown }).result;
      if (inner != null) {
        return inner;
      }
    }
    return body;
  }

  private readStandardPayload<T>(
    raw: unknown
  ): { ok: true; value: T } | { ok: false; message: string } {
    const body = this.peelCorporateEnvelope(raw);
    if (body == null || typeof body !== "object") {
      return { ok: false, message: "Invalid response" };
    }
    const s = body as StandardResponse<T>;
    if (s.success === false) {
      return { ok: false, message: s.message || "Error" };
    }
    const payload =
      s.response !== undefined && s.response !== null ? s.response : s.data;
    if (payload == null) {
      return { ok: false, message: s.message || "Empty response" };
    }
    return { ok: true, value: payload as T };
  }

  private extractBase64FromFpdocument(fp: FPDocumentDTO): { b64?: string; mime: string } {
    let mime = "application/octet-stream";
    const das = fp.dasDocumentDTO;
    if (das && (das.base64Str || das.base64StrOrig)) {
      if (das.contentType) {
        mime = das.contentType;
      }
      return { b64: das.base64Str || das.base64StrOrig, mime };
    }
    const ds: DocStorageDTO | undefined = fp.docStorageDTO;
    if (ds) {
      const b64 =
        (typeof ds.document === "string" && ds.document) ||
        (typeof ds.dasDocument === "string" && ds.dasDocument);
      if (b64) {
        const ft = ds.fileType;
        if (ft && ft.indexOf("/") !== -1) {
          mime = ft;
        } else if (ft && /^pdf$/i.test(String(ft).trim())) {
          mime = "application/pdf";
        }
        return { b64, mime };
      }
    }
    return { mime };
  }

  private saveBase64AsFile(
    fileName: string,
    base64: string,
    mime: string
  ): void {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mime || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = this.downloadLink && this.downloadLink.nativeElement;
    if (a) {
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
