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
  DocStorageDTO,
  DasDocumentDTO,
  FPDocAuthDTO,
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from 'src/app/models/fp-doc.model';

/** Accepts several backend / BFF envelope shapes and yields raw list items to map. */
function extractRawAttachmentList(data: unknown): unknown[] {
  if (data == null) {
    return [];
  }
  let cur: unknown = data;
  if (typeof cur === 'object' && cur !== null && 'result' in cur) {
    const inner = (cur as { result: unknown }).result;
    if (inner != null) {
      cur = inner;
    }
  }
  if (Array.isArray(cur)) {
    return cur;
  }
  if (typeof cur !== 'object' || cur === null) {
    return [];
  }
  const o = cur as { response?: unknown };
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

  @ViewChild('downloadLink', { static: false }) private downloadLink!: ElementRef;

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
    let cur: unknown = data;
    if ('result' in data) {
      const inner = (data as { result: unknown }).result;
      if (inner != null && typeof inner === 'object') {
        cur = inner;
      }
    }
    return (cur as { success?: unknown }).success === false;
  }

  private fetchDocumentAndDispatch(
    item: FPDocAuthWithDocumentDTO,
    mode: 'preview' | 'download'
  ): void {
    const dto = item.fpDocument;
    if (!dto || dto.fpDocumentID == null) {
      return;
    }

    const dasBody = {
      fpDocumentID: dto.fpDocumentID,
      caseId: dto.caseId,
      documentId: dto.documentReference,
    };

    const ref =
      dto.documentReference != null
        ? String(dto.documentReference).trim()
        : '';
    const storageId = this.resolveDocStorageNumericId(dto);

    const onHttpFail = () =>
      console.error(
        'Document download: HTTP error — if Postman works, increase BFF max response size / timeout.'
      );

    // DAS-linked file: smallest JSON payload
    if (ref !== '' && dto.caseId) {
      this.fpDocService.getDocumentById(dasBody).subscribe(
        (raw: unknown) => this.handleDasDownloadResponse(raw, mode, dto),
        onHttpFail
      );
      return;
    }

    // CAS DB file only (no external doc ref)
    if (storageId != null) {
      this.fpDocService.getDocumentStorageByDocStorageID(storageId).subscribe(
        (raw: unknown) => this.handleDocStorageDownloadResponse(raw, mode, dto),
        onHttpFail
      );
      return;
    }

    this.fpDocService.getFPDocumentById(dasBody).subscribe(
      (raw: unknown) => this.handleFpDocumentBundleResponse(raw, mode, dto),
      onHttpFail
    );
  }

  /** `{ status, appsErrorMessages, result: { success, message, response } }` from gateways */
  private peelCorporateEnvelope(body: unknown): unknown {
    if (body != null && typeof body === 'object' && 'result' in body) {
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
    if (body == null || typeof body !== 'object') {
      return { ok: false, message: 'Empty or invalid response' };
    }
    const s = body as StandardResponse<T>;
    if (s.success === false) {
      return { ok: false, message: s.message || 'Error' };
    }
    const payload =
      s.response !== undefined && s.response !== null ? s.response : s.data;
    if (payload == null) {
      return { ok: false, message: s.message || 'No document payload in response' };
    }
    return { ok: true, value: payload as T };
  }

  private resolveDocStorageNumericId(dto: FPDocumentDTO): number | null {
    const nested = dto.docStorageDTO && dto.docStorageDTO.docStorageID;
    if (nested != null && !isNaN(Number(nested))) {
      return Number(nested);
    }
    if (dto.docStorageID != null && dto.docStorageID !== '') {
      const n = Number(dto.docStorageID);
      return isNaN(n) ? null : n;
    }
    return null;
  }

  private handleDasDownloadResponse(
    raw: unknown,
    mode: 'preview' | 'download',
    dto: FPDocumentDTO
  ): void {
    const r = this.readStandardPayload<DasDocumentDTO>(raw);
    if (!r.ok) {
      console.error('getDocumentById:', r.message);
      return;
    }
    const das = r.value;
    const b64 = das.base64Str || das.base64StrOrig;
    const mime =
      das.contentType ||
      (mode === 'preview' ? 'application/pdf' : 'application/octet-stream');
    this.dispatchBase64Payload(b64, mime, mode, dto, null);
  }

  private handleDocStorageDownloadResponse(
    raw: unknown,
    mode: 'preview' | 'download',
    dto: FPDocumentDTO
  ): void {
    const r = this.readStandardPayload<DocStorageDTO>(raw);
    if (!r.ok) {
      console.error('getDocumentStorageByDocStorageID:', r.message);
      return;
    }
    const ds = r.value;
    const b64 =
      (typeof ds.document === 'string' && ds.document) ||
      (typeof ds.dasDocument === 'string' && ds.dasDocument);
    let mime = 'application/octet-stream';
    const ft = ds.fileType;
    if (ft && ft.indexOf('/') !== -1) {
      mime = ft;
    } else if (ft && /^pdf$/i.test(String(ft).trim())) {
      mime = 'application/pdf';
    } else if (mode === 'preview') {
      mime = 'application/pdf';
    }
    this.dispatchBase64Payload(b64, mime, mode, dto, ds);
  }

  private handleFpDocumentBundleResponse(
    raw: unknown,
    mode: 'preview' | 'download',
    dto: FPDocumentDTO
  ): void {
    const r = this.readStandardPayload<FPDocumentDTO>(raw);
    if (!r.ok) {
      console.error('getFPDocumentById:', r.message);
      return;
    }
    const fp = r.value;

    let b64: string | undefined;
    let mime = 'application/octet-stream';

    const das = fp.dasDocumentDTO;
    if (das && (das.base64Str || das.base64StrOrig)) {
      b64 = das.base64Str || das.base64StrOrig;
      if (das.contentType) {
        mime = das.contentType;
      }
    } else {
      const ds = fp.docStorageDTO;
      const stored = ds && ds.document;
      if (typeof stored === 'string' && stored.length > 0) {
        b64 = stored;
        const ft = ds.fileType;
        if (ft && ft.indexOf('/') !== -1) {
          mime = ft;
        } else if (ft && /^pdf$/i.test(String(ft).trim())) {
          mime = 'application/pdf';
        }
      }
    }

    const defaultMime =
      mode === 'preview' ? 'application/pdf' : 'application/octet-stream';
    if (!mime || mime === 'application/octet-stream') {
      mime = defaultMime;
    }
    this.dispatchBase64Payload(b64, mime, mode, dto, fp.docStorageDTO || null);
  }

  private dispatchBase64Payload(
    b64: string | undefined,
    mime: string,
    mode: 'preview' | 'download',
    dto: FPDocumentDTO,
    storageMeta: DocStorageDTO | null
  ): void {
    if (!b64) {
      console.error(
        'Document download: envelope OK but missing base64 (check integration / CAS row).'
      );
      return;
    }
    if (mode === 'preview') {
      window.open('data:' + mime + ';base64,' + b64, '_blank');
    } else {
      const name =
        (storageMeta && storageMeta.fileName) || dto.documentName || 'attachment';
      this.saveBase64AsFile(name, b64, mime);
    }
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
