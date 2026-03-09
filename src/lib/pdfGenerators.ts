import jsPDF from "jspdf";
import type { AnalysisReport, TermSheet } from "@/hooks/useAnalysisData";

// Common PDF styling
const PRIMARY_COLOR = [34, 139, 230]; // #228BE6
const TEXT_COLOR = [51, 51, 51];
const GRAY_COLOR = [128, 128, 128];
const DANGER_COLOR = [239, 68, 68];
const SUCCESS_COLOR = [34, 197, 94];

function addHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, 210, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 20);
  
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, 20, 28);
  }
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pageHeight = doc.internal.pageSize.height;
  doc.setTextColor(...GRAY_COLOR);
  doc.setFontSize(9);
  doc.text(`Bakua Asset Standardization Platform | Page ${pageNum}`, 20, pageHeight - 10);
  doc.text(new Date().toLocaleDateString(), 190, pageHeight - 10, { align: "right" });
}

// 1. ASSET SCORE DOCUMENT
export function generateAssetScorePDF(report: AnalysisReport, profileName: string): jsPDF {
  const doc = new jsPDF();
  let yPos = 50;
  
  addHeader(doc, "Asset Standardization Score", `${report.grade} - ${report.grade_label}`);
  
  // Score overview
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Assessment", 20, yPos);
  yPos += 10;
  
  // Score display
  const scoreColor = report.total_score >= 90 ? SUCCESS_COLOR :
                     report.total_score >= 75 ? PRIMARY_COLOR :
                     report.total_score >= 60 ? [234, 179, 8] : DANGER_COLOR;
  
  doc.setFillColor(...scoreColor);
  doc.roundedRect(20, yPos, 50, 30, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(report.total_score.toString(), 45, yPos + 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text("Score", 45, yPos + 26, { align: "center" });
  
  // Grade info
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(14);
  doc.text(report.grade, 80, yPos + 12);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(report.grade_label, 80, yPos + 20);
  doc.text(`Document Completeness: ${report.document_completeness_score}%`, 80, yPos + 27);
  
  yPos += 45;
  
  // Project info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Project Owner:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(profileName, 55, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "bold");
  doc.text("Industry:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(report.industry.replace("_", " ").toUpperCase(), 45, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "bold");
  doc.text("Analysis Date:", 20, yPos);
  doc.setFont("helvetica", "normal");
  doc.text(new Date(report.created_at).toLocaleDateString(), 55, yPos);
  yPos += 15;
  
  // Score dimensions
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Score Dimensions", 20, yPos);
  yPos += 8;
  
  if (report.score_dimensions && report.score_dimensions.length > 0) {
    report.score_dimensions.forEach((dim: any) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
        addFooter(doc, 1);
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...TEXT_COLOR);
      doc.text(`${dim.name} (Weight: ${dim.weight}%)`, 20, yPos);
      
      // Progress bar
      const barWidth = 100;
      const fillWidth = (barWidth * dim.score) / 100;
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(20, yPos + 2, barWidth, 4, 1, 1, "FD");
      
      const dimColor = dim.score >= 80 ? SUCCESS_COLOR :
                       dim.score >= 60 ? PRIMARY_COLOR : DANGER_COLOR;
      doc.setFillColor(...dimColor);
      doc.roundedRect(20, yPos + 2, fillWidth, 4, 1, 1, "F");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${dim.score}`, 125, yPos + 5);
      
      yPos += 10;
    });
  }
  
  yPos += 10;
  
  // Risk factors
  if (report.risk_factors && report.risk_factors.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_COLOR);
    doc.text("Risk Factors", 20, yPos);
    yPos += 8;
    
    report.risk_factors.forEach((risk: any) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      const severityColor = risk.severity === "HIGH" ? DANGER_COLOR :
                           risk.severity === "MEDIUM" ? [234, 179, 8] : GRAY_COLOR;
      
      doc.setFillColor(...severityColor);
      doc.roundedRect(20, yPos - 3, 20, 5, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(risk.severity, 30, yPos, { align: "center" });
      
      doc.setTextColor(...TEXT_COLOR);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(risk.factor, 45, yPos);
      yPos += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const mitLines = doc.splitTextToSize(`Mitigation: ${risk.mitigation}`, 150);
      doc.text(mitLines, 45, yPos);
      yPos += mitLines.length * 4 + 5;
    });
  }
  
  addFooter(doc, 1);
  return doc;
}

// 2. PROJECT DOSSIER
export function generateProjectDossierPDF(report: AnalysisReport, submission: any, profileName: string): jsPDF {
  const doc = new jsPDF();
  let yPos = 50;
  
  addHeader(doc, "Project Dossier", `Asset Standardization Analysis`);
  
  // Executive summary
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const summaryLines = doc.splitTextToSize(report.project_summary || "No summary available", 170);
  doc.text(summaryLines, 20, yPos);
  yPos += summaryLines.length * 5 + 10;
  
  // Project details
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Project Details", 20, yPos);
  yPos += 8;
  
  const details = [
    { label: "Project Owner", value: profileName },
    { label: "Industry Sector", value: report.industry.replace("_", " ").toUpperCase() },
    { label: "Submission Date", value: new Date(submission.submitted_at).toLocaleDateString() },
    { label: "Asset Score", value: `${report.grade} (${report.total_score} points)` },
    { label: "Classification", value: report.grade_label },
  ];
  
  doc.setFontSize(10);
  details.forEach(({ label, value }) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 70, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Project description
  if (submission.project_description) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Project Description", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const descLines = doc.splitTextToSize(submission.project_description, 170);
    doc.text(descLines, 20, yPos);
    yPos += descLines.length * 5 + 10;
  }
  
  // Document verification
  if (report.document_verification_log && report.document_verification_log.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Document Verification", 20, yPos);
    yPos += 8;
    
    report.document_verification_log.forEach((docVerif: any) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      const statusColor = docVerif.status === "VERIFIED" ? SUCCESS_COLOR :
                         docVerif.status === "PENDING" ? [234, 179, 8] :
                         docVerif.status === "MISSING" ? DANGER_COLOR : GRAY_COLOR;
      
      doc.setFillColor(...statusColor);
      doc.roundedRect(20, yPos - 3, 20, 5, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(docVerif.status, 30, yPos, { align: "center" });
      
      doc.setTextColor(...TEXT_COLOR);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(docVerif.document, 45, yPos);
      yPos += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Score: ${docVerif.score}/10`, 45, yPos);
      yPos += 4;
      if (docVerif.notes) {
        const noteLines = doc.splitTextToSize(docVerif.notes, 150);
        doc.text(noteLines, 45, yPos);
        yPos += noteLines.length * 4;
      }
      yPos += 5;
    });
  }
  
  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_COLOR);
    doc.text("Recommendations", 20, yPos);
    yPos += 8;
    
    report.recommendations.forEach((rec: any, idx: number) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 30;
      }
      
      const priorityColor = rec.priority === "HIGH" ? DANGER_COLOR :
                           rec.priority === "MEDIUM" ? [234, 179, 8] : GRAY_COLOR;
      
      doc.setFillColor(...priorityColor);
      doc.roundedRect(20, yPos - 3, 18, 5, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(rec.priority, 29, yPos, { align: "center" });
      
      doc.setTextColor(...TEXT_COLOR);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${rec.category}`, 42, yPos);
      yPos += 5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const recLines = doc.splitTextToSize(rec.recommendation, 150);
      doc.text(recLines, 42, yPos);
      yPos += recLines.length * 4 + 2;
      
      doc.setTextColor(...SUCCESS_COLOR);
      doc.setFont("helvetica", "italic");
      doc.text(`Impact: ${rec.potential_score_impact}`, 42, yPos);
      doc.setTextColor(...TEXT_COLOR);
      yPos += 8;
    });
  }
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
}

// 3. TERM SHEET
export function generateTermSheetPDF(termSheet: TermSheet, report: AnalysisReport, profileName: string): jsPDF {
  const doc = new jsPDF();
  let yPos = 50;
  
  addHeader(doc, "Term Sheet", `Reference: ${termSheet.reference_code}`);
  
  // Transaction summary
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_COLOR);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Summary", 20, yPos);
  yPos += 8;
  
  const terms = [
    { label: "Transaction Name", value: termSheet.transaction_name || "N/A" },
    { label: "Borrower/Project", value: profileName },
    { label: "Facility Amount", value: `FCFA ${termSheet.facility_amount_fcfa?.toLocaleString() || "N/A"} (${termSheet.facility_amount_usd || "N/A"})` },
    { label: "Tenor", value: `${termSheet.tenor_months} months` },
    { label: "Target IRR", value: termSheet.target_irr || "N/A" },
    { label: "Effective Rate", value: termSheet.effective_rate || "N/A" },
    { label: "Asset Score", value: `${report.grade} (${report.total_score} points)` },
    { label: "Valid Until", value: new Date(termSheet.valid_until).toLocaleDateString() },
  ];
  
  doc.setFontSize(10);
  terms.forEach(({ label, value }) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 75, yPos);
    yPos += 6;
  });
  
  yPos += 10;
  
  // Milestones
  if (termSheet.milestones && termSheet.milestones.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Disbursement Milestones", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    termSheet.milestones.forEach((milestone: any, idx: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFont("helvetica", "bold");
      doc.text(`Milestone ${idx + 1}:`, 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(milestone.name || milestone.description || "N/A", 50, yPos);
      yPos += 5;
      
      doc.text(`Amount: ${milestone.amount || "N/A"}`, 25, yPos);
      yPos += 5;
      if (milestone.condition) {
        const condLines = doc.splitTextToSize(`Condition: ${milestone.condition}`, 165);
        doc.text(condLines, 25, yPos);
        yPos += condLines.length * 4 + 3;
      }
      yPos += 2;
    });
  }
  
  yPos += 5;
  
  // Conditions precedent
  if (termSheet.conditions_precedent && termSheet.conditions_precedent.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Conditions Precedent", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    termSheet.conditions_precedent.forEach((cond: any, idx: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
      const condText = typeof cond === "string" ? cond : cond.description || "N/A";
      const condLines = doc.splitTextToSize(`${idx + 1}. ${condText}`, 170);
      doc.text(condLines, 20, yPos);
      yPos += condLines.length * 4 + 3;
    });
  }
  
  yPos += 5;
  
  // Security package
  if (termSheet.security_package && termSheet.security_package.length > 0) {
    if (yPos > 200) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Security Package", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    termSheet.security_package.forEach((sec: any, idx: number) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 30;
      }
      const secText = typeof sec === "string" ? sec : sec.description || "N/A";
      const secLines = doc.splitTextToSize(`${idx + 1}. ${secText}`, 170);
      doc.text(secLines, 20, yPos);
      yPos += secLines.length * 4 + 3;
    });
  }
  
  // Footer disclaimer
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  }
  
  yPos = doc.internal.pageSize.height - 40;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, 180, 25, "F");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_COLOR);
  doc.setFont("helvetica", "italic");
  const disclaimer = "This term sheet is indicative only and subject to final due diligence, credit committee approval, and execution of definitive documentation. Terms and conditions are subject to change based on market conditions and further analysis.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
  doc.text(disclaimerLines, 20, yPos + 5);
  
  addFooter(doc, doc.getNumberOfPages());
  return doc;
}
