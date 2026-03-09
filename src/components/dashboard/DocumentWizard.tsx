import { useState, useRef } from "react";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Upload, Plus, Trash2, FileText, X, AlertCircle, Phone, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDocumentCategories, type DocumentCategoryConfig } from "@/data/documentSubmissionConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ───── Constants ─────

const ACCEPTED_FILE_TYPES = ".pdf,.docx";
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const COUNTRY_CODES = [
  { code: "+237", country: "CM", label: "🇨🇲 +237" },
  { code: "+234", country: "NG", label: "🇳🇬 +234" },
  { code: "+254", country: "KE", label: "🇰🇪 +254" },
  { code: "+233", country: "GH", label: "🇬🇭 +233" },
  { code: "+27", country: "ZA", label: "🇿🇦 +27" },
  { code: "+225", country: "CI", label: "🇨🇮 +225" },
  { code: "+221", country: "SN", label: "🇸🇳 +221" },
  { code: "+256", country: "UG", label: "🇺🇬 +256" },
  { code: "+255", country: "TZ", label: "🇹🇿 +255" },
  { code: "+250", country: "RW", label: "🇷🇼 +250" },
  { code: "+1", country: "US", label: "🇺🇸 +1" },
  { code: "+44", country: "GB", label: "🇬🇧 +44" },
  { code: "+33", country: "FR", label: "🇫🇷 +33" },
  { code: "+49", country: "DE", label: "🇩🇪 +49" },
  { code: "+971", country: "AE", label: "🇦🇪 +971" },
];

// ───── Types ─────

interface KYCPerson {
  id: string;
  name: string;
  role: string;
  idType: "national_id" | "passport";
  uploaded: boolean;
  whatsappCountryCode: string;
  whatsappNumber: string;
  fileUrl?: string;
}

interface OtherDoc {
  id: string;
  name: string;
  uploaded: boolean;
  fileUrl?: string;
}

interface UploadedFile {
  docId: string;
  file: File;
  url?: string;
}

interface WizardState {
  projectDescription: string;
  selectedDocs: Record<string, Set<string>>; // categoryKey -> set of doc ids
  uploadedDocs: Set<string>; // global uploaded doc ids
  uploadedFiles: Map<string, UploadedFile>; // docId -> file info
  kycPersons: KYCPerson[];
  otherDocs: Record<string, OtherDoc[]>; // categoryKey -> other docs
}

// ───── File validation helper ─────

