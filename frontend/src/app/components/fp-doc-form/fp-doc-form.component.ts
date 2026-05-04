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
      Object.keys(this.docForm.controls).forEach(key => {
        this.docForm.get(key)?.markAsTouched();
      });
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
}