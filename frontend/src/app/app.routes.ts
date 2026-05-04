import { Routes } from '@angular/router';
import { FpDocListComponent } from './components/fp-doc-list/fp-doc-list.component';
import { FpDocFormComponent } from './components/fp-doc-form/fp-doc-form.component';

export const routes: Routes = [
  { path: '', component: FpDocListComponent },
  { path: 'add', component: FpDocFormComponent },
  { path: 'edit/:id', component: FpDocFormComponent },
  { path: '**', redirectTo: '' }
];