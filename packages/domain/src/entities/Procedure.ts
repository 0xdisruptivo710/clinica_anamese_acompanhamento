import { Entity } from './Entity';
import { ProcedureId } from '../value-objects/ProcedureId';
import { ProcedureCategory, TreatmentAreaType } from '../value-objects/ProcedureType';
import { ValidationError } from '../errors/ValidationError';

export interface ProcedureProps {
  id: ProcedureId;
  sessionId: string;
  category: ProcedureCategory;
  procedureName: string;
  treatmentAreas: TreatmentAreaType[];
  side?: string;
  technicalDetails: Record<string, unknown>;
  productId?: string;
  quantityUsed?: number;
  immediateResult?: string;
  complications: string[];
  createdAt: Date;
}

export class Procedure extends Entity<ProcedureId> {
  private props: ProcedureProps;

  private constructor(props: ProcedureProps) {
    super(props.id);
    this.props = props;
  }

  static create(props: Omit<ProcedureProps, 'id' | 'createdAt'>): Procedure {
    if (!props.procedureName?.trim()) {
      throw new ValidationError('Procedure name is required', 'procedureName');
    }
    if (!props.treatmentAreas || props.treatmentAreas.length === 0) {
      throw new ValidationError('At least one treatment area is required', 'treatmentAreas');
    }

    return new Procedure({
      ...props,
      id: ProcedureId.generate(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: ProcedureProps): Procedure {
    return new Procedure(props);
  }

  addComplication(complication: string): void {
    if (complication?.trim()) {
      this.props.complications.push(complication.trim());
    }
  }

  setImmediateResult(result: string): void {
    this.props.immediateResult = result;
  }

  get sessionId(): string { return this.props.sessionId; }
  get category(): ProcedureCategory { return this.props.category; }
  get procedureName(): string { return this.props.procedureName; }
  get treatmentAreas(): TreatmentAreaType[] { return [...this.props.treatmentAreas]; }
  get side(): string | undefined { return this.props.side; }
  get technicalDetails(): Record<string, unknown> { return { ...this.props.technicalDetails }; }
  get productId(): string | undefined { return this.props.productId; }
  get quantityUsed(): number | undefined { return this.props.quantityUsed; }
  get immediateResult(): string | undefined { return this.props.immediateResult; }
  get complications(): string[] { return [...this.props.complications]; }
  get createdAt(): Date { return this.props.createdAt; }
}
