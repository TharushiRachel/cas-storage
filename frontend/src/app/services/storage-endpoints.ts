import { environment } from "../../environments/environment";

/** CAS Storage DocumentController base: `{casStorageBaseUrl}/api/...` */
const CAS_DOC_API = `${environment.casStorageBaseUrl}/api`;

const headerParam = {
  showLoading: false as boolean,
  skipAuth: false as boolean,
};

export const STORAGE_SETTINGS = {
  ENDPOINTS: {
    saveDocument: {
      url: `${CAS_DOC_API}/saveDocument`,
      headerParam: { ...headerParam },
    },
    getTempWithFpDocument: {
      url: `${CAS_DOC_API}/temp-with-fp-document`,
      headerParam: { ...headerParam },
    },
    getFPDocumentById: {
      url: `${CAS_DOC_API}/getFPDocumentById`,
      headerParam: { ...headerParam },
    },
    deactivateFPDocument: {
      url: `${CAS_DOC_API}/deactivateFPDocument`,
      headerParam: { ...headerParam },
    },
    downloadFPDocument: {
      url: `${CAS_DOC_API}/downloadFPDocument`,
      headerParam: { ...headerParam },
    },
  },
};
