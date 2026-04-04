'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateClient } from '@/lib/hooks/use-clients';

const SKIN_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'dry', label: 'Seca' },
  { value: 'oily', label: 'Oleosa' },
  { value: 'combination', label: 'Mista' },
  { value: 'sensitive', label: 'Sensivel' },
];

const FITZPATRICK_TYPES = [
  { value: 'I', label: 'I - Muito clara' },
  { value: 'II', label: 'II - Clara' },
  { value: 'III', label: 'III - Morena clara' },
  { value: 'IV', label: 'IV - Morena' },
  { value: 'V', label: 'V - Morena escura' },
  { value: 'VI', label: 'VI - Negra' },
];

interface ClientFormProps {
  onSuccess: () => void;
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const createClient = useCreateClient();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    email: '',
    cpf: '',
    dateOfBirth: '',
    skinType: '',
    fitzpatrick: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    previousProcedures: '',
    aestheticGoals: '',
    preferredChannel: 'whatsapp',
    communicationOptIn: true,
    notes: '',
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      email: formData.email || undefined,
      cpf: formData.cpf || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      skinType: formData.skinType || undefined,
      fitzpatrick: formData.fitzpatrick || undefined,
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      medications: formData.medications ? formData.medications.split(',').map((s) => s.trim()) : [],
      medicalConditions: formData.medicalConditions
        ? formData.medicalConditions.split(',').map((s) => s.trim())
        : [],
      previousProcedures: formData.previousProcedures
        ? formData.previousProcedures.split(',').map((s) => s.trim())
        : [],
      aestheticGoals: formData.aestheticGoals || undefined,
      preferredChannel: formData.preferredChannel,
      communicationOptIn: formData.communicationOptIn,
      notes: formData.notes || undefined,
    };

    try {
      await createClient.mutateAsync(payload);
      onSuccess();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Nome completo do cliente"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleChange('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="anamnesis" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Pele</Label>
              <Select value={formData.skinType} onValueChange={(v) => handleChange('skinType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fitzpatrick</Label>
              <Select
                value={formData.fitzpatrick}
                onValueChange={(v) => handleChange('fitzpatrick', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {FITZPATRICK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias</Label>
            <Input
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="Separe por virgula: Dipirona, Latex..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos em Uso</Label>
            <Input
              id="medications"
              value={formData.medications}
              onChange={(e) => handleChange('medications', e.target.value)}
              placeholder="Separe por virgula: Roacutan, Anticoncepcional..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Condicoes Medicas</Label>
            <Input
              id="medicalConditions"
              value={formData.medicalConditions}
              onChange={(e) => handleChange('medicalConditions', e.target.value)}
              placeholder="Separe por virgula: Diabetes, Hipertensao..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="previousProcedures">Procedimentos Anteriores</Label>
            <Input
              id="previousProcedures"
              value={formData.previousProcedures}
              onChange={(e) => handleChange('previousProcedures', e.target.value)}
              placeholder="Separe por virgula: Botox 2023, Preenchimento labial..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aestheticGoals">Objetivos Esteticos</Label>
            <Textarea
              id="aestheticGoals"
              value={formData.aestheticGoals}
              onChange={(e) => handleChange('aestheticGoals', e.target.value)}
              placeholder="Descreva os objetivos esteticos da cliente..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Canal de Comunicacao Preferido</Label>
            <Select
              value={formData.preferredChannel}
              onValueChange={(v) => handleChange('preferredChannel', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="communicationOptIn"
              checked={formData.communicationOptIn}
              onChange={(e) => handleChange('communicationOptIn', e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="communicationOptIn" className="font-normal">
              Cliente aceita receber mensagens pos-sessao e acompanhamento
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observacoes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Anotacoes adicionais sobre a cliente..."
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>

      {createClient.error && (
        <p className="text-sm text-destructive">
          {createClient.error instanceof Error ? createClient.error.message : 'Erro ao criar cliente'}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={createClient.isPending}>
          {createClient.isPending ? 'Salvando...' : 'Cadastrar Cliente'}
        </Button>
      </div>
    </form>
  );
}
