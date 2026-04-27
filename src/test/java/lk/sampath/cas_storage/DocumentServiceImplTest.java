package lk.sampath.cas_storage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import lk.sampath.cas_storage.controller.basecontroller.StandardResponse;
import lk.sampath.cas_storage.dto.common.DocStorageDTO;
import lk.sampath.cas_storage.dto.common.SupportingDocIDStorageIDPairDTO;
import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCasePropertyDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefResponseDTO;
import lk.sampath.cas_storage.entity.DocStorage;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.repository.DocStorageRepository;
import lk.sampath.cas_storage.service.IntegrationService;
import lk.sampath.cas_storage.service.impl.DocumentServiceImpl;
import lk.sampath.cas_storage.util.PropertyFileValue;
import lk.sampath.cas_storage.util.RequestLogSanitizer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceImplTest {

  @Mock private DocStorageRepository docStorageRepository;
  @Mock private ObjectMapper objectMapper;
  @Mock private IntegrationService integrationService;
  @Mock private PropertyFileValue propertyFileValue;
  @Mock private RequestLogSanitizer requestLogSanitizer;

  @InjectMocks private DocumentServiceImpl service;

  private final ObjectMapper realJackson = new ObjectMapper();

  private JsonNode dasCaseTemplateNode() {
    ObjectNode root = realJackson.createObjectNode();
    root.put("lastNodeID", "LN-1");
    root.put("lastNodeElementOrder", "EO-1");

    ArrayNode props = realJackson.createArrayNode();
    props.add(realJackson.createObjectNode().put("Key", "K1").put("Value", "OLD1"));
    props.add(realJackson.createObjectNode().put("Key", "K2").put("Value", "OLD2"));

    root.set("Property", props);
    return root;
  }

  private JsonNode documentRefTemplateNode() {
    ObjectNode root = realJackson.createObjectNode();
    root.put("foldersavein", "FOLDER");
    root.put("objectstorename", "STORE");
    root.put("appreqid", "APPREQ");
    root.put("sdasdocuemntsecurity", "SEC");
    root.put("sdasdocumenttypeid", "TYPEID");
    return root;
  }

  private void mockTemplateReads() throws IOException {
    given(objectMapper.readTree(any(File.class)))
        .willAnswer(
            inv -> {
              File f = inv.getArgument(0, File.class);
              if (f.getName().equals("das-case.json")) {
                return dasCaseTemplateNode();
              }
              if (f.getName().equals("document-ref.json")) {
                return documentRefTemplateNode();
              }
              return realJackson.createObjectNode();
            });
  }

  private CreateRequestDTO buildCreateRequestWithProperties(String caseId) {
    CreateRequestDTO req = new CreateRequestDTO();
    req.setCaseid(caseId);
    req.setCreatedUserId("createdUser");
    req.setSenderid("senderUser");
    req.setUserLevel("L1");
    req.setCreatedUserSol("SOL1");
    req.setCaseComment("comment");

    req.setSdasdocumentname("doc-name");
    req.setSdasdocumenttype("doc-type");
    req.setUploaduserSecuritylevel("UL1");
    req.setSdasfilecontent("base64-content");

    CreateCasePropertyDTO p1 = new CreateCasePropertyDTO();
    p1.setKey("K1");
    p1.setValue("NEW1");

    CreateCasePropertyDTO p2 = new CreateCasePropertyDTO();
    p2.setKey("K2");
    p2.setValue("NEW2");

    req.setProperty(List.of(p1, p2));
    return req;
  }

  @Test
  void getDocumentById_success_returns200AndBody() {
    ReflectionTestUtils.setField(propertyFileValue, "logOriginalBase64", true);

    DasDocumentRequestDTO rq = new DasDocumentRequestDTO();
    rq.setCaseId("CASE1");
    rq.setDocumentId("DOC1");

    DasDocumentDTO dto = new DasDocumentDTO();
    dto.setContentType("application/pdf");
    dto.setBase64Str("masked");
    dto.setBase64StrOrig("orig");

    when(integrationService.getDocumentById(any(DasDocumentRequestDTO.class))).thenReturn(dto);

    ResponseEntity<StandardResponse<DasDocumentDTO>> res = service.getDocumentById(rq);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());
  }

  @Test
  void getDocumentById_apiRequestException_returns400() {
    DasDocumentRequestDTO rq = new DasDocumentRequestDTO();
    rq.setCaseId("CASE1");
    rq.setDocumentId("DOC1");

    given(integrationService.getDocumentById(any())).willThrow(new ApiRequestException("boom"));

    ResponseEntity<StandardResponse<DasDocumentDTO>> res = service.getDocumentById(rq);

    assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
  }

  @Test
  void getDocumentById_apiRequestException_returns500() {
    DasDocumentRequestDTO rq = new DasDocumentRequestDTO();
    rq.setCaseId("CASE1");
    rq.setDocumentId("DOC1");

    given(integrationService.getDocumentById(any())).willThrow(new RuntimeException("boom"));

    ResponseEntity<StandardResponse<DasDocumentDTO>> res = service.getDocumentById(rq);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
  }

  @Test
  void getDasDocumentsByCaseId_success_returns200() {
    CaseDocumentsDTO dto = new CaseDocumentsDTO();
    given(integrationService.getDasDocumentsByCaseId("CASE1")).willReturn(dto);

    ResponseEntity<StandardResponse<CaseDocumentsDTO>> res =
        service.getDasDocumentsByCaseId("CASE1");

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());
  }

  @Test
  void getDasDocumentsByCaseId_apiRequestException_returns400() {
    given(integrationService.getDasDocumentsByCaseId("CASE1"))
        .willThrow(new ApiRequestException("bad"));

    ResponseEntity<StandardResponse<CaseDocumentsDTO>> res =
        service.getDasDocumentsByCaseId("CASE1");

    assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
  }

  @Test
  void getDasDocumentsByCaseId_apiRequestException_returns500() {
    given(integrationService.getDasDocumentsByCaseId("CASE1"))
        .willThrow(new RuntimeException("bad"));

    ResponseEntity<StandardResponse<CaseDocumentsDTO>> res =
        service.getDasDocumentsByCaseId("CASE1");

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
  }

  @Test
  void getDocumentStorageByDocStorageID_whenDocumentPresent_doesNotCallDAS() throws Exception {
    DocStorage ds = mock(DocStorage.class);
    given(ds.getDocument()).willReturn(new byte[] {1, 2, 3});
    given(ds.getDocumentReference()).willReturn("DOCREF");
    given(ds.getFileType()).willReturn("pdf");

    when(docStorageRepository.findById(10)).thenReturn(Optional.of(ds));

    ResponseEntity<StandardResponse<DocStorageDTO>> res =
        service.getDocumentStorageByDocStorageID(10);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());
    then(integrationService).should(never()).getDocumentById(any());
  }

  @Test
  void getDocumentStorageByDocStorageID_whenDocumentPresent_fetchesFromDASAndSetsBase64()
      throws Exception {
    DocStorage ds = mock(DocStorage.class);
    given(ds.getDocument()).willReturn(null); // missing
    given(ds.getCaseId()).willReturn("CASE1");
    given(ds.getDocumentReference()).willReturn("DOCREF");
    given(ds.getFileType()).willReturn("pdf");

    given(docStorageRepository.findById(11)).willReturn(Optional.of(ds));

    DasDocumentDTO das = new DasDocumentDTO();
    das.setBase64StrOrig("BASE64-ORIG");
    given(integrationService.getDocumentById(any(DasDocumentRequestDTO.class))).willReturn(das);

    ResponseEntity<StandardResponse<DocStorageDTO>> res =
        service.getDocumentStorageByDocStorageID(11);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());

    then(integrationService).should(times(1)).getDocumentById(any(DasDocumentRequestDTO.class));
  }

  @Test
  void getDocumentStorageByDocStorageID_whenDocumentMissing_fetchesFromDASAndSetsBase64()
      throws Exception {
    DocStorage ds = mock(DocStorage.class);
    given(ds.getDocument()).willReturn(null); // missing
    given(ds.getCaseId()).willReturn("CASE1");
    given(ds.getDocumentReference()).willReturn("DOCREF");
    given(ds.getFileType()).willReturn("pdf");

    given(docStorageRepository.findById(11)).willReturn(Optional.of(ds));

    DasDocumentDTO das = new DasDocumentDTO();
    das.setBase64StrOrig(null);
    given(integrationService.getDocumentById(any(DasDocumentRequestDTO.class))).willReturn(das);

    ResponseEntity<StandardResponse<DocStorageDTO>> res =
        service.getDocumentStorageByDocStorageID(11);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());

    then(integrationService).should(times(1)).getDocumentById(any(DasDocumentRequestDTO.class));
  }

  @Test
  void getDocumentStorageByDocStorageID_whenRepoMissing_throwsApiRequestException() {
    given(docStorageRepository.findById(99)).willReturn(Optional.empty());

    ApiRequestException ex =
        assertThrows(ApiRequestException.class, () -> service.getDocumentStorageByDocStorageID(99));
    assertEquals("Unable to Fetch Documents", ex.getMessage());
  }

  @Test
  void getDocumentStorageList_mixedDocuments_callsDASOnlyForMissing() throws Exception {

    DocStorage ds1 = mock(DocStorage.class);
    given(ds1.getDocument()).willReturn(new byte[] {9});
    given(ds1.getDocumentReference()).willReturn("DOCREF1");

    DocStorage ds2 = mock(DocStorage.class);
    given(ds2.getDocument()).willReturn(new byte[0]);
    given(ds2.getCaseId()).willReturn("CASE2");
    given(ds2.getDocumentReference()).willReturn("DOCREF2");

    given(docStorageRepository.findById(1)).willReturn(Optional.of(ds1));
    given(docStorageRepository.findById(2)).willReturn(Optional.of(ds2));

    DasDocumentDTO das = new DasDocumentDTO();
    das.setBase64StrOrig("BASE64-2");
    given(integrationService.getDocumentById(any(DasDocumentRequestDTO.class))).willReturn(das);

    SupportingDocIDStorageIDPairDTO p1 = new SupportingDocIDStorageIDPairDTO();
    p1.setDocStorageID(1);
    SupportingDocIDStorageIDPairDTO p2 = new SupportingDocIDStorageIDPairDTO();
    p2.setDocStorageID(2);

    ResponseEntity<StandardResponse<List<DocStorageDTO>>> res =
        service.getDocumentStorageList(List.of(p1, p2));

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());

    then(integrationService).should(times(1)).getDocumentById(any(DasDocumentRequestDTO.class));
  }

  @Test
  void getDocumentStorageList_whenRepoThrows_wrapsAsApiRequestException() {

    given(docStorageRepository.findById(anyInt())).willReturn(Optional.empty());

    SupportingDocIDStorageIDPairDTO p1 = new SupportingDocIDStorageIDPairDTO();
    p1.setDocStorageID(123);

    ApiRequestException ex =
        assertThrows(ApiRequestException.class, () -> service.getDocumentStorageList(List.of(p1)));

    assertEquals("Unable to Fetch Documents", ex.getMessage());
  }

  @Test
  void createCase_whenCaseIdNull_createsCaseThenCreatesDocumentRef_returns200() throws Exception {
    mockTemplateReads();

    CreateRequestDTO request = buildCreateRequestWithProperties(null);

    CreateCaseResponseDTO caseRes = new CreateCaseResponseDTO();
    caseRes.setCaseid("NEW-CASE");
    caseRes.setResponceFlag("SUCCESS");

    CreateDocumentRefResponseDTO docRefRes = new CreateDocumentRefResponseDTO();
    docRefRes.setDocumentRef("DOC-REF-1");

    given(integrationService.createCaseFromDas(any())).willReturn(caseRes);
    given(integrationService.createDocumentRefFromDas(any(CreateDocumentRefRequestDTO.class)))
        .willReturn(docRefRes);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());

    then(integrationService).should(times(1)).createCaseFromDas(any());
    then(integrationService)
        .should(times(1))
        .createDocumentRefFromDas(any(CreateDocumentRefRequestDTO.class));
  }

  @Test
  void createCase_whenCaseIdProvided_skipsCreateCase_callsCreateDocumentRefWithSameCaseId()
      throws Exception {
    mockTemplateReads();

    CreateRequestDTO request = buildCreateRequestWithProperties("EXISTING-CASE");

    CreateDocumentRefResponseDTO docRefRes = new CreateDocumentRefResponseDTO();
    docRefRes.setDocumentRef("DOC-REF-EX");

    given(integrationService.createDocumentRefFromDas(any(CreateDocumentRefRequestDTO.class)))
        .willReturn(docRefRes);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());

    then(integrationService).should(never()).createCaseFromDas(any());

    ArgumentCaptor<CreateDocumentRefRequestDTO> captor =
        ArgumentCaptor.forClass(CreateDocumentRefRequestDTO.class);
    then(integrationService).should(times(1)).createDocumentRefFromDas(captor.capture());
    assertEquals("EXISTING-CASE", captor.getValue().getCaseid());
  }

  @Test
  void createCase_whenCreateCaseFromDasThrows_savesToDocStorageAndSkipsDocumentRef()
      throws Exception {
    mockTemplateReads();

    CreateRequestDTO request = buildCreateRequestWithProperties(null);
    request.setSdasfilecontent(
        Base64.getEncoder().encodeToString("payload".getBytes(StandardCharsets.UTF_8)));

    given(integrationService.createCaseFromDas(any()))
        .willThrow(new ApiRequestException("DAS unavailable"));

    DocStorage saved = new DocStorage();
    saved.setDocStorageID(42);
    given(docStorageRepository.save(any(DocStorage.class))).willReturn(saved);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNotNull(res.getBody().getResponse());
    assertEquals("42", res.getBody().getResponse().getDocumentRef());
    assertEquals("SUCCESS", res.getBody().getResponse().getResponceFlag());

    then(integrationService).should(never()).createDocumentRefFromDas(any());
    then(docStorageRepository).should(times(1)).save(any(DocStorage.class));
  }

  @Test
  void createCase_whenCreateCaseFromDasReturnsError_savesToDocStorage() throws Exception {
    mockTemplateReads();

    CreateRequestDTO request = buildCreateRequestWithProperties(null);
    request.setSdasfilecontent(
        Base64.getEncoder().encodeToString("payload".getBytes(StandardCharsets.UTF_8)));

    CreateCaseResponseDTO caseRes = new CreateCaseResponseDTO();
    caseRes.setResponceFlag("ERROR");
    given(integrationService.createCaseFromDas(any())).willReturn(caseRes);

    DocStorage saved = new DocStorage();
    saved.setDocStorageID(99);
    given(docStorageRepository.save(any(DocStorage.class))).willReturn(saved);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.OK, res.getStatusCode());
    assertEquals("99", res.getBody().getResponse().getDocumentRef());
    then(integrationService).should(never()).createDocumentRefFromDas(any());
    then(docStorageRepository).should(times(1)).save(any(DocStorage.class));
  }

  @Test
  void createCase_whenDocumentRefEmpty_returns400() throws Exception {
    mockTemplateReads();

    CreateRequestDTO request = buildCreateRequestWithProperties(null);

    CreateCaseResponseDTO caseRes = new CreateCaseResponseDTO();
    caseRes.setCaseid("NEW-CASE");
    caseRes.setResponceFlag("SUCCESS");

    CreateDocumentRefResponseDTO emptyDocRef = new CreateDocumentRefResponseDTO();
    emptyDocRef.setDocumentRef("");

    given(integrationService.createCaseFromDas(any())).willReturn(caseRes);
    given(integrationService.createDocumentRefFromDas(any(CreateDocumentRefRequestDTO.class)))
        .willReturn(emptyDocRef);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.BAD_REQUEST, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
  }

  @Test
  void createCase_whenObjectMapperThrowsIOException_returns500FileReadError() throws Exception {

    given(objectMapper.readTree(any(File.class))).willThrow(new IOException("read failed"));

    CreateRequestDTO request = buildCreateRequestWithProperties(null);

    ResponseEntity<StandardResponse<CreateCaseResponseDTO>> res = service.createCase(request);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
    assertNotNull(res.getBody());
    assertNull(res.getBody().getResponse());
    assertEquals("File read error", res.getBody().getMessage());
  }
}
