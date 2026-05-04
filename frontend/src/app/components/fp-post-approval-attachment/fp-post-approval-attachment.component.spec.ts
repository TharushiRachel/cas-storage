import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FpPostApprovalAttachmentComponent } from './fp-post-approval-attachment.component';

describe('FpPostApprovalAttachmentComponent', () => {
  let component: FpPostApprovalAttachmentComponent;
  let fixture: ComponentFixture<FpPostApprovalAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FpPostApprovalAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FpPostApprovalAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
