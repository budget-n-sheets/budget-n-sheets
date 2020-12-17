/**
 * Copyright (c) 2020 Guilherme T Maeoka
 * This code is licensed under MIT license.
 * <https://github.com/guimspace/gas-common>
 */

function isAuthorizationRequired_ () {
  try {
    PropertiesService.getDocumentProperties();
  } catch (e) {
    return true;
  }

  return ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED;
}
