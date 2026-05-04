export interface FPDocAuthDTO {
  id?: number;
  fpDocId?: number;
  facilityPaperId?: number;
  addedBy?: string;
  addedDate?: Date | string;
  addedUserDisplayName?: string;
  addedUserWorkClass?: string;
  addedUserDivCode?: string;
  addedUserBranchCode?: string;
  currentAssignUser?: string;
  verifiedBy?: string;
  verifiedDate?: Date | string;
  verifiedUserDisplayName?: string;
  verifiedUserWorkClass?: string;
  verifiedUserDivCode?: string;
  verifiedUserBranchCode?: string;
  authorizedBy?: string;
  authorizedDate?: Date | string;
  authorizedUserDisplayName?: string;
  authorizedUserWorkClass?: string;
  authorizedUserDivCode?: string;
  authorizedUserBranchCode?: string;
  isAdded?: string;
  isVerified?: string;
  isAuthorized?: string;
}

export interface FPDocAuthCombinedListDTO {
  tempRecords: FPDocAuthDTO[];
  masterRecords: FPDocAuthDTO[];
}

export interface FPDocumentDTO {
  fpDocumentID?: number;
  facilityPaperID?: number;
  supportingDocID?: number;
  description?: string;
  uploadedUserDisplayName?: string;
  uploadedDivCode?: string;
  status?: string;
  docStatus?: string;
  createdBy?: string;
  createdDate?: Date | string;
  caseId?: string;
  documentReference?: string;
  docStorageID?: string;
}

export interface FPDocAuthWithDocumentDTO {
  authRecord: FPDocAuthDTO;
  fpDocument: FPDocumentDTO;
}

export interface StandardResponse<T> {
  status: boolean;
  message: string;
  data: T;
}