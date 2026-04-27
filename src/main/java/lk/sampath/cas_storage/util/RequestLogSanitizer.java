/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lk.sampath.cas_storage.dto.common.DocStorageDTO;
import lk.sampath.cas_storage.dto.dasstorage.CreateRequestDTO;
import lk.sampath.cas_storage.dto.dasstorage.DasDocumentDTO;
import lk.sampath.cas_storage.dto.dasstorage.createdocref.CreateDocumentRefRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class RequestLogSanitizer {

  private final PropertyFileValue propertyFileValue;
  private final ObjectMapper objectMapper;

  public RequestLogSanitizer(PropertyFileValue propertyFileValue, ObjectMapper objectMapper) {
    this.propertyFileValue = propertyFileValue;
    this.objectMapper = objectMapper;
  }

  public String sanitizeCreateRequest(CreateRequestDTO request) {
    ObjectNode node = objectMapper.valueToTree(request);

    if (!propertyFileValue.isLogOriginalBase64() && node.has("sdasfilecontent")) {
      node.put("sdasfilecontent", "file added");
    }

    return node.toPrettyString();
  }

  public String sanitizeCreateRequest(CreateDocumentRefRequestDTO request) {
    ObjectNode node = objectMapper.valueToTree(request);

    if (!propertyFileValue.isLogOriginalBase64() && node.has("sdasfilecontent")) {
      node.put("sdasfilecontent", "file added");
    }

    return node.toPrettyString();
  }

  public String sanitizeCreateRequest(DasDocumentDTO response) {
    ObjectNode node = objectMapper.valueToTree(response);

    if (!propertyFileValue.isLogOriginalBase64() && node.has("base64StrOrig")) {
      node.put("base64StrOrig", "file fetched from DAS, original base64 not logged");
    }

    return node.toPrettyString();
  }

  public String sanitizeCreateRequest(DocStorageDTO response) {
    ObjectNode node = objectMapper.valueToTree(response);

    if (!propertyFileValue.isLogOriginalBase64()
        && node.has("document")
        && node.has("dasDocument")) {
      node.put("document", "file fetched from DAS, original base64 not logged");
      node.put("dasDocument", "file fetched from DAS, original base64 not logged");
    }

    return node.toPrettyString();
  }
}
