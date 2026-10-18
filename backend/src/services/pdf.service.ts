import PDFDocument from 'pdfkit';

interface PayslipData {
  companyName: string;
  taxCode: string;
  address: string;
  month: number;
  year: number;
  employeeCode: string;
  fullName: string;
  department: string;
  position: string;
  email: string;
  bankAccount?: string;
  bankName?: string;
  standardDays: number;
  actualWorkDays: number;
  baseSalary: number;
  allowance: number;
  rewardAmount?: number;
  insuranceSalary?: number;
  bhxh?: number;
  bhyt?: number;
  bhtn?: number;
  deductions: number;
  taxableIncome?: number;
  tax: number;
  netSalary: number;
  isPaid: boolean;
}

export class PdfService {
  static generatePayslipPdf(data: PayslipData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const formatVND = (num: number) => {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(num);
        };

        // Header Background Banner
        doc.rect(40, 35, 515, 65).fill('#0f172a');

        doc.fillColor('#ffffff').fontSize(16).text(data.companyName.toUpperCase(), 55, 45);
        doc
          .fontSize(8.5)
          .fillColor('#94a3b8')
          .text(`Enterprise Human Resource Management | Tax Code: ${data.taxCode}`, 55, 68)
          .text(`Address: ${data.address}`, 55, 80);

        // Title
        doc.fillColor('#0f172a').fontSize(15).text('MONTHLY SALARY PAYSLIP / PHIEU LUONG', 40, 115, {
          align: 'center',
        });
        doc
          .fontSize(9.5)
          .fillColor('#64748b')
          .text(`Period: Month ${data.month} / Year ${data.year}`, 40, 133, { align: 'center' });

        // Divider
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(40, 150).lineTo(555, 150).stroke();

        // Employee Info Box (85px height)
        doc.rect(40, 158, 515, 80).fillAndStroke('#f8fafc', '#e2e8f0');
        doc.fillColor('#1e293b').fontSize(9);

        doc.font('Helvetica-Bold').text('Employee Code:', 55, 168);
        doc.font('Helvetica').text(data.employeeCode, 145, 168);

        doc.font('Helvetica-Bold').text('Full Name:', 55, 184);
        doc.font('Helvetica').text(data.fullName, 145, 184);

        doc.font('Helvetica-Bold').text('Email:', 55, 200);
        doc.font('Helvetica').text(data.email, 145, 200);

        doc.font('Helvetica-Bold').text('Department:', 320, 168);
        doc.font('Helvetica').text(data.department, 410, 168);

        doc.font('Helvetica-Bold').text('Position:', 320, 184);
        doc.font('Helvetica').text(data.position, 410, 184);

        doc.font('Helvetica-Bold').text('Bank Account:', 320, 200);
        doc
          .font('Helvetica')
          .text(data.bankAccount ? `${data.bankAccount} (${data.bankName || 'NH'})` : 'Chua cap nhat', 410, 200);

        doc.font('Helvetica-Bold').text('Status:', 55, 216);
        doc
          .fillColor(data.isPaid ? '#16a34a' : '#ea580c')
          .text(data.isPaid ? 'PAID / DA CHI TRA' : 'PENDING / CHUA THANH TOAN', 145, 216);

        // Attendance Summary Box
        doc.fillColor('#1e293b');
        doc.rect(40, 246, 515, 25).fillAndStroke('#f1f5f9', '#cbd5e1');
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(`Standard Work Days: ${data.standardDays} days`, 55, 254)
          .text(`Actual Working Days: ${data.actualWorkDays} days`, 320, 254);

        // Table Header
        let y = 280;
        doc.rect(40, y, 515, 22).fill('#1e293b');
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
        doc.text('ITEM / KHOAN MUC', 55, y + 6);
        doc.text('DESCRIPTION / DIEN GIAI', 220, y + 6);
        doc.text('AMOUNT (VND)', 430, y + 6, { width: 110, align: 'right' });

        y += 22;
        const addRow = (title: string, desc: string, amount: string, isBold = false, bg = false) => {
          if (bg) {
            doc.rect(40, y, 515, 20).fill('#f8fafc');
          }
          doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, y + 20).lineTo(555, y + 20).stroke();
          doc
            .fillColor(isBold ? '#0f172a' : '#334155')
            .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(8.5);
          doc.text(title, 55, y + 5);
          doc.text(desc, 220, y + 5);
          doc.text(amount, 430, y + 5, { width: 110, align: 'right' });
          y += 20;
        };

