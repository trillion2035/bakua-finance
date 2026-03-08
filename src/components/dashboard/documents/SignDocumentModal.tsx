import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  PenLine,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProjectDocument } from "@/data/mockDocumentsData";

interface SignDocumentModalProps {
  doc: ProjectDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSigned?: () => void;
}

export function SignDocumentModal({ doc, open, onOpenChange, onSigned }: SignDocumentModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signed, setSigned] = useState(doc.statusNote === "Signed");
  const { toast } = useToast();

  const handleSign = () => {
    setSigned(true);
    setConfirmOpen(false);
    onSigned?.();
    toast({
      title: "Document signed successfully",
      description: `${doc.name} has been signed and recorded.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {doc.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Review the document details below before signing.
            </DialogDescription>
          </DialogHeader>

          {/* Document preview mock */}
          <div className="bg-muted/50 border border-border rounded-lg p-6 space-y-5">
            {/* Header section */}
            <div className="text-center space-y-1">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground">Bakua Finance</p>
              <h2 className="text-base font-bold text-foreground">Standardised Term Sheet</h2>
              <p className="text-xs text-muted-foreground">SPV-01 · Menoua Highlands Coffee Cooperative</p>
            </div>

            <Separator />

            {/* Key terms grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Facility Amount
                </p>
                <p className="text-sm font-bold text-foreground">47,000,000 FCFA</p>
                <p className="text-[10px] text-muted-foreground">≈ $78,300 USD</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Tenor
                </p>
                <p className="text-sm font-bold text-foreground">36 Months</p>
                <p className="text-[10px] text-muted-foreground">Oct 2024 – Oct 2027</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Effective Rate</p>
                <p className="text-sm font-bold text-foreground">12.5% p.a.</p>
                <p className="text-[10px] text-muted-foreground">Fixed rate, quarterly compounding</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Target IRR</p>
                <p className="text-sm font-bold text-foreground">19.2%</p>
                <p className="text-[10px] text-muted-foreground">Net of fees to investors</p>
              </div>
            </div>

            <Separator />

            {/* Milestone schedule */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Disbursement Milestones</p>
              <div className="space-y-1.5 text-xs">
                {[
                  { milestone: "M1 — Land preparation & inputs", amount: "14.1M FCFA", pct: "30%" },
                  { milestone: "M2 — Planting & nursery", amount: "9.4M FCFA", pct: "20%" },
                  { milestone: "M3 — Growing season support", amount: "9.4M FCFA", pct: "20%" },
                  { milestone: "M4 — Harvest & processing", amount: "9.4M FCFA", pct: "20%" },
                  { milestone: "M5 — Export & settlement", amount: "4.7M FCFA", pct: "10%" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{m.milestone}</span>
                    <span className="font-semibold text-foreground">{m.amount} <span className="text-muted-foreground font-normal">({m.pct})</span></span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Security package */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                <Shield className="h-3 w-3" /> Security Package
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>First-ranking land charge over 480ha (12 parcels)</li>
                <li>Chattel security over equipment and inventory</li>
                <li>Assignment of off-take proceeds (Sucafina contract)</li>
                <li>Blocked collection account at UBA Cameroon</li>
                <li>Personal guarantees from 2 signatories</li>
                <li>Crop insurance assignment</li>
              </ul>
            </div>
          </div>

          {/* File info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Generated: {doc.uploadedDate}
            </span>
            <span>{doc.fileName} · {doc.fileSize}</span>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            {signed ? (
              <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Signed
              </Badge>
            ) : (
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setConfirmOpen(true)}
              >
                <PenLine className="h-3.5 w-3.5" /> Accept & Sign
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Signature</AlertDialogTitle>
            <AlertDialogDescription>
              By signing this Term Sheet, you accept the terms and conditions outlined in the document.
              This action will be recorded on the platform. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSign}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <PenLine className="h-3.5 w-3.5 mr-1.5" /> Yes, Sign Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
