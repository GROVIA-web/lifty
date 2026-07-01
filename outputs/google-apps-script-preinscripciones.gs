function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById("1bmo6XWTkyNuQ47azgpIrC80IsO-Qurov90zt2JP0cvE");

    let sheet = spreadsheet.getSheetByName("Preinscripciones");

    if (!sheet) {
      sheet = spreadsheet.insertSheet("Preinscripciones");
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha recepcion",
        "Nombre completo",
        "Documento",
        "Telefono",
        "Email",
        "Vehiculo",
        "Mensaje",
        "Origen",
        "Fecha enviada"
      ]);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.nombreCompleto || "",
      data.documento || "",
      data.telefono || "",
      data.email || "",
      data.vehiculo || "",
      data.mensaje || "",
      data.origen || "Landing Lifty - Preinscripcion",
      data.fecha || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        message: "Preinscripcion guardada correctamente"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
