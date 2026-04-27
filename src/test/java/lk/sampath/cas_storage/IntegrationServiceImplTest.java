package lk.sampath.cas_storage;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.sampath.cas_storage.dto.dasstorage.CaseDocumentsDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createcase.CreateCaseResponseDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefResponseDTO;
import lk.sampath.cas_storage.exception.ApiRequestException;
import lk.sampath.cas_storage.service.impl.IntegrationServiceImpl;
import lk.sampath.cas_storage.util.PropertyFileValue;
import lk.sampath.cas_storage.util.RequestLogSanitizer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
public class IntegrationServiceImplTest {

  @Mock private PropertyFileValue propertyFileValue;

  @Mock private WebClient webClient;

  @Mock private ModelMapper modelMapper;

  @Mock private ObjectMapper objectMapper;

  @InjectMocks private IntegrationServiceImpl service;

  private WebClient.RequestBodyUriSpec requestBodyUriSpec;
  private WebClient.RequestHeadersSpec requestHeadersSpec;
  private WebClient.RequestBodySpec requestBodySpec;
  private WebClient.ResponseSpec responseSpec;

  @Mock private RequestLogSanitizer requestLogSanitizer;

  @BeforeEach
  public void setUp() {

    requestBodyUriSpec = mock(WebClient.RequestBodyUriSpec.class);
    requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
    requestBodySpec = mock(WebClient.RequestBodySpec.class);
    responseSpec = mock(WebClient.ResponseSpec.class);
  }

  @Test
  void createCaseFromDas_whenServiceDisabled_returnsEmptyDtoAndDoesNotCallWebClient()
      throws Exception {
    given(propertyFileValue.isCreateDasCaseEnable()).willReturn(false);

    CreateCaseDTO rq = new CreateCaseDTO();
    CreateCaseResponseDTO res = service.createCaseFromDas(rq);

    assertNotNull(res);
    then(webClient).shouldHaveNoInteractions();
    then(objectMapper).shouldHaveNoInteractions();
  }

  @Test
  void createCaseFromDas_whenServiceEnabled_success_callsWebClientAndParsesResponse()
      throws Exception {
    given(propertyFileValue.isCreateDasCaseEnable()).willReturn(true);
    given(propertyFileValue.getCreateDasCaseUrl()).willReturn("http://das/case");

    String dasResponse = "{\"caseid\":\"C-1\",\"responceFlag\":\"SUCCESS\"}";

    when(webClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
    when(requestBodySpec.bodyValue(any())).thenReturn(requestHeadersSpec);
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(dasResponse));

    CreateCaseResponseDTO mapped = new CreateCaseResponseDTO();
    mapped.setCaseid("C-1");
    mapped.setResponceFlag("SUCCESS");
    given(objectMapper.readValue(dasResponse, CreateCaseResponseDTO.class)).willReturn(mapped);

    CreateCaseDTO rq = new CreateCaseDTO();
    CreateCaseResponseDTO res = service.createCaseFromDas(rq);

    assertNotNull(res);
    assertEquals("C-1", res.getCaseid());
    assertEquals("SUCCESS", res.getResponceFlag());

    then(webClient).should(times(1)).post();
    then(objectMapper).should(times(1)).readValue(dasResponse, CreateCaseResponseDTO.class);
  }

  @Test
  void createCaseFromDas_whenWebClientThrows_wrapsAsApiRequestException() {
    given(propertyFileValue.isCreateDasCaseEnable()).willReturn(true);
    given(propertyFileValue.getCreateDasCaseUrl()).willReturn("http://das/case");

    when(webClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
    when(requestBodySpec.bodyValue(any()))
        .thenReturn(requestHeadersSpec); // important: return same type
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(String.class))
        .thenThrow(new RuntimeException("WebClient exception"));

    ApiRequestException ex =
        assertThrows(
            ApiRequestException.class, () -> service.createCaseFromDas(new CreateCaseDTO()));

    assertEquals("Error while creating case in DAS service", ex.getMessage());
  }

  @Test
  void createDocumentRefFromDas_whenServiceDisabled_returnsEmptyDtoAndDoesNotCallWebClient()
      throws Exception {

    when(propertyFileValue.isCreateDasDocumentRefEnable()).thenReturn(false);
    CreateDocumentRefResponseDTO res =
        service.createDocumentRefFromDas(new CreateDocumentRefRequestDTO());

    assertNotNull(res);
    then(webClient).shouldHaveNoInteractions();
    then(objectMapper).shouldHaveNoInteractions();
  }

  @Test
  void getDasDocumentsByCaseId_whenServiceDisabled_returnsEmptyDtoAndDoesNotCallWebClient()
      throws Exception {
    given(propertyFileValue.isGetDasDocumentsByCaseIdEnable()).willReturn(false);

    CaseDocumentsDTO res = service.getDasDocumentsByCaseId("CASE1");

    assertNotNull(res);
    then(webClient).shouldHaveNoInteractions();
  }

  @Test
  void getDasDocumentsByCaseId_whenWebClientThrows_wrapsAsApiRequestException() {
    given(propertyFileValue.isGetDasDocumentsByCaseIdEnable()).willReturn(true);
    given(propertyFileValue.getGetDasDocumentsByCaseIdUrl())
        .willReturn("http://das/case/{caseId}/documents");

    ApiRequestException ex =
        assertThrows(ApiRequestException.class, () -> service.getDasDocumentsByCaseId("CASE1"));

    assertEquals("Error while fetching documents from DAS service", ex.getMessage());
  }

  @Test
  void createDocumentRefFromDas_whenServiceEnabled_success() throws Exception {
    given(propertyFileValue.isCreateDasDocumentRefEnable()).willReturn(true);
    given(propertyFileValue.getCreateDasDocumentRefUrl()).willReturn("http://das/case");

    String createDocumentRefResponseDTO = "{\"caseid\":\"C-1\",\"responceFlag\":\"SUCCESS\"}";

    when(webClient.post()).thenReturn(requestBodyUriSpec);
    when(requestBodyUriSpec.uri(anyString())).thenReturn(requestBodySpec);
    when(requestBodySpec.bodyValue(any()))
        .thenReturn(requestHeadersSpec); // important: return same type
    when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
    when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(createDocumentRefResponseDTO));

    CreateDocumentRefResponseDTO mapped = new CreateDocumentRefResponseDTO();
    mapped.setCaseid("C-1");
    mapped.setResponceFlag("SUCCESS");
    when(objectMapper.readValue(createDocumentRefResponseDTO, CreateDocumentRefResponseDTO.class))
        .thenReturn(mapped);

    CreateDocumentRefRequestDTO rq = new CreateDocumentRefRequestDTO();
    CreateDocumentRefResponseDTO res = service.createDocumentRefFromDas(rq);

    assertNotNull(res);
    assertEquals("C-1", res.getCaseid());
    assertEquals("SUCCESS", res.getResponceFlag());

    then(webClient).should(times(1)).post();
  }

  @Test
  void getDocumentById_whenServiceDisabled_returnsEmptyDtoAndDoesNotCallWebClient()
      throws Exception {

    when(propertyFileValue.isGetDasDocumentByDocIdEnable()).thenReturn(false);
    DasDocumentDTO res = service.getDocumentById(new DasDocumentRequestDTO());

    assertNotNull(res);
    then(webClient).shouldHaveNoInteractions();
    then(objectMapper).shouldHaveNoInteractions();
  }
}
