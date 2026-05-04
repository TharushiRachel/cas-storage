import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  FPDocAuthDTO, 
  FPDocAuthCombinedListDTO, 
  StandardResponse, 
  FPDocAuthWithDocumentDTO 
} from '../models/fp-doc.model';

@Injectable({
  providedIn: 'root'
})
export class FPDocService {
  private apiUrl = `${environment.apiUrl}/fp-doc-auth`;

  constructor(private http: HttpClient) { }

  saveOrUpdate(data: FPDocAuthDTO): Observable<StandardResponse<FPDocAuthDTO>> {
    return this.http.post<StandardResponse<FPDocAuthDTO>>(this.apiUrl, data);
  }

  getCombined(): Observable<StandardResponse<FPDocAuthCombinedListDTO>> {
    return this.http.get<StandardResponse<FPDocAuthCombinedListDTO>>(`${this.apiUrl}/combined`);
  }

  getTempWithFpDocument(facilityPaperId: number, docStatus: string): Observable<StandardResponse<FPDocAuthWithDocumentDTO[]>> {
    return this.http.get<StandardResponse<FPDocAuthWithDocumentDTO[]>>(`${this.apiUrl}/temp-with-fp-document/facility-paper/${facilityPaperId}/doc-status/${docStatus}`);
  }

  getMasterWithFpDocument(facilityPaperId: number, docStatus: string): Observable<StandardResponse<FPDocAuthWithDocumentDTO[]>> {
    return this.http.get<StandardResponse<FPDocAuthWithDocumentDTO[]>>(`${this.apiUrl}/master-with-fp-document/facility-paper/${facilityPaperId}/doc-status/${docStatus}`);
  }

  getById(id: number): Observable<StandardResponse<FPDocAuthDTO>> {
    return this.http.get<StandardResponse<FPDocAuthDTO>>(`${this.apiUrl}/${id}`);
  }

  getAll(): Observable<StandardResponse<FPDocAuthDTO[]>> {
    return this.http.get<StandardResponse<FPDocAuthDTO[]>>(this.apiUrl);
  }
}