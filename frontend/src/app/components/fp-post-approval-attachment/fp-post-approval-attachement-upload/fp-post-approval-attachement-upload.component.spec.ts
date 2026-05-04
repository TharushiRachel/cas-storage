import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FpPostApprovalAttachementUploadComponent } from './fp-post-approval-attachement-upload.component';

describe('FpPostApprovalAttachementUploadComponent', () => {
  let component: FpPostApprovalAttachementUploadComponent;
  let fixture: ComponentFixture<FpPostApprovalAttachementUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FpPostApprovalAttachementUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FpPostApprovalAttachementUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