        const proratedBase = Math.round((data.baseSalary / data.standardDays) * data.actualWorkDays);
        const reward = data.rewardAmount || 0;
        const gross = proratedBase + data.allowance + reward;

        // Group 1: Earnings
        addRow('1. Base Salary (Contract)', 'Muc luong can ban tren HDLD', formatVND(data.baseSalary));
        addRow('2. Earned Base Salary', `Prorated (${data.actualWorkDays}/${data.standardDays} days)`, formatVND(proratedBase));
        addRow('3. Monthly Allowance', 'Phu cap an trua, dien thoai, thiet bi', formatVND(data.allowance));
        if (reward > 0) {
          addRow('4. Performance Reward', 'Thuong hieu qua cong viec / Du an', formatVND(reward));
        }
        addRow('TOTAL GROSS INCOME', 'Tong thu nhap truoc khau tru', formatVND(gross), true, true);

        // Group 2: Statutory Deductions & PIT
        const bhxh = data.bhxh || Math.round((data.insuranceSalary || data.baseSalary) * 0.08);
        const bhyt = data.bhyt || Math.round((data.insuranceSalary || data.baseSalary) * 0.015);
        const bhtn = data.bhtn || Math.round((data.insuranceSalary || data.baseSalary) * 0.01);

        addRow('5. Social Insurance (BHXH 8%)', 'Quy BHXH bat buoc NLD dong', `- ${formatVND(bhxh)}`);
        addRow('6. Health Insurance (BHYT 1.5%)', 'Quy BHYT bat buoc NLD dong', `- ${formatVND(bhyt)}`);
        addRow('7. Unemployment Ins. (BHTN 1%)', 'Quy BHTN bat buoc NLD dong', `- ${formatVND(bhtn)}`);
        addRow('8. Personal Tax Relief', 'Giam tru gia canh ban than (11M/thang)', '- 11,000,000 d');
        if (data.taxableIncome !== undefined && data.taxableIncome > 0) {
          addRow('Taxable Income (TNTT)', 'Thu nhap tinh thue sau giam tru', formatVND(data.taxableIncome), false, true);
        }
        addRow('9. Personal Income Tax (PIT)', 'Thue TNCN bieu luy tien 7 bac', `- ${formatVND(data.tax)}`);
        addRow('TOTAL DEDUCTIONS', 'Tong cac khoan giam tru & thue', `- ${formatVND(data.deductions + data.tax)}`, true, true);

        // Net Salary Box
        y += 10;
        doc.rect(40, y, 515, 42).fillAndStroke('#0f172a', '#0f172a');
        doc.fillColor('#94a3b8').fontSize(8.5).text('NET TAKE-HOME SALARY / THUC LINH CHUYEN KHOAN:', 55, y + 8);
        doc
          .fillColor('#38bdf8')
          .fontSize(15)
          .font('Helvetica-Bold')
          .text(formatVND(data.netSalary), 55, y + 21);

        // Signatures Section
        y += 65;
        doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold');
        doc.text('NGUOI LAO DONG', 80, y);
        doc.text('KE TOAN & GIAM DOC NHAN SU', 360, y);

        doc.font('Helvetica').fontSize(8).fillColor('#94a3b8');
        doc.text('(Ky va xac nhan da nhan)', 80, y + 12);
        doc.text('(Ky ten, dong dau phe duyet)', 360, y + 12);

        // Footer Note
        doc
          .fontSize(7.5)
          .fillColor('#94a3b8')
          .text(
            'Chung tu dien tu nay duoc xuat tu He thong Quan ly Nhan luc NexNova Technologies. Co gia tri xac thuc thu nhap.',
            40,
            785,
            { align: 'center', width: 515 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
