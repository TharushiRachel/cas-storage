import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FPDocService } from '../../services/fp-doc.service';
import { FPDocAuthDTO } from '../../models/fp-doc.model';

@Component({
  selector: 'app-fp-doc-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './fp-doc-form.component.html',
  styleUrl: './fp-doc-form.component.css'
})
export class FpDocFormComponent implements OnInit {
  docForm!: FormGroup;
  isEditMode = false;
  docId?: number;
  loading = false;
  submitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private fpDocService: FPDocService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.docId = +params['id'];
        this.loadDocData(this.docId);
      }
    });
  }

  initForm(): void {
    this.docForm = this.fb.group({
      id: [null],
      fpDocId: [null, Validators.required],
      facilityPaperId: [null, Validators.required],
      addedBy: [''],
      verifiedBy: [''],
      authorizedBy: [''],
      isAdded: ['N'],
      isVerified: ['N'],
      isAuthorized: ['N'],
      currentAssignUser: ['']
    });
  }

  loadDocData(id: number): void {
    this.loading = true;
    this.fpDocService.getById(id).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.docForm.patchValue(res.data);
        } else {
          this.errorMessage = res.message || 'Failed to load document data';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading doc data', err);
        this.errorMessage = 'An error occurred while loading data';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.docForm.invalid) {
      this.markFormTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    const formData: FPDocAuthDTO = this.docForm.value;

    this.fpDocService.saveOrUpdate(formData).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.status) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = res.message || 'Failed to save data';
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error saving data', err);
        this.errorMessage = 'An error occurred while saving data';
      }
    });
  }

  onSaveDocument(): void {
    if (this.docForm.get('facilityPaperId')?.invalid) {
      this.docForm.get('facilityPaperId')?.markAsTouched();
      this.errorMessage = 'Facility Paper ID is required to save a document';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    
    // Create CreateRequestDTO based on the backend structure
    const createRequest = {
      createdUserId: this.docForm.get('addedBy')?.value || 'System',
      createdUserLevel: 'USER',
      createdUserSol: '001',
      caseComment: 'Document generated from Auth form',
      Property: [],
      senderid: this.docForm.get('addedBy')?.value || 'System',
      sdasdocumentname: 'FP_Auth_Document',
      // caseid: '', // Leave empty to create a new case, or set if known
      sdasdocumenttype: 'PDF',
      uploaduserSecuritylevel: '1',
      sdasfilecontent: 'base64_encoded_content_here' // Ideally this should be a real file's base64 string
    };

    // Create payload based on FPDocumentDTO structure
    const payload = {
      facilityPaperID: this.docForm.get('facilityPaperId')?.value,
      description: 'Document generated from Auth form',
      uploadedUserDisplayName: this.docForm.get('addedBy')?.value || 'System',
      status: 'ACTIVE',
      docStatus: 'TEMP', // or MASTER depending on business logic
      createdBy: this.docForm.get('addedBy')?.value || 'System',
      createRequestDTO: createRequest
    };

    const documentModuleDto = {
      moduleType: 'FP',
      payload: payload
    };

    this.fpDocService.saveDocument(documentModuleDto).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.status) {
          alert('Document saved successfully!');
          // Optionally navigate or reset form
        } else {
          this.errorMessage = res.message || 'Failed to save document';
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error saving document', err);
        this.errorMessage = 'An error occurred while saving the document';
      }
    });
  }

  private markFormTouched(): void {
    Object.keys(this.docForm.controls).forEach(key => {
      this.docForm.get(key)?.markAsTouched();
    });
  }
}