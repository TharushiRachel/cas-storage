import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DocStorageDTO,
  DasDocumentDTO,
  DasDocumentRequestDTO,
  DocumentModuleDTO,
  FPDocAuthDTO,
  FPDocAuthCombinedListDTO,
  FPDocAuthWithDocumentDTO,
  FPDocumentDTO,
  StandardResponse,
} from 'src/app/models/fp-doc.model';

@Injectable({
  providedIn: 'root'
})
export class FPDocService {
  private apiUrl = `${environment.apiUrl}/fp-doc-auth`;
  // DocumentController uses /api mappings. If environment.apiUrl is /api/v1, we need to adjust
  private docApiUrl = environment.apiUrl.replace('/v1', '');

  constructor(private http: HttpClient) { }

  saveDocument(
    data: DocumentModuleDTO<FPDocumentDTO>
  ): Observable<StandardResponse<any>> {
    return this.http.post<StandardResponse<any>>(`${this.docApiUrl}/saveDocument`, data);
  }

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

  getDocumentById(
    body: DasDocumentRequestDTO
  ): Observable<StandardResponse<DasDocumentDTO>> {
    return this.http.post<StandardResponse<DasDocumentDTO>>(
      `${this.docApiUrl}/getDocumentById`,
      body
    );
  }

  getDocumentStorageByDocStorageID(
    docStorageID: number
  ): Observable<StandardResponse<DocStorageDTO>> {
    return this.http.get<StandardResponse<DocStorageDTO>>(
      `${this.docApiUrl}/getDocumentStorageByDocStorageID/${docStorageID}`
    );
  }

  /** Same Promise shape as before; POST target matches Postman `{casStorageBaseUrl}/api/getFPDocumentById`. */
  getFPDocumentById(payload: any): Promise<StandardResponse<FPDocumentDTO>> {
    return new Promise((resolve, reject) => {
      const url = `${environment.casStorageBaseUrl}/api/getFPDocumentById`;
      this.http
        .post<StandardResponse<FPDocumentDTO>>(url, payload)
        .subscribe(
          (response) => resolve(response),
          (err) => reject(err),
        );
    });
  }

}