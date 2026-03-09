import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Type, Upload, Loader2, CheckCircle2, Eraser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SignTermSheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  analysisReportId: string;
}

function DrawCanvas({ onSignatureChange }: { onSignatureChange: (data: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (hasDrawn && canvasRef.current) {
      onSignatureChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative border border-border rounded-lg bg-background overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="absolute bottom-2 left-3 right-3 border-b border-dashed border-muted-foreground/30" />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Draw your signature above</p>
        <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-xs h-7">
          <Eraser className="h-3 w-3" /> Clear
        </Button>
      </div>
    </div>
  );
}

function TypeSignature({ onSignatureChange }: { onSignatureChange: (data: string | null) => void }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (typed.trim().length > 0) {
      // Create a canvas with the typed text as signature
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, 400, 100);
        ctx.font = "italic 32px 'Georgia', serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typed, 200, 50);
        onSignatureChange(canvas.toDataURL("image/png"));
      }
    } else {
      onSignatureChange(null);
    }
  }, [typed, onSignatureChange]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Type your full legal name"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="text-lg"
      />
      {typed && (
        <div className="border border-border rounded-lg bg-background p-4 flex items-center justify-center h-24">
          <span className="text-3xl italic font-serif text-foreground">{typed}</span>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Your typed name will serve as your digital signature</p>
    </div>
  );
}

function UploadSignature({ onSignatureChange }: { onSignatureChange: (data: string | null) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Max 2MB" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPreview(data);
      onSignatureChange(data);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileRef.current?.click()}
        className="border border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/10 transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Signature" className="max-h-20 mx-auto" />
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Click to upload signature image</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG — max 2MB, transparent background preferred</p>
          </>
        )}
        <input ref={fileRef} type="file" className="hidden" accept="image/png,image/jpeg" onChange={handleFile} />
      </div>
    </div>
  );
}

export function SignTermSheetModal({ open, onOpenChange, submissionId, analysisReportId }: SignTermSheetModalProps) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>("draw");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signerName, setSignerName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [signed, setSigned] = useState(false);

  const handleSignatureChange = useCallback((data: string | null) => {
    setSignatureData(data);
  }, []);

  const handleSign = async () => {
    if (!signatureData || !signerName.trim()) {
      toast.error("Please provide your signature and full name");
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("term_sheet_signatures" as any)
        .insert({
          user_id: user.id,
          submission_id: submissionId,
          analysis_report_id: analysisReportId,
          signature_type: tab,
          signature_data: signatureData,
          signer_name: signerName.trim(),
        } as any);

      if (error) throw error;

      setSigned(true);
      queryClient.invalidateQueries({ queryKey: ["term-sheet-signature"] });
      toast.success("Term Sheet signed successfully!", {
        description: "Your signature has been recorded. SPV deployment will begin shortly.",
      });
    } catch (err: any) {
      toast.error("Failed to sign", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (signed) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-green/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Term Sheet Signed</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Your signed term sheet has been recorded. The SPV deployment process will begin shortly.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Sign Term Sheet
          </DialogTitle>
          <DialogDescription>
            By signing, you accept the terms and conditions outlined in the Term Sheet. This action is legally binding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signer-name">Full Legal Name</Label>
            <Input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full legal name"
            />
          </div>

          <div className="space-y-2">
            <Label>Signature</Label>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setSignatureData(null); }}>
              <TabsList className="w-full">
                <TabsTrigger value="draw" className="flex-1 gap-1.5">
                  <PenTool className="h-3.5 w-3.5" /> Draw
                </TabsTrigger>
                <TabsTrigger value="type" className="flex-1 gap-1.5">
                  <Type className="h-3.5 w-3.5" /> Type
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex-1 gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="draw">
                <DrawCanvas onSignatureChange={handleSignatureChange} />
              </TabsContent>
              <TabsContent value="type">
                <TypeSignature onSignatureChange={handleSignatureChange} />
              </TabsContent>
              <TabsContent value="upload">
                <UploadSignature onSignatureChange={handleSignatureChange} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">By signing you confirm:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>You have read and understood the Term Sheet</li>
              <li>You are authorized to sign on behalf of your organization</li>
              <li>This digital signature is legally binding</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSign}
            disabled={!signatureData || !signerName.trim() || saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenTool className="h-4 w-4" />}
            Sign Term Sheet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
