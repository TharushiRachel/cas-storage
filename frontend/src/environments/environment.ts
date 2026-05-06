export const environment = {
  production: false,
  /** Facility / BFF (e.g. fp-doc-auth) */
  apiUrl: 'http://localhost:8080/api/v1',
  /** cas-storage servlet context — must match Postman, e.g. .../cas-storage/api/getFPDocumentById */
  casStorageBaseUrl: 'http://localhost:8090/cas-storage',
};