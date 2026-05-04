import { Component, Input, OnInit } from '@angular/core';
import { MDBModalRef, MDBModalService } from 'ng-uikit-pro-standard';
import { FpPostApprovalAttachementUploadComponent } from './fp-post-approval-attachement-upload/fp-post-approval-attachement-upload.component';
import { SETTINGS } from 'src/app/core/setting/commons.settings';
import { ApplicationService } from 'src/app/core/service/application/application.service';
import { Constants } from 'src/app/core/setting/constants';

@Component({
  selector: 'app-fp-post-approval-attachment',
  templateUrl: './fp-post-approval-attachment.component.html',
  styleUrls: ['./fp-post-approval-attachment.component.scss']
})
export class FpPostApprovalAttachmentComponent implements OnInit {

  modalRef: MDBModalRef;
  @Input('facilityPaper') facilityPaper: any = {};
  masterDataPrivilege = SETTINGS.PRIVILEGES;
  facilityPaperStatusConst = Constants.facilityPaperStatusConst;
  
  constructor(
    private mdbModalService: MDBModalService,
    private applicationService: ApplicationService,
  ) { }

  ngOnInit() {

    console.log("facility paper object", this.facilityPaper);
    
  }

  openModalAttachmentUpload(facilityPaper) {
  
      const initialState = {
        list: [
          {"tag": 'Count', "value": facilityPaper}
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
          heading: "comming dto",
          content: {facilityPaper: facilityPaper},
        }
      });
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
}
