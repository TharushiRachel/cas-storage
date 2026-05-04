import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FPDocService } from '../../services/fp-doc.service';
import { FPDocAuthDTO } from '../../models/fp-doc.model';

@Component({
  selector: 'app-fp-doc-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fp-doc-list.component.html',
  styleUrl: './fp-doc-list.component.css'
})
export class FpDocListComponent implements OnInit {
  docs: FPDocAuthDTO[] = [];
  loading = false;

  constructor(private fpDocService: FPDocService) {}

  ngOnInit(): void {
    this.loadDocs();
  }

  loadDocs(): void {
    this.loading = true;
    this.fpDocService.getAll().subscribe({
      next: (res) => {
        if (res.status) {
          this.docs = res.data;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching docs', err);
        this.loading = false;
      }
    });
  }
}