function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "pdf" && ext !== "docx") {
    return `"${file.name}" is not a supported format. Please upload PDF or DOCX files only.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
  }
  return null;
}

// ───── Validation errors ─────

interface ValidationErrors {
  projectDescription?: string;
  projectDocs?: string;
  legal?: string;
  kyc?: string;
  financial?: string;
}

function getSubmissionErrors(state: WizardState): ValidationErrors {
  const errors: ValidationErrors = {};

  // 1. Project description min 100 chars
  if (state.projectDescription.trim().length < 100) {
    errors.projectDescription = "Project description must be at least 100 characters.";
  }

  // 2. Project docs: at least one of business-plan, pitch-deck, project-brochure uploaded
  const requiredProjectDocs = ["business-plan", "pitch-deck", "project-brochure"];
  const hasProjectDoc = requiredProjectDocs.some((id) => state.uploadedDocs.has(id));
  if (!hasProjectDoc) {
    errors.projectDocs = "Upload at least one of: Business Plan, Pitch Deck, or Project Brochure.";
  }

  // 3. Legal: registration-cert uploaded
  if (!state.uploadedDocs.has("registration-cert")) {
    errors.legal = "Business Registration / Incorporation Certificate must be uploaded.";
  }

  // 4. KYC: primary signatory (first person) must have name, role, whatsapp, and ID uploaded
  const primary = state.kycPersons[0];
  if (!primary) {
    errors.kyc = "Primary signatory information is required.";
  } else {
    const missing: string[] = [];
    if (!primary.name.trim()) missing.push("full name");
    if (!primary.role.trim()) missing.push("role");
    if (!primary.whatsappNumber.trim()) missing.push("WhatsApp number");
    if (!primary.uploaded) missing.push("ID document upload");
    if (missing.length > 0) {
      errors.kyc = `Primary signatory is missing: ${missing.join(", ")}.`;
    }
  }

  // 5. Financial: at least one of financial-statements, financial-projections, revenue-records uploaded
  const requiredFinancialDocs = ["financial-statements", "financial-projections", "revenue-records"];
  const hasFinancialDoc = requiredFinancialDocs.some((id) => state.uploadedDocs.has(id));
  if (!hasFinancialDoc) {
    errors.financial = "Upload at least one of: Financial Statements, Financial Projections, or Revenue / Sales Records.";
  }

  return errors;
}

// ───── Step Components ─────

function StepProjectDescription({
  value,
  onChange,
  sector,
}: {
  value: string;
  onChange: (v: string) => void;
  sector: string;
}) {
  const charCount = value.length;
  const isShort = charCount > 0 && charCount < 100;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-foreground">Project Description</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a brief overview of your {sector.toLowerCase()} project. This helps our team understand
          your business before reviewing documents.
        </p>
      </div>
      <Textarea
        placeholder="Describe your project — what it does, where it operates, key objectives, and what the capital will be used for..."
        className={cn("min-h-[180px] bg-secondary border-border", isShort && "border-amber-500 focus-visible:ring-amber-500")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className={cn("text-xs", isShort ? "text-amber-600" : "text-muted-foreground")}>
        {charCount}/2000 characters {isShort && `(minimum 100 required — ${100 - charCount} more needed)`}
      </p>
    </div>
  );
}

function StepSelectAndUpload({
  category,
  selectedDocs,
  uploadedDocs,
  otherDocs,
  uploadingDocId,
  onToggleDoc,
  onUploadDoc,
  onAddOther,
  onRemoveOther,
  onUploadOther,
  onOtherNameChange,
}: {
  category: DocumentCategoryConfig;
  selectedDocs: Set<string>;
  uploadedDocs: Set<string>;
  otherDocs: OtherDoc[];
  uploadingDocId: string | null;
  onToggleDoc: (docId: string) => void;
  onUploadDoc: (docId: string, file: File) => void;
  onAddOther: () => void;
  onRemoveOther: (id: string) => void;
  onUploadOther: (id: string, file: File) => void;
  onOtherNameChange: (id: string, name: string) => void;
}) {
  const handleFileSelect = (docId: string, isOther: boolean) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      if (isOther) {
        onUploadOther(docId, file);
      } else {
        onUploadDoc(docId, file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">{category.label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
      </div>

      <p className="text-xs text-muted-foreground">
        Accepted formats: <span className="font-medium">PDF, DOCX</span> · Max {MAX_FILE_SIZE_MB}MB per file
      </p>

      {/* Selection phase */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Select the documents you have available
        </p>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {category.documents.map((doc) => {
            const isSelected = selectedDocs.has(doc.id);
            const isUploaded = uploadedDocs.has(doc.id);
            const isUploading = uploadingDocId === doc.id;
            return (
              <div key={doc.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleDoc(doc.id)}
                    className="mt-0.5"
                    disabled={isUploading}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                  </div>
                  {isSelected && (
                    isUploaded ? (
                      <span className="flex items-center gap-1 text-xs text-green font-medium shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                      </span>
                    ) : isUploading ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs shrink-0"
                        onClick={() => handleFileSelect(doc.id, false)}
                      >
                        <Upload className="h-3.5 w-3.5" /> Upload
                      </Button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Other documents */}
      {category.allowOther && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Other documents
          </p>
          {otherDocs.map((od) => {
            const isUploading = uploadingDocId === od.id;
            return (
              <div key={od.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Document name..."
                  value={od.name}
                  onChange={(e) => onOtherNameChange(od.id, e.target.value)}
                  className="flex-1 h-8 text-sm bg-secondary border-border"
                  disabled={isUploading}
                />
                {od.uploaded ? (
                  <span className="flex items-center gap-1 text-xs text-green font-medium shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                  </span>
                ) : isUploading ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs shrink-0"
                    onClick={() => handleFileSelect(od.id, true)}
                    disabled={!od.name.trim()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload
                  </Button>
                )}
                <button onClick={() => onRemoveOther(od.id)} className="text-muted-foreground hover:text-destructive" disabled={isUploading}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onAddOther}>
            <Plus className="h-3.5 w-3.5" /> Add Other Document
          </Button>
        </div>
      )}
    </div>
  );
}

function StepKYC({
  persons,
  uploadingPersonId,
  onAddPerson,
  onRemovePerson,
  onUpdatePerson,
  onUploadId,
}: {
  persons: KYCPerson[];
  uploadingPersonId: string | null;
  onAddPerson: () => void;
  onRemovePerson: (id: string) => void;
  onUpdatePerson: (id: string, field: keyof KYCPerson, value: string) => void;
  onUploadId: (id: string, file: File) => void;
}) {
  const handleUploadClick = (personId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      onUploadId(personId, file);
    };
    input.click();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">Identity & KYC</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provide identity documents for key signatories and management team members.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Accepted formats: <span className="font-medium">PDF, DOCX</span> · Max {MAX_FILE_SIZE_MB}MB per file
        </p>
      </div>

      <div className="space-y-4">
        {persons.map((person, idx) => {
          const isUploading = uploadingPersonId === person.id;
          return (
            <div key={person.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {idx === 0 ? "Primary Signatory" : idx === 1 ? "Secondary Signatory" : `Additional Signatory ${idx - 1}`}
                  {idx === 0 && <span className="text-destructive ml-1">*</span>}
                </span>
                {idx > 1 && (
                  <button onClick={() => onRemovePerson(person.id)} className="text-muted-foreground hover:text-destructive" disabled={isUploading}>
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Full Name {idx === 0 && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    placeholder="Full legal name"
                    value={person.name}
                    onChange={(e) => onUpdatePerson(person.id, "name", e.target.value)}
                    className="h-9 text-sm bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Role / Title {idx === 0 && <span className="text-destructive">*</span>}
                  </label>
                  <Input
                    placeholder="e.g. Director, CEO"
                    value={person.role}
                    onChange={(e) => onUpdatePerson(person.id, "role", e.target.value)}
                    className="h-9 text-sm bg-secondary border-border"
                  />
                </div>
              </div>

              {/* WhatsApp number */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1">
                  <Phone className="h-3 w-3" /> WhatsApp Number {idx === 0 && <span className="text-destructive">*</span>}
                </label>
                <div className="flex gap-2">
                  <Select
                    value={person.whatsappCountryCode}
                    onValueChange={(v) => onUpdatePerson(person.id, "whatsappCountryCode", v)}
                  >
                    <SelectTrigger className="w-[120px] h-9 text-sm bg-secondary border-border">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_CODES.map((cc) => (
                        <SelectItem key={cc.code} value={cc.code}>
                          {cc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="e.g. 6 70 00 00 00"
                    value={person.whatsappNumber}
                    onChange={(e) => onUpdatePerson(person.id, "whatsappNumber", e.target.value.replace(/[^0-9\s]/g, ""))}
                    className="flex-1 h-9 text-sm bg-secondary border-border"
                    type="tel"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">ID Type</label>
                <div className="flex gap-3">
                  {[
                    { value: "national_id", label: "National ID" },
                    { value: "passport", label: "Passport" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdatePerson(person.id, "idType", opt.value)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full border transition-colors",
                        person.idType === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {person.uploaded ? (
                  <span className="flex items-center gap-1 text-xs text-green font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> ID Uploaded
                  </span>
                ) : isUploading ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleUploadClick(person.id)}
                    disabled={!person.name.trim()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload {person.idType === "passport" ? "Passport" : "National ID"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={onAddPerson}>
        <Plus className="h-3.5 w-3.5" /> Add Another Person
      </Button>

      <p className="text-xs text-muted-foreground">
        You can also upload management team CVs or resumes as additional supporting documents.
      </p>
    </div>
  );
}

// ───── Validation Summary ─────

function ValidationSummary({ errors }: { errors: ValidationErrors }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
        <span className="text-sm font-semibold text-destructive">Please complete the following before submitting:</span>
      </div>
      <ul className="space-y-1 ml-6">
        {entries.map(([key, msg]) => (
          <li key={key} className="text-xs text-destructive list-disc">{msg}</li>
        ))}
      </ul>
    </div>
  );
}

// ───── Main Wizard ─────

interface DocumentWizardProps {
  sector: string;
  onBack: () => void;
  spvId?: string;
}

export function DocumentWizard({ sector, onBack, spvId }: DocumentWizardProps) {
  const { user } = useAuth();
  const categories = getDocumentCategories(sector);
  // Steps: 0 = project description, 1..N = categories
  const totalSteps = 1 + categories.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadingPersonId, setUploadingPersonId] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    projectDescription: "",
    selectedDocs: {},
    uploadedDocs: new Set(),
    uploadedFiles: new Map(),
    kycPersons: [
      { id: "p1", name: "", role: "", idType: "national_id", uploaded: false, whatsappCountryCode: "+237", whatsappNumber: "" },
      { id: "p2", name: "", role: "", idType: "national_id", uploaded: false, whatsappCountryCode: "+237", whatsappNumber: "" },
    ],
    otherDocs: {},
  });

  // Upload file to storage
  const uploadToStorage = async (file: File, docId: string, category: string): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${docId}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${category}/${fileName}`;
    
    const { error } = await supabase.storage
      .from("project-documents")
      .upload(filePath, file);
    
    if (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}: ${error.message}`);
      return null;
    }
    
    return filePath;
  };

  // Helpers
  const toggleDoc = (catKey: string, docId: string) => {
    setState((prev) => {
      const catSet = new Set(prev.selectedDocs[catKey] || []);
      if (catSet.has(docId)) catSet.delete(docId);
      else catSet.add(docId);
      return { ...prev, selectedDocs: { ...prev.selectedDocs, [catKey]: catSet } };
    });
  };

  const uploadDoc = async (docId: string, file: File) => {
    setUploadingDocId(docId);
    
    // Find category for this doc
    let category = "general";
    for (const cat of categories) {
      if (cat.documents.some(d => d.id === docId)) {
        category = cat.key;
        break;
      }
    }
    
    const filePath = await uploadToStorage(file, docId, category);
    
    if (filePath) {
      setState((prev) => {
        const newUploaded = new Set(prev.uploadedDocs);
        newUploaded.add(docId);
        const newFiles = new Map(prev.uploadedFiles);
        newFiles.set(docId, { docId, file, url: filePath });
        return { ...prev, uploadedDocs: newUploaded, uploadedFiles: newFiles };
      });
      toast.success("Document uploaded successfully");
    }
    
    setUploadingDocId(null);
  };

  const addOther = (catKey: string) => {
    setState((prev) => ({
      ...prev,
      otherDocs: {
        ...prev.otherDocs,
        [catKey]: [...(prev.otherDocs[catKey] || []), { id: `other-${Date.now()}`, name: "", uploaded: false }],
      },
    }));
  };

  const removeOther = (catKey: string, id: string) => {
    setState((prev) => ({
      ...prev,
      otherDocs: {
        ...prev.otherDocs,
        [catKey]: (prev.otherDocs[catKey] || []).filter((d) => d.id !== id),
      },
    }));
  };

  const uploadOther = async (catKey: string, id: string, file: File) => {
    setUploadingDocId(id);
    
    const filePath = await uploadToStorage(file, id, catKey);
    
    if (filePath) {
      setState((prev) => ({
        ...prev,
        otherDocs: {
          ...prev.otherDocs,
          [catKey]: (prev.otherDocs[catKey] || []).map((d) => 
            d.id === id ? { ...d, uploaded: true, fileUrl: filePath } : d
          ),
        },
      }));
      toast.success("Document uploaded successfully");
    }
    
    setUploadingDocId(null);
  };

  const otherNameChange = (catKey: string, id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      otherDocs: {
        ...prev.otherDocs,
        [catKey]: (prev.otherDocs[catKey] || []).map((d) => (d.id === id ? { ...d, name } : d)),
      },
    }));
  };

  // KYC helpers
  const addPerson = () => {
    setState((prev) => ({
      ...prev,
      kycPersons: [
        ...prev.kycPersons,
        { id: `p-${Date.now()}`, name: "", role: "", idType: "national_id", uploaded: false, whatsappCountryCode: "+237", whatsappNumber: "" },
      ],
    }));
  };

  const removePerson = (id: string) => {
    setState((prev) => ({
      ...prev,
      kycPersons: prev.kycPersons.filter((p) => p.id !== id),
    }));
  };

  const updatePerson = (id: string, field: keyof KYCPerson, value: string) => {
    setState((prev) => ({
      ...prev,
      kycPersons: prev.kycPersons.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const uploadPersonId = async (id: string, file: File) => {
    setUploadingPersonId(id);
    
    const filePath = await uploadToStorage(file, `kyc-${id}`, "identity");
    
    if (filePath) {
      setState((prev) => ({
        ...prev,
        kycPersons: prev.kycPersons.map((p) =>
          p.id === id ? { ...p, uploaded: true, fileUrl: filePath } : p
        ),
      }));
      toast.success("ID document uploaded successfully");
    }
    
    setUploadingPersonId(null);
  };

  // Calculate total uploaded count
  const totalUploaded =
    state.uploadedDocs.size +
    state.kycPersons.filter((p) => p.uploaded).length +
    Object.values(state.otherDocs).flat().filter((d) => d.uploaded).length;

  const totalSelected =
    Object.values(state.selectedDocs).reduce((sum, s) => sum + s.size, 0) +
    state.kycPersons.length +
    Object.values(state.otherDocs).flat().length;

  // Validation
  const validationErrors = getSubmissionErrors(state);
  const hasErrors = Object.keys(validationErrors).length > 0;

  // Submit all data to database
  const submitToDatabase = async () => {
    if (!user) {
      toast.error("You must be logged in to submit documents");
      return false;
    }

    setIsSubmitting(true);

    try {
      // 1. Create document submission record
      const kycData = state.kycPersons
        .filter(p => p.name.trim() || p.uploaded)
        .map(p => ({
          name: p.name,
          role: p.role,
          idType: p.idType,
          whatsapp: `${p.whatsappCountryCode}${p.whatsappNumber}`,
          fileUrl: p.fileUrl,
        }));

      const { data: submission, error: subError } = await supabase
        .from("document_submissions")
        .insert({
          user_id: user.id,
          spv_id: spvId || null,
          project_description: state.projectDescription,
          kyc_signatories: kycData,
          status: "pending",
        })
        .select()
        .single();

      if (subError) {
        console.error("Submission error:", subError);
        toast.error("Failed to create submission record");
        setIsSubmitting(false);
        return false;
      }

      // 2. If we have an SPV, save document records
      if (spvId) {
        const docRecords: Array<{
          spv_id: string;
          name: string;
          file_url: string;
          category: string;
          doc_type: string;
          uploaded_by: string;
        }> = [];

        // Standard docs
        for (const [docId, fileInfo] of state.uploadedFiles.entries()) {
          let category = "general";
          let docName = docId;
          for (const cat of categories) {
            const doc = cat.documents.find(d => d.id === docId);
            if (doc) {
              category = cat.key;
              docName = doc.name;
              break;
            }
          }
          
          docRecords.push({
            spv_id: spvId,
            name: docName,
            file_url: fileInfo.url || "",
            category,
            doc_type: docId,
            uploaded_by: user.id,
          });
        }

        // Other docs
        for (const [catKey, docs] of Object.entries(state.otherDocs)) {
          for (const doc of docs) {
            if (doc.uploaded && doc.fileUrl) {
              docRecords.push({
                spv_id: spvId,
                name: doc.name,
                file_url: doc.fileUrl,
                category: catKey,
                doc_type: "other",
                uploaded_by: user.id,
              });
            }
          }
        }

        // KYC docs
        for (const person of state.kycPersons) {
          if (person.uploaded && person.fileUrl) {
            docRecords.push({
              spv_id: spvId,
              name: `${person.name} - ${person.idType === "passport" ? "Passport" : "National ID"}`,
              file_url: person.fileUrl,
              category: "identity",
              doc_type: person.idType,
              uploaded_by: user.id,
            });
          }
        }

        if (docRecords.length > 0) {
          const { error: docsError } = await supabase
            .from("spv_documents")
            .insert(docRecords);

          if (docsError) {
            console.error("Documents save error:", docsError);
            // Don't fail the whole submission, just log
          }
        }
      }

      toast.success("Documents submitted successfully!");
      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An error occurred while submitting");
      setIsSubmitting(false);
      return false;
    }
  };

  // Navigation
  const handleNext = async () => {
    if (currentStep === 0 && state.projectDescription.trim().length < 100) {
      toast.error(`Project description needs at least 100 characters (currently ${state.projectDescription.trim().length}).`);
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
      setShowValidationErrors(false);
    } else {
      // Final submit
      if (hasErrors) {
        setShowValidationErrors(true);
        toast.error("Please complete all required sections before submitting.");
        return;
      }
      
      const success = await submitToDatabase();
      if (success) {
        setSubmitted(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setShowValidationErrors(false);
    }
  };

  const isLast = currentStep === totalSteps - 1;
  const currentCategory = currentStep > 0 ? categories[currentStep - 1] : null;

  // Step labels for progress
  const stepLabels = ["Description", ...categories.map((c) => c.label)];

  if (submitted) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
        >
          ← Back to Overview
        </button>
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-green/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-green" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Documents Submitted</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your {totalUploaded} document{totalUploaded !== 1 ? "s" : ""} have been submitted for review.
            Our team will begin processing your application shortly.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSubmitted(false); setCurrentStep(0); }}>
              <FileText className="h-3.5 w-3.5" /> Edit & Add More Documents
            </Button>
            <Button size="sm" className="gap-1.5" onClick={onBack}>
              Return to Dashboard <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 flex items-center gap-1"
        >
          ← Back to Overview
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Document Submission
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload the required documents for your {sector.toLowerCase()} project.
          {totalUploaded > 0 && ` ${totalUploaded} document${totalUploaded > 1 ? "s" : ""} uploaded.`}
        </p>
      </div>

      {/* Step progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {totalSteps}: {stepLabels[currentStep]}</span>
          <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex gap-2 flex-wrap">
        {stepLabels.map((label, idx) => (
          <button
            key={label}
            onClick={() => { setCurrentStep(idx); setShowValidationErrors(false); }}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              idx === currentStep
                ? "bg-primary text-primary-foreground border-primary"
                : idx < currentStep
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40"
            )}
          >
            {idx < currentStep && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
            {label}
          </button>
        ))}
      </div>

      {/* Validation errors on last step */}
      {showValidationErrors && isLast && <ValidationSummary errors={validationErrors} />}

      {/* Step content */}
      <div className="min-h-[300px]">
        {currentStep === 0 && (
          <StepProjectDescription
            value={state.projectDescription}
            onChange={(v) => setState((prev) => ({ ...prev, projectDescription: v }))}
            sector={sector}
          />
        )}
        {currentCategory && currentCategory.key === "identity" && (
          <StepKYC
            persons={state.kycPersons}
            uploadingPersonId={uploadingPersonId}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
            onUpdatePerson={updatePerson}
            onUploadId={uploadPersonId}
          />
        )}
        {currentCategory && currentCategory.key !== "identity" && (
          <StepSelectAndUpload
            category={currentCategory}
            selectedDocs={state.selectedDocs[currentCategory.key] || new Set()}
            uploadedDocs={state.uploadedDocs}
            otherDocs={state.otherDocs[currentCategory.key] || []}
            uploadingDocId={uploadingDocId}
            onToggleDoc={(docId) => toggleDoc(currentCategory.key, docId)}
            onUploadDoc={(docId, file) => uploadDoc(docId, file)}
            onAddOther={() => addOther(currentCategory.key)}
            onRemoveOther={(id) => removeOther(currentCategory.key, id)}
            onUploadOther={(id, file) => uploadOther(currentCategory.key, id, file)}
            onOtherNameChange={(id, name) => otherNameChange(currentCategory.key, id, name)}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
          className="gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>
        <Button size="sm" onClick={handleNext} disabled={isSubmitting} className="gap-1.5">
          {isSubmitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
            </>
          ) : isLast ? (
            "Submit All Documents"
          ) : (
            "Next"
          )}
          {!isSubmitting && <ChevronRight className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
