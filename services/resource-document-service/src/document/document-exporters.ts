import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx';

@Injectable()
export class DocumentExporters {
  async exportPdf(title: string, content: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        doc.fontSize(20).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(content);
        
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  async exportDocx(title: string, content: string): Promise<Buffer> {
    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: title, bold: true, size: 32 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun(content),
            ],
          }),
        ],
      }],
    });
    
    // Packer.toBuffer is async in docx
    return await Packer.toBuffer(doc);
  }

  async exportMarkdown(title: string, content: string): Promise<Buffer> {
    const md = `# ${title}\n\n${content}`;
    return Buffer.from(md, 'utf-8');
  }
}
