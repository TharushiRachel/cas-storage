import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MDBModalRef, MDBModalService } from 'ng-uikit-pro-standard';
import { FpPostApprovalAttachementUploadComponent } from './fp-post-approval-attachement-upload/fp-post-approval-attachement-upload.component';
import { SETTINGS } from 'src/app/core/setting/commons.settings';
import { ApplicationService } from 'src/app/core/service/application/application.service';
import { Constants } from 'src/app/core/setting/constants';
import { FacilityPaperAddEditService } from 'src/app/views/pages/facility-paper/services/facility-paper-add-edit.service';
import { FPDocService } from 'src/app/services/fp-doc.service';
import {
  FPDocAuthDTO,
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from 'src/app/models/fp-doc.model';

/** Accepts several backend envelope shapes and yields raw list items to map. */
function extractRawAttachmentList(data: unknown): unknown[] {
  if (data == null) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data !== 'object') {
    return [];
  }
  const o = data as { response?: unknown; success?: unknown };
  if (Array.isArray(o.response)) {
    return o.response;
  }
  return [];
}

@Component({
  selector: 'app-fp-post-approval-attachment',
  templateUrl: './fp-post-approval-attachment.component.html',
  styleUrls: ['./fp-post-approval-attachment.component.scss']
})
export class FpPostApprovalAttachmentComponent implements OnChanges {

  modalRef: MDBModalRef;
  @Input('facilityPaper') facilityPaper: any = {};
  masterDataPrivilege = SETTINGS.PRIVILEGES;
  facilityPaperStatusConst = Constants.facilityPaperStatusConst;

  /** Temp FP doc auth rows with linked FP document (post-approval / POST status). */
  fpAuthWithDocuments: FPDocAuthWithDocumentDTO[] = [];
  loadingList = false;

  @ViewChild('downloadLink') downloadLink?: ElementRef<HTMLAnchorElement>;

  constructor(
    private mdbModalService: MDBModalService,
    private applicationService: ApplicationService,
    private facilityPaperAddEditService: FacilityPaperAddEditService,
    private fpDocService: FPDocService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facilityPaper']) {
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
    const payload = { facilityPaperID: facilityPaperId, docStatus: 'POST' };

    this.facilityPaperAddEditService
      .getTempWithFpDocument(payload as any)
      .then((data: unknown) => {
        if (this.isErrorEnvelope(data)) {
          const msg =
            typeof (data as { message?: unknown }).message === 'string'
              ? (data as { message: string }).message
              : 'Unknown error';
          console.error('getTempWithFpDocument:', msg);
          this.fpAuthWithDocuments = [];
          return;
        }
        const raw = extractRawAttachmentList(data);
        this.fpAuthWithDocuments = raw.map((item) =>
          this.normalizeAuthWithDocument(item)
        );
      })
      .catch((err: unknown) => {
        console.error('getTempWithFpDocument', err);
        this.fpAuthWithDocuments = [];
      })
      .then(() => {
        this.loadingList = false;
      });
  }

  openModalAttachmentUpload(facilityPaper: unknown): void {
    const initialState = {
      list: [{ tag: 'Count', value: facilityPaper }],
    };

    this.modalRef = this.mdbModalService.show(FpPostApprovalAttachementUploadComponent, {
      initialState,
      backdrop: true,
      keyboard: true,
      focus: true,
      show: false,
      ignoreBackdropClick: true,
      class: 'modal-width-60-p audit-modal-margin-center',
      containerClass: 'right',
      animated: false,
      data: {
        heading: 'comming dto',
        content: { facilityPaper },
      },
    });

    const refAny = this.modalRef as { onHide?: { subscribe: (fn: () => void) => void } };
    if (refAny.onHide && refAny.onHide.subscribe) {
      refAny.onHide.subscribe(() => this.loadPostApprovalAttachments());
    }
  }

  isEqualLoginAndAssignUser(): boolean {
    return (
      this.facilityPaper.currentAssignUserID ==
      this.applicationService.getLoggedInUserUserID()
    );
  }

