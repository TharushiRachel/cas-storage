import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
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
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from 'src/app/models/fp-doc.model';

@Component({
  selector: 'app-fp-post-approval-attachment',
  templateUrl: './fp-post-approval-attachment.component.html',
  styleUrls: ['./fp-post-approval-attachment.component.scss']
})
export class FpPostApprovalAttachmentComponent implements OnInit, OnChanges {

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
  ) { }

  ngOnInit() {
    console.log('facility paper object', this.facilityPaper);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['facilityPaper']) {
      this.loadPostApprovalAttachments();
    }
  }

  loadPostApprovalAttachments(): void {
    const id = this.facilityPaper?.facilityPaperID;
    if (id == null) {
      this.fpAuthWithDocuments = [];
      return;
    }
    this.loadingList = true;
    /** BFF body for STORAGE_SETTINGS.ENDPOINTS.getTempWithFpDocument — align with your gateway DTO */
    const payload = {
      facilityPaperId: id,
      docStatus: 'POST',
    };
    void this.facilityPaperAddEditService
      .getTempWithFpDocument(payload as any)
      .then((data: FPDocAuthWithDocumentDTO[] | null) => {
        this.loadingList = false;
        this.fpAuthWithDocuments = Array.isArray(data) ? data : [];
      })
      .catch(() => {
        this.loadingList = false;
        this.fpAuthWithDocuments = [];
      });
  }

  openModalAttachmentUpload(facilityPaper: unknown) {
    const initialState = {
      list: [
        { tag: 'Count', value: facilityPaper }
      ]
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
      }
    });

    const refAny = this.modalRef as any;
    if (refAny?.onHide?.subscribe) {
      refAny.onHide.subscribe(() => this.loadPostApprovalAttachments());
    }
  }

  isEqualLoginAndAssignUser() {
    if (this.facilityPaper.currentAssignUserID == this.applicationService.getLoggedInUserUserID()) {
      return true;
    } else {
      return false;
    }
  }

  isApproveStatus() {
    return this.facilityPaper.currentFacilityPaperStatus == this.facilityPaperStatusConst.APPROVED;
  }

  isRejected() {
    return this.facilityPaper.currentFacilityPaperStatus == this.facilityPaperStatusConst.REJECTED;
  }

  isEAC() {
    return this.facilityPaper.currentAssignUser == 'EAC';
  }

  isAC() {
    return this.facilityPaper.currentAssignUser == 'AC';
  }

  checkUploadAttachmentPrivilege() {
    if (this.isApproveStatus() && this.isEAC() || this.isAC() && this.isApproveStatus()) {
      return true;
    } else {
      return false;
    }
  }

  isCheckedPdf(item: FPDocAuthWithDocumentDTO): boolean {
    const name = item.fpDocument?.documentName?.toLowerCase() ?? '';
    return name.endsWith('.pdf');
  }

  isUploadedDiv(item: FPDocAuthWithDocumentDTO): boolean {
    const div = item.fpDocument?.uploadedDivCode;
    const mine = this.applicationService.getLoggedInUserDivCode();
    return div != null && mine != null && String(div) === String(mine);
  }

  onDownloadDoc(item: FPDocAuthWithDocumentDTO): void {
    const dto = item.fpDocument;
    if (!dto?.fpDocumentID) {
      return;
    }
    this.fpDocService
      .getFPDocumentById({
        fpDocumentID: dto.fpDocumentID,
        caseId: dto.caseId,
        documentId: dto.documentReference,
      })
      .subscribe({
        next: (res: StandardResponse<FPDocumentDTO>) => {
          const fp = this.unwrapFPDocumentResponse(res);
          const das = fp?.dasDocumentDTO;
          const b64 = das?.base64Str ?? das?.base64StrOrig;
          const mime = das?.contentType || 'application/pdf';
          if (b64) {
            window.open(`data:${mime};base64,${b64}`, '_blank');
          }
        },
      });
  }

  downloadDocument(item: FPDocAuthWithDocumentDTO): void {
    const dto = item.fpDocument;
    if (!dto?.fpDocumentID) {
      return;
    }
    this.fpDocService
      .getFPDocumentById({
        fpDocumentID: dto.fpDocumentID,
        caseId: dto.caseId,
        documentId: dto.documentReference,
      })
      .subscribe({
        next: (res: StandardResponse<FPDocumentDTO>) => {
          const fp = this.unwrapFPDocumentResponse(res);
          const das = fp?.dasDocumentDTO;
          const b64 = das?.base64Str ?? das?.base64StrOrig;
          const mime = das?.contentType || 'application/octet-stream';
          const name = dto.documentName || 'attachment';
          if (b64) {
            this.saveBase64AsFile(name, b64, mime);
          }
        },
      });
  }

  remove(_item: FPDocAuthWithDocumentDTO): void {
    // No delete endpoint on cas-storage DocumentController; hook when available.
  }

  private unwrapFPDocumentResponse(res: StandardResponse<FPDocumentDTO>): FPDocumentDTO | undefined {
    return (res as any)?.response ?? (res as any)?.data;
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
    const a = this.downloadLink?.nativeElement;
    if (a) {
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
