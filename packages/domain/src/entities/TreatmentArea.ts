import { TreatmentAreaType, TREATMENT_AREAS } from '../value-objects/ProcedureType';
import { ValidationError } from '../errors/ValidationError';

export class TreatmentArea {
  private constructor(
    private readonly _area: TreatmentAreaType,
    private readonly _side?: 'left' | 'right' | 'bilateral',
  ) {}

  static create(area: TreatmentAreaType, side?: 'left' | 'right' | 'bilateral'): TreatmentArea {
    if (!TREATMENT_AREAS.includes(area)) {
      throw new ValidationError(`Invalid treatment area: ${area}`, 'treatmentArea');
    }
    return new TreatmentArea(area, side);
  }

  get area(): TreatmentAreaType { return this._area; }
  get side(): string | undefined { return this._side; }

  isFacial(): boolean {
    const facialAreas: TreatmentAreaType[] = [
      'forehead', 'glabella', 'crow_feet', 'bunny_lines', 'nasolabial_folds',
      'marionette_lines', 'lip_upper', 'lip_lower', 'lip_commissure', 'chin',
      'jaw', 'neck', 'under_eye', 'cheekbones', 'nose', 'temple', 'full_face',
    ];
    return facialAreas.includes(this._area);
  }

  isCorporal(): boolean {
    return !this.isFacial();
  }

  equals(other: TreatmentArea): boolean {
    return this._area === other._area && this._side === other._side;
  }
}