  isApproveStatus(): boolean {
    return (
      this.facilityPaper.currentFacilityPaperStatus ==
      this.facilityPaperStatusConst.APPROVED
    );
  }

  isRejected(): boolean {
    return (
      this.facilityPaper.currentFacilityPaperStatus ==
      this.facilityPaperStatusConst.REJECTED
    );
  }

  isEAC(): boolean {
    return this.facilityPaper.currentAssignUser === 'EAC';
  }

  isAC(): boolean {
    return this.facilityPaper.currentAssignUser === 'AC';
  }

  checkUploadAttachmentPrivilege(): boolean {
    return (
      this.isApproveStatus() &&
      (this.isEAC() || this.isAC())
    );
  }

  isCheckedPdf(item: FPDocAuthWithDocumentDTO): boolean {
    const doc = item.fpDocument;
    const raw =
      doc && doc.documentName != null ? String(doc.documentName).toLowerCase() : '';
    return raw.length > 0 && raw.endsWith('.pdf');
  }

  isUploadedDiv(item: FPDocAuthWithDocumentDTO): boolean {
    const doc = item.fpDocument;
    const div = doc ? doc.uploadedDivCode : undefined;
    const mine = this.applicationService.getLoggedInUserDivCode();
    return div != null && mine != null && String(div) === String(mine);
  }

  onDownloadDoc(item: FPDocAuthWithDocumentDTO): void {
    this.fetchDocumentAndDispatch(item, 'preview');
  }

  downloadDocument(item: FPDocAuthWithDocumentDTO): void {
    this.fetchDocumentAndDispatch(item, 'download');
  }

  remove(_item: FPDocAuthWithDocumentDTO): void {
    // No delete endpoint on cas-storage DocumentController; hook when available.
  }

  /**
   * API: `{ success, message, response: [{ authRecord, fpDocument }, ...] }`.
   * Legacy: flat {@link FPDocumentDTO} per row — wrapped with an empty auth record.
   */
  private normalizeAuthWithDocument(item: unknown): FPDocAuthWithDocumentDTO {
    const row = item as { authRecord?: FPDocAuthDTO; fpDocument?: FPDocumentDTO };
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

  private isErrorEnvelope(data: unknown): data is { success: false; message?: string } {
    if (data == null || typeof data !== 'object') {
      return false;
    }
    return (data as { success?: unknown }).success === false;
  }

  private fetchDocumentAndDispatch(
    item: FPDocAuthWithDocumentDTO,
    mode: 'preview' | 'download'
  ): void {
    const dto = item.fpDocument;
    if (!dto || dto.fpDocumentID == null) {
      return;
    }

    this.fpDocService
      .getFPDocumentById({
        fpDocumentID: dto.fpDocumentID,
        caseId: dto.caseId,
        documentId: dto.documentReference,
      })
      .subscribe((res: StandardResponse<FPDocumentDTO>) => {
        const fp = this.unwrapFPDocumentResponse(res);
        if (!fp || !fp.dasDocumentDTO) {
          return;
        }
        const das = fp.dasDocumentDTO;
        const b64 = das.base64Str || das.base64StrOrig;
        if (!b64) {
          return;
        }
        const defaultMime =
          mode === 'preview' ? 'application/pdf' : 'application/octet-stream';
        const mime = das.contentType || defaultMime;

        if (mode === 'preview') {
          window.open('data:' + mime + ';base64,' + b64, '_blank');
        } else {
          const name = dto.documentName || 'attachment';
          this.saveBase64AsFile(name, b64, mime);
        }
      });
  }

  private unwrapFPDocumentResponse(
    res: StandardResponse<FPDocumentDTO>
  ): FPDocumentDTO | undefined {
    const anyRes = res as StandardResponse<FPDocumentDTO> & { data?: FPDocumentDTO };
    if (anyRes.response != null) {
      return anyRes.response;
    }
    return anyRes.data;
  }

  private saveBase64AsFile(fileName: string, base64: string, mime: string): void {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mime || 'application/octet-stream' });
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
