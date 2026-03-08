import { useState } from "react";
import {
  ChevronRight, ChevronLeft, CheckCircle2, Upload, Plus, Trash2, FileText, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getDocumentCategories, type DocumentCategoryConfig } from "@/data/documentSubmissionConfig";

// ───── Types ─────

interface KYCPerson {
  id: string;
  name: string;
  role: string;
  idType: "national_id" | "passport";
  uploaded: boolean;
}

interface OtherDoc {
  id: string;
  name: string;
  uploaded: boolean;
}

interface WizardState {
  projectDescription: string;
  selectedDocs: Record<string, Set<string>>; // categoryKey -> set of doc ids
  uploadedDocs: Set<string>; // global uploaded doc ids
  kycPersons: KYCPerson[];
  otherDocs: Record<string, OtherDoc[]>; // categoryKey -> other docs
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
        className="min-h-[180px] bg-secondary border-border"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        {value.length}/2000 characters
      </p>
    </div>
  );
}

function StepSelectAndUpload({
  category,
  selectedDocs,
  uploadedDocs,
  otherDocs,
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
  onToggleDoc: (docId: string) => void;
  onUploadDoc: (docId: string) => void;
  onAddOther: () => void;
  onRemoveOther: (id: string) => void;
  onUploadOther: (id: string) => void;
  onOtherNameChange: (id: string, name: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">{category.label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
      </div>

      {/* Selection phase */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Select the documents you have available
        </p>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {category.documents.map((doc) => {
            const isSelected = selectedDocs.has(doc.id);
            const isUploaded = uploadedDocs.has(doc.id);
            return (
              <div key={doc.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleDoc(doc.id)}
                    className="mt-0.5"
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
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs shrink-0"
                        onClick={() => onUploadDoc(doc.id)}
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
          {otherDocs.map((od) => (
            <div key={od.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder="Document name..."
                value={od.name}
                onChange={(e) => onOtherNameChange(od.id, e.target.value)}
                className="flex-1 h-8 text-sm bg-secondary border-border"
              />
              {od.uploaded ? (
                <span className="flex items-center gap-1 text-xs text-green font-medium shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs shrink-0"
                  onClick={() => onUploadOther(od.id)}
                  disabled={!od.name.trim()}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
              )}
              <button onClick={() => onRemoveOther(od.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
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
  onAddPerson,
  onRemovePerson,
  onUpdatePerson,
  onUploadId,
}: {
  persons: KYCPerson[];
  onAddPerson: () => void;
  onRemovePerson: (id: string) => void;
  onUpdatePerson: (id: string, field: keyof KYCPerson, value: string) => void;
  onUploadId: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-foreground">Identity & KYC</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provide identity documents for key signatories and management team members.
        </p>
      </div>

      <div className="space-y-4">
        {persons.map((person, idx) => (
          <div key={person.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {idx === 0 ? "Primary Signatory" : idx === 1 ? "Secondary Signatory" : `Additional Signatory ${idx - 1}`}
              </span>
              {idx > 1 && (
                <button onClick={() => onRemovePerson(person.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                <Input
                  placeholder="Full legal name"
                  value={person.name}
                  onChange={(e) => onUpdatePerson(person.id, "name", e.target.value)}
                  className="h-9 text-sm bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Role / Title</label>
                <Input
                  placeholder="e.g. Director, CEO"
                  value={person.role}
                  onChange={(e) => onUpdatePerson(person.id, "role", e.target.value)}
                  className="h-9 text-sm bg-secondary border-border"
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
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => onUploadId(person.id)}
                  disabled={!person.name.trim()}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload {person.idType === "passport" ? "Passport" : "National ID"}
                </Button>
              )}
            </div>
          </div>
        ))}
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

// ───── Main Wizard ─────

interface DocumentWizardProps {
  sector: string;
  onBack: () => void;
}

export function DocumentWizard({ sector, onBack }: DocumentWizardProps) {
  const categories = getDocumentCategories(sector);
  // Steps: 0 = project description, 1..N = categories
  const totalSteps = 1 + categories.length;
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [state, setState] = useState<WizardState>({
    projectDescription: "",
    selectedDocs: {},
    uploadedDocs: new Set(),
    kycPersons: [
      { id: "p1", name: "", role: "", idType: "national_id", uploaded: false },
      { id: "p2", name: "", role: "", idType: "national_id", uploaded: false },
    ],
    otherDocs: {},
  });

  // Helpers
  const toggleDoc = (catKey: string, docId: string) => {
    setState((prev) => {
      const catSet = new Set(prev.selectedDocs[catKey] || []);
      if (catSet.has(docId)) catSet.delete(docId);
      else catSet.add(docId);
      return { ...prev, selectedDocs: { ...prev.selectedDocs, [catKey]: catSet } };
    });
  };

  const uploadDoc = (docId: string) => {
    setState((prev) => {
      const newUploaded = new Set(prev.uploadedDocs);
      newUploaded.add(docId);
      return { ...prev, uploadedDocs: newUploaded };
    });
    toast.success("Document uploaded successfully");
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

  const uploadOther = (catKey: string, id: string) => {
    setState((prev) => ({
      ...prev,
      otherDocs: {
        ...prev.otherDocs,
        [catKey]: (prev.otherDocs[catKey] || []).map((d) => (d.id === id ? { ...d, uploaded: true } : d)),
      },
    }));
    toast.success("Document uploaded successfully");
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
        { id: `p-${Date.now()}`, name: "", role: "", idType: "national_id", uploaded: false },
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

  const uploadPersonId = (id: string) => {
    setState((prev) => ({
      ...prev,
      kycPersons: prev.kycPersons.map((p) =>
        p.id === id ? { ...p, uploaded: true } : p
      ),
    }));
    toast.success("ID document uploaded successfully");
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

  // Navigation
  const handleNext = () => {
    if (currentStep === 0 && !state.projectDescription.trim()) {
      toast.error("Please provide a project description before continuing.");
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const isLast = currentStep === totalSteps - 1;
  const currentCategory = currentStep > 0 ? categories[currentStep - 1] : null;

  // Step labels for progress
  const stepLabels = ["Description", ...categories.map((c) => c.label)];

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
            onClick={() => setCurrentStep(idx)}
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
            onToggleDoc={(docId) => toggleDoc(currentCategory.key, docId)}
            onUploadDoc={uploadDoc}
            onAddOther={() => addOther(currentCategory.key)}
            onRemoveOther={(id) => removeOther(currentCategory.key, id)}
            onUploadOther={(id) => uploadOther(currentCategory.key, id)}
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
          disabled={currentStep === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Previous
        </Button>
        <Button size="sm" onClick={handleNext} className="gap-1.5">
          {isLast ? "Submit All Documents" : "Next"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
