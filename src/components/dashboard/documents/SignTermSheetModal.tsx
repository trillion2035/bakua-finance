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
  const drawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Use refs for drawing state to avoid stale closures
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Set internal resolution to match CSS size exactly (no scaling needed)
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    initCanvas();
    // Re-init on resize
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawingRef.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const endDraw = () => {
    if (drawingRef.current && canvasRef.current) {
      drawingRef.current = false;
      onSignatureChange(canvasRef.current.toDataURL("image/png"));
    }
    drawingRef.current = false;
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

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden border-2 border-gray-300" style={{ background: "#fff" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "160px", cursor: "crosshair", touchAction: "none", display: "block", background: "#fff" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="absolute bottom-4 left-4 right-4 border-b-2 border-dashed" style={{ borderColor: "#d1d5db" }} />
        <span className="absolute bottom-1 left-4 text-[10px]" style={{ color: "#9ca3af" }}>✕ Sign here</span>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "#6b7280" }}>Draw your signature in the box above</p>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          style={{ color: "#6b7280" }}
        >
          <Eraser className="h-3 w-3" /> Clear
        </button>
      </div>
    </div>
  );
}

function TypeSignature({ onSignatureChange }: { onSignatureChange: (data: string | null) => void }) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (typed.trim().length > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 400, 100);
        ctx.font = "italic 32px 'Georgia', serif";
        ctx.fillStyle = "#1a1a1a";
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
      <input
        placeholder="Type your full legal name"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="w-full text-lg px-3 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
        style={{ background: "#fff", color: "#1a1a1a" }}
      />
      {typed && (
        <div className="rounded-lg p-4 flex items-center justify-center h-24 border-2 border-gray-300" style={{ background: "#fff" }}>
          <span className="text-3xl italic font-serif" style={{ color: "#1a1a1a" }}>{typed}</span>
        </div>
      )}
      <p className="text-xs" style={{ color: "#6b7280" }}>Your typed name will serve as your digital signature</p>
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
        className="rounded-lg p-6 text-center cursor-pointer transition-colors border-2 border-dashed border-gray-300 hover:border-blue-400"
        style={{ background: "#f9fafb" }}
      >
        {preview ? (
          <img src={preview} alt="Signature" className="max-h-20 mx-auto" />
        ) : (
          <>
            <Upload className="h-5 w-5 mx-auto mb-2" style={{ color: "#6b7280" }} />
            <p className="text-sm font-medium" style={{ color: "#1a1a1a" }}>Click to upload signature image</p>
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>PNG, JPG — max 2MB, transparent background preferred</p>
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
        <DialogContent className="max-w-md" style={{ background: "#fff", color: "#1a1a1a" }}>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#d1fae5" }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: "#059669" }} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: "#1a1a1a" }}>Term Sheet Signed</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: "#6b7280" }}>
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "#fff", color: "#1a1a1a" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: "#1a1a1a" }}>
            <PenTool className="h-5 w-5" style={{ color: "#2563eb" }} />
            Sign Term Sheet
          </DialogTitle>
          <DialogDescription style={{ color: "#6b7280" }}>
            By signing, you accept the terms and conditions outlined in the Term Sheet. This action is legally binding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="signer-name" className="text-sm font-medium" style={{ color: "#374151" }}>Full Legal Name</label>
            <input
              id="signer-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full px-3 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base"
              style={{ background: "#fff", color: "#1a1a1a" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: "#374151" }}>Signature</label>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setSignatureData(null); }}>
              <TabsList className="w-full" style={{ background: "#f3f4f6", borderRadius: "8px" }}>
                <TabsTrigger
                  value="draw"
                  className="flex-1 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  style={{ color: "#374151" }}
                >
                  <PenTool className="h-3.5 w-3.5" /> Draw
                </TabsTrigger>
                <TabsTrigger
                  value="type"
                  className="flex-1 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  style={{ color: "#374151" }}
                >
                  <Type className="h-3.5 w-3.5" /> Type
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="flex-1 gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  style={{ color: "#374151" }}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="draw" className="mt-3">
                <DrawCanvas onSignatureChange={handleSignatureChange} />
              </TabsContent>
              <TabsContent value="type" className="mt-3">
                <TypeSignature onSignatureChange={handleSignatureChange} />
              </TabsContent>
              <TabsContent value="upload" className="mt-3">
                <UploadSignature onSignatureChange={handleSignatureChange} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: "#f9fafb", color: "#6b7280" }}>
            <p className="font-medium" style={{ color: "#374151" }}>By signing you confirm:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>You have read and understood the Term Sheet</li>
              <li>You are authorized to sign on behalf of your organization</li>
              <li>This digital signature is legally binding</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} style={{ borderColor: "#d1d5db", color: "#374151" }}>Cancel</Button>
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
