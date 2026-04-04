'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateSession } from '@/lib/hooks/use-sessions';

const PROCEDURE_CATEGORIES = [
  { value: 'facial_botox', label: 'Botox' },
  { value: 'facial_filler', label: 'Preenchimento' },
  { value: 'facial_stimulator', label: 'Estimulador de Colageno' },
  { value: 'facial_skinbooster', label: 'Skinbooster' },
  { value: 'facial_ultraformer', label: 'Ultraformer (Facial)' },
  { value: 'facial_laser', label: 'Laser (Facial)' },
  { value: 'facial_peel', label: 'Peeling' },
  { value: 'facial_led', label: 'LED' },
  { value: 'facial_microneedling', label: 'Microagulhamento' },
  { value: 'body_lipolysis', label: 'Lipolise' },
  { value: 'body_ultraformer', label: 'Ultraformer (Corporal)' },
  { value: 'body_radiofrequency', label: 'Radiofrequencia' },
  { value: 'body_cavitation', label: 'Cavitacao' },
  { value: 'body_lymphatic_drainage', label: 'Drenagem Linfatica' },
  { value: 'body_cryolipolysis', label: 'Criolipolise' },
  { value: 'other', label: 'Outro' },
];

const TREATMENT_AREAS_FACIAL = [
  { value: 'forehead', label: 'Testa' },
  { value: 'glabella', label: 'Glabela' },
  { value: 'crow_feet', label: 'Pes de Galinha' },
  { value: 'nasolabial_folds', label: 'Sulco Nasogeniano' },
  { value: 'lip_upper', label: 'Labio Superior' },
  { value: 'lip_lower', label: 'Labio Inferior' },
  { value: 'chin', label: 'Queixo' },
  { value: 'jaw', label: 'Mandibula' },
  { value: 'cheekbones', label: 'Macas do Rosto' },
  { value: 'under_eye', label: 'Olheiras' },
  { value: 'full_face', label: 'Face Completa' },
];

const TREATMENT_AREAS_BODY = [
  { value: 'abdomen', label: 'Abdomen' },
  { value: 'flanks', label: 'Flancos' },
  { value: 'arms', label: 'Bracos' },
  { value: 'inner_thighs', label: 'Coxas Internas' },
  { value: 'outer_thighs', label: 'Coxas Externas' },
  { value: 'buttocks', label: 'Gluteos' },
  { value: 'back', label: 'Costas' },
  { value: 'full_body', label: 'Corpo Completo' },
];

interface ProcedureEntry {
  category: string;
  procedureName: string;
  treatmentAreas: string[];
  technicalDetails: Record<string, string>;
}

interface SessionFormProps {
  clientId: string;
  clientName: string;
  onSuccess: () => void;
}

export function SessionForm({ clientId, clientName, onSuccess }: SessionFormProps) {
  const createSession = useCreateSession();
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 16));
  const [preSessionNotes, setPreSessionNotes] = useState('');
  const [clientComplaint, setClientComplaint] = useState('');
  const [procedures, setProcedures] = useState<ProcedureEntry[]>([
    { category: '', procedureName: '', treatmentAreas: [], technicalDetails: {} },
  ]);

  const addProcedure = () => {
    setProcedures([
      ...procedures,
      { category: '', procedureName: '', treatmentAreas: [], technicalDetails: {} },
    ]);
  };

  const removeProcedure = (index: number) => {
    setProcedures(procedures.filter((_, i) => i !== index));
  };

  const updateProcedure = (index: number, field: string, value: unknown) => {
    const updated = [...procedures];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setProcedures(updated);
  };

  const getAreasForCategory = (category: string) => {
    if (category.startsWith('body_')) return TREATMENT_AREAS_BODY;
    return TREATMENT_AREAS_FACIAL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createSession.mutateAsync({
        clientId,
        sessionDate,
        preSessionNotes: preSessionNotes || undefined,
        clientComplaint: clientComplaint || undefined,
        procedures: procedures
          .filter((p) => p.category && p.procedureName)
          .map((p) => ({
            category: p.category,
            procedureName: p.procedureName,
            treatmentAreas: p.treatmentAreas,
            technicalDetails: p.technicalDetails,
          })),
      });
      onSuccess();
    } catch {
      // handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-primary/5 p-4">
        <p className="text-sm font-medium">
          Cliente: <span className="text-primary">{clientName}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sessionDate">Data e Hora da Sessao *</Label>
          <Input
            id="sessionDate"
            type="datetime-local"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientComplaint">Queixa Principal</Label>
        <Input
          id="clientComplaint"
          value={clientComplaint}
          onChange={(e) => setClientComplaint(e.target.value)}
          placeholder="O que a cliente gostaria de tratar hoje?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preSessionNotes">Observacoes Pre-Sessao</Label>
        <Textarea
          id="preSessionNotes"
          value={preSessionNotes}
          onChange={(e) => setPreSessionNotes(e.target.value)}
          placeholder="Avaliacao antes de iniciar..."
          rows={2}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Procedimentos</h3>
          <Button type="button" variant="outline" size="sm" onClick={addProcedure}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {procedures.map((proc, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm">Procedimento {index + 1}</CardTitle>
              {procedures.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeProcedure(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={proc.category}
                    onValueChange={(v) => updateProcedure(index, 'category', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCEDURE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nome do Procedimento *</Label>
                  <Input
                    value={proc.procedureName}
                    onChange={(e) => updateProcedure(index, 'procedureName', e.target.value)}
                    placeholder="Ex: Botox Allergan 20U"
                  />
                </div>
              </div>

              {proc.category && (
                <div className="space-y-2">
                  <Label>Areas Tratadas</Label>
                  <div className="flex flex-wrap gap-2">
                    {getAreasForCategory(proc.category).map((area) => {
                      const isSelected = proc.treatmentAreas.includes(area.value);
                      return (
                        <button
                          key={area.value}
                          type="button"
                          onClick={() => {
                            const areas = isSelected
                              ? proc.treatmentAreas.filter((a) => a !== area.value)
                              : [...proc.treatmentAreas, area.value];
                            updateProcedure(index, 'treatmentAreas', areas);
                          }}
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-input hover:bg-accent'
                          }`}
                        >
                          {area.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {proc.category === 'facial_botox' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Unidades Totais</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 20"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          total_units: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Diluicao</Label>
                    <Input
                      placeholder="Ex: 2.5ml"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          dilution: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Produto</Label>
                    <Input
                      placeholder="Ex: Allergan"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          product: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {proc.category === 'facial_filler' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Volume (ml)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Ex: 1.0"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          volume_ml: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tecnica</Label>
                    <Input
                      placeholder="Ex: retrograda linear"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          technique: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Canula/Agulha</Label>
                    <Input
                      placeholder="Ex: canula 25g"
                      onChange={(e) =>
                        updateProcedure(index, 'technicalDetails', {
                          ...proc.technicalDetails,
                          cannula_needle: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {createSession.error && (
        <p className="text-sm text-destructive">
          {createSession.error instanceof Error ? createSession.error.message : 'Erro ao criar sessao'}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={createSession.isPending}>
          {createSession.isPending ? 'Criando...' : 'Criar Sessao'}
        </Button>
      </div>
    </form>
  );
}
