/*
 * -------------------------------------------------------------------------------------------------------------------
 * Copyright © Sampath Bank PLC. All rights reserved.
 *
 * <p>This software and its source code are the exclusive property of Sampath Bank PLC. Unauthorized
 * copying, modification, distribution, or use - whether in whole or in part - is strictly
 * prohibited without prior written consent from Sampath Bank PLC.
 * -------------------------------------------------------------------------------------------------------------------
 */
package lk.sampath.cas_storage.controller.basecontroller;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

@Data
public class StandardResponse<T> {

  private Boolean success;
  private String message;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private Object response;

  public StandardResponse(Boolean success, String message, Object response) {
    this.success = success;
    this.message = message;
    this.response = response;
  }
}
