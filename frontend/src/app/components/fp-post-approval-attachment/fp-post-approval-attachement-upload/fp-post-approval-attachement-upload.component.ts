import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { MDBModalRef } from 'ng-uikit-pro-standard';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/core/service/application/application.service';
import { AlertService } from 'src/app/core/service/common/alert.service';
import { CacheService } from 'src/app/core/service/data/cache.service';
import { SETTINGS } from 'src/app/core/setting/commons.settings';
import { Constants } from 'src/app/core/setting/constants';
import { AppUtils } from 'src/app/shared/app.utils';
import { FileUploadError } from 'src/app/shared/dto/file-upload-error';
import { FileValidator } from 'src/app/shared/validators/file.validator';
import { FacilityPaperAddEditService } from 'src/app/views/pages/facility-paper/services/facility-paper-add-edit.service';
import { FPDocService } from 'src/app/services/fp-doc.service';

@Component({
  selector: 'app-fp-post-approval-attachement-upload',
  templateUrl: './fp-post-approval-attachement-upload.component.html',
  styleUrls: ['./fp-post-approval-attachement-upload.component.scss']
})
export class FpPostApprovalAttachementUploadComponent implements OnInit {
heading: string;
  content: any;
  componentForm: FormGroup;
  formErrors: any = {};

  fileToUpload: File = null;
  fileUploadError: FileUploadError = new FileUploadError();

  supportingDocs: any = [];
  result: Subject<any>;

  onSupportingDocChange: Subscription = new Subscription();
  action: Subject<any> = new Subject<any>();

  private readonly fpDocService = inject(FPDocService);

  constructor(
    private facilityPaperAddEditService: FacilityPaperAddEditService,
    private applicationService: ApplicationService,
    private formBuilder: FormBuilder,
    public  mdbModalRef: MDBModalRef,
    private cacheService: CacheService,
    private alertService: AlertService
  ) {
  }

  ngOnInit() {
    this.supportingDocs = _.sortBy(this.cacheService.getData(Constants.masterDataKey.CAS_SUPPORTING_DOCs), ['documentName']);
    this.result = new BehaviorSubject(this.supportingDocs);
    this.formErrors = {
      supportingDocID: [''],
      remark: ['']
    };

    this.componentForm = this.formBuilder.group({
      supportingDocID: ['', Validators.required],
      remark: ['']
    });
    this.onSupportingDocChange = this.componentForm.controls.supportingDocID.valueChanges
      .subscribe((value: any) => {
        this.result.next(this.filter(value))
      });


  }

  ngOnDestroy(): void {
    this.onSupportingDocChange.unsubscribe();
  }

  filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.supportingDocs.filter((item: any) => item.documentName.toLowerCase().includes(filterValue));
  }

  isValidUpload() {
    return this.fileToUpload != null && !this.fileUploadError.hasError;
  }

  selectFile(event) {
    this.fileToUpload = event.target.files[0];
    this.fileUploadError = FileValidator.isValidFile(this.fileToUpload);
  }

  addFacilityDocument() {
    let doc = AppUtils.getSupportingDocFromDocumentName(this.supportingDocs, this.componentForm.value.supportingDocID);

    if (this.fileUploadError.hasError) {
      this.alertService.showToaster(this.fileUploadError.errorMessage, SETTINGS.TOASTER_MESSAGES.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Remove the prefix "data:...;base64," if present
      const base64String = (reader.result as string).split(',')[1];

      const userId = String(this.applicationService.getLoggedInUserUserID());

      const payload = {
        fpDocumentID: null,
        facilityPaperID: this.content.facilityPaper.facilityPaperID,
        fpRefNumber: this.content.facilityPaper.fpRefNumber,
        supportingDocID: doc.supportingDocID,
        description: this.componentForm.value.remark,
        uploadedUserDisplayName: this.applicationService.getLoggedInUserDisplayName(),
        uploadedDivCode: this.applicationService.getLoggedInUserDivCode(),
        status: 'ACT',
        docStatus: 'POST',
        caseId: this.content.facilityPaper.caseId || '',
        documentReference: '',
        createdDate: new Date().toISOString(),
        createdBy: this.applicationService.getLoggedInUserUserName(),
        modifiedDate: new Date().toISOString(),
        modifiedBy: this.applicationService.getLoggedInUserUserName(),
        createRequestDTO: {
          caseid: this.content.facilityPaper.caseId || '',
          createdUserId: userId,
          createdUserLevel: this.applicationService.getLoggedInUserUPMGroupCode(),
          createdUserSol: this.applicationService.getLoggedInUserDivCode(),
          caseComment: this.componentForm.value.remark,
          senderid: userId,
          sdasdocumentname: (this.fileToUpload && this.fileToUpload.name) ? this.fileToUpload.name : doc.documentName,
          sdasdocumenttype: this.componentForm.value.remark,
          uploaduserSecuritylevel: this.applicationService.getLoggedInUserUPMGroupCode(),
          sdasfilecontent: base64String
        }
      };

      const dataToSend = {
        moduleType: 'FP',
        payload
      };

      this.fpDocService.saveDocument(dataToSend).subscribe({
        next: (res: any) => {
          const ok = res?.success === true || res?.status === true;
          if (ok) {
            this.alertService.showToaster(res.message ?? 'Document saved', SETTINGS.TOASTER_MESSAGES.success);
            this.mdbModalRef.hide();
          } else {
            this.alertService.showToaster(res?.message ?? 'Save failed', SETTINGS.TOASTER_MESSAGES.error);
          }
        },
        error: (err: any) => {
          const msg = err?.error?.message ?? err?.message ?? 'Unable to save document';
          this.alertService.showToaster(msg, SETTINGS.TOASTER_MESSAGES.error);
        }
      });
    };
    reader.readAsDataURL(this.fileToUpload);
  }
}
