export const generatePdfHtml = (title: string, content: string, logoDataUrl: string, updatedAt: string) => {
    const currentDate = new Date().toLocaleDateString("fr-FR");
  
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 30px;
        }
        .container {
          border: 2px solid #333;
          padding: 30px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header img {
          height: 60px;
        }
        .header-title {
          font-size: 20px;
          font-weight: bold;
          text-align: right;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${logoDataUrl}" alt="Logo" />
        <div class="header-title">
          ${title}<br />
          Dernière mise à jour: ${updatedAt}
        </div>
      </div>
  
      <div class="container">
        ${content}
      </div>
  
      <div class="footer">
        <div>By Robert Johnson</div>
        <div>${currentDate}</div>
      </div>
    </body>
    </html>`;
  };
  