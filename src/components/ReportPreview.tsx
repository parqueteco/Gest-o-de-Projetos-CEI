import React, { useRef, useState } from 'react';
import { ChevronLeft, Printer, Download, Loader2 } from 'lucide-react';

interface ReportPreviewProps {
  printData: any;
  pilarFilter: string;
  metaFilter: string;
  respFilter: string;
  includeLogs: boolean;
  onClose: () => void;
}

export function ReportPreview({ printData, pilarFilter, metaFilter, respFilter, includeLogs, onClose }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  if (!printData) return null;

  const dateStr = new Date().toLocaleDateString('pt-BR');
  const filterText = `Filtros - Pilar: ${pilarFilter === 'all' ? 'Todos' : pilarFilter} | Meta: ${metaFilter === 'all' ? 'Todas' : metaFilter} | Responsável: ${respFilter === 'all' ? 'Todos' : respFilter}`;

  const handleDownload = async () => {
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default;
      
      const fileNameDate = new Date().toISOString().slice(0,10);
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      
      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42);
      doc.text("Relatório Executivo CEI-MCR", 15, 22);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Data de Emissão: ${dateStr}`, 15, 30);
      doc.text(filterText, 282, 30, { align: 'right' });
      
      // Divider
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.5);
      doc.line(15, 34, 282, 34);
      
      // KPIs
      const boxW = 63.5;
      const gap = 4.5;
      let x = 15;
      const y = 40;
      
      // Progresso
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(x, y, boxW, 22, 'FD');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 116, 139);
      doc.text("PROGRESSO GERAL", x + 4, y + 7);
      doc.setFontSize(18);
      doc.setTextColor(2, 132, 199);
      doc.text(`${printData.stats.percConc}%`, x + 4, y + 17);
      x += boxW + gap;
      
      // Total
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.rect(x, y, boxW, 22, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL ATIVIDADES", x + 4, y + 7);
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(`${printData.stats.total}`, x + 4, y + 17);
      x += boxW + gap;
      
      // Concluidas
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(209, 250, 229);
      doc.rect(x, y, boxW, 22, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(5, 150, 105);
      doc.text("CONCLUIDAS", x + 4, y + 7);
      doc.setFontSize(18);
      doc.setTextColor(4, 120, 87);
      doc.text(`${printData.stats.concluidas}`, x + 4, y + 17);
      x += boxW + gap;
      
      // Atrasadas
      doc.setFillColor(255, 241, 242);
      doc.setDrawColor(255, 228, 230);
      doc.rect(x, y, boxW, 22, 'FD');
      doc.setFontSize(8);
      doc.setTextColor(225, 29, 72);
      doc.text("ATRASADAS / TRAVADAS", x + 4, y + 7);
      doc.setFontSize(18);
      doc.setTextColor(190, 18, 60);
      doc.text(`${printData.stats.atrasadas}`, x + 4, y + 17);
      
      let startY = 70;
      
      Object.keys(printData.metaGroups).sort().forEach((metaName) => {
        const metaTasks = printData.metaGroups[metaName];
        let metaDone = 0;
        metaTasks.forEach((t:any) => { if (t.isDone) metaDone++; });
        const metaProg = metaTasks.length > 0 ? Math.round((metaDone / metaTasks.length) * 100) : 0;
        
        const finalBody: any[] = [];
        let currentAcao = '';
        
        finalBody.push([
          { content: `META: ${metaName} (Progresso: ${metaProg}%)`, colSpan: 5, styles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 } }
        ]);
        
        metaTasks.forEach((t: any) => {
          if (t.acaoRaw !== currentAcao) {
            currentAcao = t.acaoRaw;
            finalBody.push([{ content: `ACAO: ${currentAcao}`, colSpan: 5, styles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold', fontSize: 8 } }]);
          }
          
          let statusColor = [2, 132, 199];
          if (t.isDone) statusColor = [5, 150, 105];
          else if (t.isCritical) statusColor = [220, 38, 38];
          
          let prazoColor = [71, 85, 105];
          let prazoFill = null;
          let prazoFont = 'normal';
          if (t.isDone) {
            prazoColor = [5, 150, 105];
            prazoFont = 'bold';
          } else if (t.isCritical) {
            prazoColor = [220, 38, 38];
            prazoFill = [254, 242, 242];
            prazoFont = 'bold';
          } else if (t.dueInNext7Days) {
            prazoColor = [217, 119, 6];
            prazoFill = [255, 251, 235];
            prazoFont = 'bold';
          }
          
          let ativText = t.isSub ? `  - ${t.ativSub}` : t.ativSub;
          let ativStyle = t.isSub ? { fontStyle: 'italic', textColor: [71, 85, 105] } : { fontStyle: 'bold', textColor: [30, 41, 59] };
          
          finalBody.push([
            { content: t.status, styles: { textColor: statusColor, fontStyle: t.isDone || t.isCritical ? 'bold' : 'normal' } },
            { content: ativText, styles: ativStyle },
            { content: t.resp, styles: { textColor: [51, 65, 85] } },
            { content: t.prazo, styles: { textColor: prazoColor, fillColor: prazoFill, fontStyle: prazoFont } },
            { content: t.indicador, styles: { textColor: [51, 65, 85] } }
          ]);
          
          if (includeLogs && t.log) {
            finalBody.push([
              { content: t.log, colSpan: 5, styles: { fontStyle: 'italic', textColor: [100, 116, 139], fontSize: 8, cellPadding: { top: 1, right: 4, bottom: 4, left: 34 }, lineColor: [255,255,255] } }
            ]);
          }
        });
        
        autoTable(doc, {
          startY: startY,
          head: [['Status', 'Atividade / Subatividade', 'Responsavel', 'Prazo', 'Entregavel']],
          body: finalBody,
          theme: 'grid',
          headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold', lineColor: [226, 232, 240], lineWidth: 0.1 },
          styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.1 },
          columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 107 },
            2: { cellWidth: 43 },
            3: { cellWidth: 32 },
            4: { cellWidth: 53 }
          },
          margin: { top: 15, left: 15, right: 15 },
          pageBreak: 'auto',
          showHead: 'everyPage',
          didDrawPage: (data: any) => {
            // Header for new pages
            if (data.pageNumber > 1) {
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(10);
              doc.setTextColor(15, 23, 42);
              doc.text("Relatório Executivo CEI-MCR (Continuação)", 15, 10);
              doc.setDrawColor(226, 232, 240);
              doc.setLineWidth(0.1);
              doc.line(15, 12, 282, 12);
            }
          }
        });
        
        startY = (doc as any).lastAutoTable.finalY + 10;
      });
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${i} de ${pageCount}`, 282, 202, { align: 'right' });
      }
      
      doc.save(`Relatorio_CEI_MCR_${fileNameDate}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f1f5f9] overflow-y-auto text-[#0f172a] print:bg-[#ffffff] print:p-0">
      {/* Floating Print Controls */}
      <div className="fixed top-4 right-8 z-[10000] flex gap-4 print:hidden bg-[#ffffff]/90 backdrop-blur shadow-lg p-4 rounded-xl border border-[#e2e8f0]">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#475569] hover:bg-[#f1f5f9] transition-colors font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-[#ffffff] transition-colors font-bold shadow-md disabled:opacity-80 disabled:cursor-wait"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando PDF...</>
          ) : (
            <><Download className="w-4 h-4" /> Baixar PDF</>
          )}
        </button>
      </div>

      {/* Print Document Container */}
      <div ref={pdfContainerRef} id="relatorio-print-area" className="max-w-[297mm] mx-auto bg-[#ffffff] min-h-[210mm] p-10 print:max-w-none print:w-full print:p-0 print:shadow-none shadow-xl my-10 print:my-0">
        {/* Header */}
        <div className="border-b-2 border-[#1e293b] pb-6 mb-8">
          <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Relatório Executivo CEI-MCR</h1>
          <div className="flex justify-between items-end mt-2 text-sm text-[#64748b] font-medium">
            <span>Data de Emissão: {dateStr}</span>
            <span>{filterText}</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-lg">
            <span className="block text-xs font-bold text-[#64748b] uppercase">Progresso Geral</span>
            <span className="block text-2xl font-black text-[#0284c7] mt-1">{printData.stats.percConc}%</span>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-lg">
            <span className="block text-xs font-bold text-[#64748b] uppercase">Total Atividades</span>
            <span className="block text-2xl font-black text-[#0f172a] mt-1">{printData.stats.total}</span>
          </div>
          <div className="bg-[#ecfdf5] border border-[#d1fae5] p-4 rounded-lg">
            <span className="block text-xs font-bold text-[#059669] uppercase">Concluídas</span>
            <span className="block text-2xl font-black text-[#047857] mt-1">{printData.stats.concluidas}</span>
          </div>
          <div className="bg-[#fff1f2] border border-[#ffe4e6] p-4 rounded-lg">
            <span className="block text-xs font-bold text-[#e11d48] uppercase">Atrasadas / Travadas</span>
            <span className="block text-2xl font-black text-[#be123c] mt-1">{printData.stats.atrasadas}</span>
          </div>
        </div>

        {/* Hierarchical Body */}
        <div className="space-y-12">
          {Object.keys(printData.metaGroups).sort().map((metaName) => {
            const metaTasks = printData.metaGroups[metaName];
            let metaDone = 0;
            metaTasks.forEach((t:any) => { if (t.isDone) metaDone++; });
            const metaProg = metaTasks.length > 0 ? Math.round((metaDone / metaTasks.length) * 100) : 0;
            
            let currentAcao = '';

            return (
              <div key={metaName} className="print-break-inside-avoid border border-[#e2e8f0] rounded-lg overflow-hidden" style={{ pageBreakInside: 'avoid' }}>
                {/* Meta Header */}
                <div className="bg-[#0f172a] text-[#ffffff] p-3 px-4 flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wide">META: {metaName}</h2>
                  <span className="text-xs font-bold bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full">Progresso: {metaProg}%</span>
                </div>

                {/* Table */}
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[#64748b] uppercase bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <tr>
                      <th className="px-4 py-3 font-bold w-[12%]">Status</th>
                      <th className="px-4 py-3 font-bold w-[40%]">Atividade / Subatividade</th>
                      <th className="px-4 py-3 font-bold w-[16%]">Responsável</th>
                      <th className="px-4 py-3 font-bold w-[12%]">Prazo</th>
                      <th className="px-4 py-3 font-bold w-[20%]">Entregável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metaTasks.map((t: any, idx: number) => {
                      const rows = [];
                      
                      // Ação Header Row
                      if (t.acaoRaw !== currentAcao) {
                        currentAcao = t.acaoRaw;
                        rows.push(
                          <tr key={`acao-${idx}`} className="bg-[#f1f5f9] border-b border-[#e2e8f0]">
                            <td colSpan={5} className="px-4 py-2 font-bold text-[#1e293b] text-xs uppercase tracking-wide">
                              AÇÃO: {currentAcao}
                            </td>
                          </tr>
                        );
                      }

                      // Prazo Highlight Logic
                      let prazoClass = "text-[#475569]"; // normal
                      if (t.isDone) {
                        prazoClass = "text-[#059669] font-semibold";
                      } else if (t.isCritical) {
                        prazoClass = "font-bold text-[#dc2626] bg-[#fef2f2] px-2 py-0.5 rounded inline-block";
                      } else if (t.dueInNext7Days) {
                        prazoClass = "font-semibold text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded inline-block";
                      }

                      // Status Color Logic
                      let statusColor = "text-[#0284c7] font-semibold";
                      if (t.isDone) statusColor = "text-[#059669] font-bold";
                      else if (t.isCritical) statusColor = "text-[#dc2626] font-bold";

                      // Main Task Row
                      rows.push(
                        <tr key={`task-${t.id}`} className={`${includeLogs && t.log ? 'border-b-0' : 'border-b border-[#e2e8f0]'}`}>
                          <td className={`px-4 py-3 align-top ${statusColor}`}>{t.status}</td>
                          <td className="px-4 py-3 align-top">
                            {t.isSub ? (
                              <div className="flex items-start gap-2 italic text-[#475569] pl-4">
                                <span className="text-[#94a3b8] text-lg leading-none pt-0.5">•</span>
                                <span>{t.ativSub}</span>
                              </div>
                            ) : (
                              <span className="font-semibold text-[#1e293b]">{t.ativSub}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-[#334155] text-xs">{t.resp}</td>
                          <td className="px-4 py-3 align-top text-xs"><span className={prazoClass}>{t.prazo}</span></td>
                          <td className="px-4 py-3 align-top text-[#334155] text-xs">{t.indicador}</td>
                        </tr>
                      );

                      // Log Row
                      if (includeLogs && t.log) {
                        rows.push(
                          <tr key={`log-${t.id}`} className="border-b border-[#e2e8f0] bg-[#ffffff]">
                            <td colSpan={5} className="px-4 pb-3 pt-0 text-[11px] italic text-[#64748b] pl-[16%] align-top">
                              {t.log}
                            </td>
                          </tr>
                        );
                      }

                      return rows;
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
