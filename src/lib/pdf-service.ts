import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MonthlySchedule, ScheduleLegend } from './types';

export function generatePmmgSchedulePdf(
  schedule: MonthlySchedule,
  legends: ScheduleLegend[]
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const monthNames = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];
  const monthName = monthNames[schedule.mes - 1] || 'MÊS';
  const daysInMonth = new Date(schedule.ano, schedule.mes, 0).getDate();

  // 1. CABEÇALHO OFICIAL PMMG
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ESTADO DE MINAS GERAIS', 148.5, 12, { align: 'center' });
  doc.text('POLÍCIA MILITAR DE MINAS GERAIS', 148.5, 17, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('11ª REGIÃO DA POLÍCIA MILITAR — 2ª COMPANHIA PM INDEPENDENTE', 148.5, 22, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(`2º PELOTÃO PM / SALINAS — ESCALA OPERACIONAL MENSAL — ${monthName} / ${schedule.ano}`, 148.5, 27, { align: 'center' });

  doc.setLineWidth(0.5);
  doc.line(14, 30, 283, 30);

  // 2. MONTAGEM DAS COLUNAS
  const headDays: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    headDays.push(d.toString().padStart(2, '0'));
  }

  const columns = [
    { header: 'EQUIPE', dataKey: 'equipe' },
    { header: 'NOME DE GUERRA', dataKey: 'militar' },
    { header: 'Nº PM', dataKey: 'numero_pm' },
    ...headDays.map((d, index) => ({ header: d, dataKey: `d_${index + 1}` })),
    { header: 'TOTAL S.', dataKey: 'total_serv' }
  ];

  // 3. AGRUPAMENTO DAS LINHAS
  const militaryMap = new Map<string, {
    equipe: string;
    militar: string;
    numero_pm: string;
    days: { [day: number]: string };
    totalServ: number;
  }>();

  schedule.itens.forEach(item => {
    if (!militaryMap.has(item.militar_id)) {
      militaryMap.set(item.militar_id, {
        equipe: item.equipe,
        militar: item.militar_nome || 'Militar',
        numero_pm: item.militar_numero_pm || '-',
        days: {},
        totalServ: 0
      });
    }
    const record = militaryMap.get(item.militar_id)!;
    record.days[item.dia_mes] = item.legenda_codigo;

    const leg = legends.find(l => l.codigo === item.legenda_codigo);
    if (leg && leg.conta_como_servico) {
      record.totalServ++;
    }
  });

  const body = Array.from(militaryMap.values()).map(m => {
    const row: any = {
      equipe: m.equipe,
      militar: m.militar,
      numero_pm: m.numero_pm,
      total_serv: m.totalServ.toString()
    };
    for (let d = 1; d <= daysInMonth; d++) {
      row[`d_${d}`] = m.days[d] || 'F';
    }
    return row;
  });

  // 4. GERAÇÃO DA TABELA
  autoTable(doc, {
    startY: 33,
    head: [columns.map(c => c.header)],
    body: body.map(row => columns.map(c => row[c.dataKey])),
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      halign: 'center',
      valign: 'middle',
      lineColor: [180, 180, 180],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [22, 101, 52], // PMMG Olive Green
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 24, fontStyle: 'bold' },
      1: { halign: 'left', cellWidth: 26, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 16 }
    },
    didParseCell: (data) => {
      // Destaca dias de serviço com fundo sutil
      if (data.section === 'body' && data.column.index >= 3 && data.column.index < 3 + daysInMonth) {
        const val = data.cell.raw;
        if (val === 'S' || val === 'SN') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [220, 252, 231]; // soft green
          data.cell.styles.textColor = [20, 83, 45];
        } else if (val === 'F') {
          data.cell.styles.textColor = [150, 150, 150];
        } else if (val === 'FA' || val === 'L') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [254, 243, 199]; // soft yellow
          data.cell.styles.textColor = [146, 64, 14];
        }
      }
    }
  });

  // 5. LEGENDA E ASSINATURA NO RODAPÉ
  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  
  if (finalY < 175) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('LEGENDA:', 14, finalY + 8);
    
    doc.setFont('helvetica', 'normal');
    const legendText = legends.map(l => `${l.codigo} = ${l.descricao}`).join('   |   ');
    doc.text(legendText, 32, finalY + 8, { maxWidth: 250 });

    // Linhas de Assinatura
    const signY = finalY + 22;
    doc.setLineWidth(0.3);
    doc.line(40, signY, 110, signY);
    doc.line(180, signY, 250, signY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Auxiliar de Gestão / SOF', 75, signY + 4, { align: 'center' });
    doc.text('Comandante do 2º Pelotão PM', 215, signY + 4, { align: 'center' });
  }

  // Baixa o arquivo PDF
  doc.save(`ESCALA_${monthName}_${schedule.ano}_2PEL_SALINAS.pdf`);
}
